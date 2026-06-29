"use client";

import * as React from "react";
import { useTheme } from "@repo/ui";

export const ThemeToggle: React.FC = () => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      className={`
        relative w-14 h-7 rounded-full transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${isDark ? "bg-gradient-to-r from-primary to-accent" : "bg-gradient-to-r from-warning to-warning-hover"}
        hover:shadow-lg
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-checked={isDark}
      role="switch"
    >
      {/* Toggle Circle */}
      <span
        suppressHydrationWarning
        className={`
          absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md
          transform transition-all duration-300 ease-in-out
          flex items-center justify-center
          ${isDark ? "translate-x-7" : "translate-x-0"}
        `}
      >
        {/* Sun Icon */}
        <svg
          suppressHydrationWarning
          className={`w-4 h-4 text-warning transition-all duration-300 ${
            isDark
              ? "opacity-0 rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>

        {/* Moon Icon */}
        <svg
          suppressHydrationWarning
          className={`absolute w-4 h-4 text-accent transition-all duration-300 ${
            isDark
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </span>

      {/* Background stars for dark mode */}
      <div
        suppressHydrationWarning
        className={`absolute inset-0 flex items-center justify-start pl-2 pointer-events-none transition-opacity duration-300 ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex gap-0.5">
          <span className="w-1 h-1 bg-white rounded-full opacity-70 animate-pulse" />
          <span className="w-0.5 h-0.5 bg-white rounded-full opacity-50 animate-pulse delay-75" />
          <span className="w-1 h-1 bg-white rounded-full opacity-60 animate-pulse delay-150" />
        </div>
      </div>
    </button>
  );
};
