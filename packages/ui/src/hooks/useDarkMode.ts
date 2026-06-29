"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

export interface UseDarkModeReturn {
  isDark: boolean;
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
  setIsDark: (isDark: boolean) => void;
}

/**
 * Reads the resolved theme from localStorage + system preference.
 * This mirrors the logic in the blocking <script> in layout.tsx.
 *
 * Priority:
 *  1. localStorage "theme" value (user's explicit choice)
 *  2. System / browser prefers-color-scheme
 */
function getResolvedIsDark(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;

    // No explicit user choice → follow OS / browser preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

/** Apply the dark/light class to <html> and persist to localStorage */
function applyTheme(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  try {
    localStorage.setItem("theme", isDark ? "dark" : "light");
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
}

export function useDarkMode(): UseDarkModeReturn {
  // Initialize from localStorage (source of truth), NOT from the DOM class.
  // This avoids the hydration race where useEffect would overwrite the stored
  // preference with the SSR default (false → "light").
  const [isDark, setIsDarkState] = useState<boolean>(getResolvedIsDark);

  // Track whether the initial mount effect has run so we don't overwrite
  // the stored value during hydration.
  const isInitialMount = useRef(true);

  // Sync DOM + localStorage whenever isDark changes, but skip the very first
  // render (the blocking script already set the correct class).
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // On mount, ensure DOM matches resolved value (blocking script may
      // not have run in some edge cases, e.g. client-only navigation).
      if (isDark !== document.documentElement.classList.contains("dark")) {
        applyTheme(isDark);
      }
      return;
    }
    applyTheme(isDark);
  }, [isDark]);

  // Listen for system theme changes (e.g. user switches OS dark mode)
  // Only applies when the user has NOT made an explicit choice.
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem("theme");
      // Only follow OS preference if user hasn't explicitly set a theme
      if (!stored) {
        setIsDarkState(e.matches);
        applyTheme(e.matches);
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        const newIsDark = e.newValue === "dark";
        setIsDarkState(newIsDark);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggle = useCallback(() => {
    setIsDarkState((prev) => {
      const next = !prev;
      applyTheme(next);
      return next;
    });
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    const newIsDark = theme === "dark";
    setIsDarkState(newIsDark);
    applyTheme(newIsDark);
  }, []);

  const setIsDark = useCallback((value: boolean) => {
    setIsDarkState(value);
    applyTheme(value);
  }, []);

  return {
    isDark,
    theme: isDark ? "dark" : "light",
    toggle,
    setTheme,
    setIsDark,
  };
}
