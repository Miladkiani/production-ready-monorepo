"use client";

import * as React from "react";
import { useTheme } from "./ThemeProvider";
import { Icon } from "./Icon";
import { cn } from "../functions";

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  showLabel = false,
}) => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-surface border border-border",
        "hover:bg-surface-hover hover:border-primary/50",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        "transition-all duration-200",
        "group",
        className,
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      role="switch"
    >
      {/* Icon Container with rotation animation */}
      <div suppressHydrationWarning className="relative w-5 h-5">
        {/* Sun Icon */}
        <Icon
          name="Sun"
          size={20}
          suppressHydrationWarning
          className={cn(
            "absolute inset-0 text-amber-500",
            "transition-all duration-300",
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100",
          )}
        />
        {/* Moon Icon */}
        <Icon
          name="Moon"
          size={20}
          suppressHydrationWarning
          className={cn(
            "absolute inset-0 text-indigo-500",
            "transition-all duration-300",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0",
          )}
        />
      </div>

      {/* Optional Label */}
      {showLabel && (
        <span
          suppressHydrationWarning
          className="text-sm font-medium text-text group-hover:text-primary transition-colors"
        >
          {isDark ? "Dark" : "Light"}
        </span>
      )}

      {/* Subtle glow effect on hover */}
      <div
        suppressHydrationWarning
        className={cn(
          "absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100",
          "transition-opacity duration-200",
          "pointer-events-none",
          isDark
            ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10"
            : "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
        )}
      />
    </button>
  );
};
