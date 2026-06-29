import { FC } from "react";
import { cn } from "../functions";
import { iconRegistry, type IconName } from "./icons";

export type { IconName } from "./icons";

export type IconColor =
  | "primary"
  | "secondary"
  | "accent"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "muted"
  | "text-primary"
  | "text-secondary"
  | "text-muted"
  | "text-inverse"
  | "inherit"
  | "current";

const colorClasses: Record<IconColor, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
  info: "text-info",
  muted: "text-text-muted",
  "text-primary": "text-text-primary",
  "text-secondary": "text-text-secondary",
  "text-muted": "text-text-muted",
  "text-inverse": "text-text-inverse",
  inherit: "text-inherit",
  current: "text-current",
};

export const Icon: FC<{
  name: IconName;
  size?: number;
  color?: IconColor;
  className?: string;
  suppressHydrationWarning?: boolean;
}> = ({ name, size = 20, color, className, suppressHydrationWarning }) => {
  const LucideIcon = iconRegistry[name];

  if (!LucideIcon) {
    // Fallback for missing icons (should not happen in production)
    console.warn(`Icon "${name}" not found in icon registry`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      className={cn(color && colorClasses[color], className)}
      {...(suppressHydrationWarning && { suppressHydrationWarning })}
    />
  );
};
