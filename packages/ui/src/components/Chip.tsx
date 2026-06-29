// packages/ui/src/Chip.tsx
"use client";

import * as React from "react";
import { cn } from "../functions";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  onRemove?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  color = "primary",
  onRemove,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
        `bg-${color} text-text-inverse`,
        "transition-colors duration-200",

        className,
      )}
      {...props}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "ml-1 flex items-center justify-center w-4 h-4 rounded-full",
            "hover:bg-text-inverse/20 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-border",
          )}
          aria-label={`Remove ${label}`}
        >
          ✕
        </button>
      )}
    </div>
  );
};
