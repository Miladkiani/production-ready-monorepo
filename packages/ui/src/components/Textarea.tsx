"use client";

import * as React from "react";
import { cn } from "../functions";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-semibold text-text-primary tracking-wide"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "px-4 py-3 rounded-lg border-2 bg-surface text-text-primary resize-y min-h-[120px]",
            "placeholder:text-text-muted placeholder:text-sm",
            "transition-all duration-200 ease-in-out",
            // Default state
            "border-border",
            // Focus state
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "focus:shadow-lg focus:shadow-primary/5",
            // Hover state
            "hover:border-border-hover",
            // Error state
            error && "border-error focus:ring-error/20 focus:border-error",
            // Disabled state
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-hover",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />

        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-sm text-error mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
