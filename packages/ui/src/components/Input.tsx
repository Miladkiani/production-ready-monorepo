// packages/ui/src/Input.tsx
"use client";

import React from "react";
import { cn } from "../functions";
import { Icon, IconName } from "./Icon";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /**
   * Optional icon to display on the left side of the input
   */
  leftIcon?: IconName;
  /**
   * Optional icon to display on the right side of the input
   */
  rightIcon?: IconName;
  /**
   * Click handler for the right icon (useful for password toggle, clear button, etc.)
   */
  onRightIconClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      className,
      id,
      leftIcon,
      rightIcon,
      onRightIconClick,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold text-text-primary tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon
                name={leftIcon}
                size={18}
                className={cn(
                  "text-text-muted transition-colors",
                  error && "text-error",
                )}
              />
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "px-4 py-3 rounded-lg border-2 bg-surface text-text-primary w-full",
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
              // Icon padding adjustments
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {rightIcon && (
            <div
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                onRightIconClick
                  ? "cursor-pointer hover:text-text-primary transition-colors"
                  : "pointer-events-none",
                disabled && "opacity-50 cursor-not-allowed",
              )}
              onClick={!disabled ? onRightIconClick : undefined}
              role={onRightIconClick ? "button" : undefined}
              tabIndex={onRightIconClick && !disabled ? 0 : undefined}
              onKeyDown={
                onRightIconClick && !disabled
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRightIconClick();
                      }
                    }
                  : undefined
              }
              aria-label={
                onRightIconClick
                  ? props.type === "password"
                    ? "Toggle password visibility"
                    : "Icon action"
                  : undefined
              }
            >
              <Icon
                name={rightIcon}
                size={18}
                className={cn(
                  "text-text-muted transition-colors",
                  error && "text-error",
                )}
              />
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
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

Input.displayName = "Input";
