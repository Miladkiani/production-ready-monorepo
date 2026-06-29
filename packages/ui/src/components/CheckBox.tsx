"use client";

import { cn } from "../functions";
import React, {
  InputHTMLAttributes,
  forwardRef,
  useRef,
  useEffect,
} from "react";
import { Typography } from "./Typography";

// Tokens/colors: adjust classNames for your design system
type CheckboxColor = "primary" | "success" | "warning" | "error";
interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "label"> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  color?: CheckboxColor;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      hint,
      error,
      color = "primary",
      indeterminate = false,
      disabled,
      required,
      className,
      id,
      ...rest
    },
    refProp,
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);

    // Forward ref to allow external control
    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const inputId =
      id || `checkbox-${rest.name ?? Math.random().toString(36).slice(2)}`;
    const describedBy = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined;

    return (
      <div className="mb-sm flex flex-col items-start">
        <label
          htmlFor={inputId}
          className="flex items-center gap-x-sm cursor-pointer"
        >
          <span className="relative inline-flex items-center">
            <input
              type="checkbox"
              id={inputId}
              ref={(node) => {
                if (typeof refProp === "function") refProp(node);
                innerRef.current = node;
              }}
              aria-invalid={!!error}
              aria-describedby={describedBy}
              aria-checked={indeterminate ? "mixed" : undefined}
              disabled={disabled}
              required={required}
              className={cn(
                "peer appearance-none h-5 w-5 border rounded-md transition ring-0",
                "border-border bg-surface checked:bg-primary checked:border-primary",
                "focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "disabled:opacity-60 disabled:cursor-not-allowed select-none",
                {
                  "bg-primary border-primary": indeterminate,
                  [`checked:bg-${color} checked:border-${color}`]:
                    color !== "primary",
                  "border-error": !!error,
                },
                className,
              )}
              {...rest}
            />
            {/* Custom indicator */}
            <span
              className={cn(
                "pointer-events-none absolute left-0 top-0 w-5 h-5 flex items-center justify-center",
              )}
            >
              {/* Checked */}
              <svg
                className={cn(
                  "text-text-inverse",
                  "opacity-0 peer-checked:opacity-100",
                  indeterminate ? "hidden" : "",
                )}
                width={18}
                height={18}
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 9l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Indeterminate */}
              {indeterminate && (
                <svg
                  className="text-text-inverse opacity-100"
                  width={18}
                  height={18}
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x={4}
                    y={8}
                    width={10}
                    height={2}
                    rx={1}
                    fill="currentColor"
                  />
                </svg>
              )}
            </span>
          </span>
          {label && (
            <Typography
              as="span"
              variant="body"
              color={disabled ? "muted" : "text"}
              className="ms-xs"
            >
              {label}
              {required && <span className="text-error ms-0.5">*</span>}
            </Typography>
          )}
        </label>
        {hint && !error && (
          <Typography as="div" variant="caption" color="muted" id={describedBy}>
            {hint}
          </Typography>
        )}
        {error && (
          <Typography
            as="div"
            variant="caption"
            color="error"
            id={describedBy}
            role="alert"
          >
            {error}
          </Typography>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
