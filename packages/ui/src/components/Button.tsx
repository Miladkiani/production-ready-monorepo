"use client";

import React, { memo, useMemo } from "react";
import { cn } from "../functions";
import { Loading } from "./Loading";
import { Icon } from "./Icon";
import { IconName } from "./Icon";

type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "mute";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  isRounded?: boolean;
  icon?: IconName;
  iconOnly?: boolean;
}

const colorClasses: Record<ButtonColor, string> = {
  primary:
    "bg-primary text-text-inverse border-2 border-primary hover:bg-primary-hover hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
  secondary:
    "bg-secondary text-text-inverse border-2 border-secondary hover:bg-secondary-hover hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
  success:
    "bg-success text-text-inverse border-2 border-success hover:bg-success-hover hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
  warning:
    "bg-warning text-text-inverse border-2 border-warning hover:bg-warning-hover hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
  danger:
    "bg-error text-text-inverse border-2 border-error hover:bg-error-hover hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
  info: "bg-info text-text-inverse border-2 border-info hover:bg-info-hover hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
  mute: "bg-surface text-text-primary border-2 border-border hover:bg-surface-hover hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
};

const outlineClasses: Record<ButtonColor, string> = {
  primary:
    "border-2 border-primary text-primary hover:bg-primary/10 hover:border-primary-hover bg-transparent hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
  secondary:
    "border-2 border-secondary text-secondary hover:bg-secondary/10 hover:border-secondary-hover bg-transparent hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
  success:
    "border-2 border-success text-success hover:bg-success/10 hover:border-success-hover bg-transparent hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
  warning:
    "border-2 border-warning text-warning hover:bg-warning/10 hover:border-warning-hover bg-transparent hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
  danger:
    "border-2 border-error text-error hover:bg-error/10 hover:border-error-hover bg-transparent hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
  info: "border-2 border-info text-info hover:bg-info/10 hover:border-info-hover bg-transparent hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
  mute: "border-2 border-border text-text-primary hover:bg-surface hover:border-border-hover bg-transparent hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
};

const ghostClasses: Record<ButtonColor, string> = {
  primary:
    "text-primary hover:bg-primary/10 bg-transparent border-none hover:scale-[1.02] active:scale-[0.98]",
  secondary:
    "text-secondary hover:bg-secondary/10 bg-transparent border-none hover:scale-[1.02] active:scale-[0.98]",
  success:
    "text-success hover:bg-success/10 bg-transparent border-none hover:scale-[1.02] active:scale-[0.98]",
  warning:
    "text-warning hover:bg-warning/10 bg-transparent border-none hover:scale-[1.02] active:scale-[0.98]",
  danger:
    "text-error hover:bg-error/10 bg-transparent border-none hover:scale-[1.02] active:scale-[0.98]",
  info: "text-info hover:bg-info/10 bg-transparent border-none hover:scale-[1.02] active:scale-[0.98]",
  mute: "text-text-muted hover:bg-surface bg-transparent border-none hover:scale-[1.02] active:scale-[0.98]",
};

// Icon size mapping - memoized outside component
const iconSizeMap: Record<ButtonSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
};

export const Button = memo<ButtonProps>(function Button({
  variant = "solid",
  color = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  isRounded = false,
  icon,
  iconOnly = false,
  className,
  children,
  disabled,
  ...props
}) {
  // Memoize variant class to prevent recalculation
  const variantClass = useMemo(() => {
    switch (variant) {
      case "solid":
        return colorClasses[color];
      case "outline":
        return outlineClasses[color];
      case "ghost":
        return ghostClasses[color];
      default:
        return colorClasses[color];
    }
  }, [variant, color]);

  // Memoize icon size
  const iconSize = iconSizeMap[size];

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      aria-disabled={disabled || isLoading || undefined}
      className={cn(
        "inline-flex items-center justify-center font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-lg transition-all",
        variantClass,
        // Regular button sizing
        !iconOnly && size === "xs" && "px-2 py-1 text-xs min-h-[24px]",
        !iconOnly && size === "sm" && "px-3 py-1.5 text-sm min-h-[32px]",
        !iconOnly && size === "md" && "px-4 py-2 text-base min-h-[40px]",
        !iconOnly && size === "lg" && "px-6 py-3 text-lg min-h-[48px]",
        // Icon-only button sizing (square)
        iconOnly && size === "xs" && "p-1 min-w-[24px] min-h-[24px]",
        iconOnly && size === "sm" && "p-1.5 min-w-[32px] min-h-[32px]",
        iconOnly && size === "md" && "p-2 min-w-[40px] min-h-[40px]",
        iconOnly && size === "lg" && "p-3 min-w-[48px] min-h-[48px]",
        isRounded || iconOnly ? "rounded-full" : "rounded-lg",
        fullWidth && !iconOnly && "w-full",
        (disabled || isLoading) &&
          "opacity-60 cursor-not-allowed pointer-events-none",
        className,
      )}
    >
      {isLoading && (
        <Loading
          size={iconSize}
          className={iconOnly ? "" : "me-2"}
          aria-label="Loading"
        />
      )}
      {!isLoading && icon && (
        <Icon
          name={icon}
          size={iconSize}
          className={iconOnly || !children ? "" : "me-2"}
          aria-hidden={!iconOnly}
        />
      )}
      {!iconOnly && children}
    </button>
  );
});

Button.displayName = "Button";
