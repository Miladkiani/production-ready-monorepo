import { cn } from "../functions";
import {
  ElementType,
  HTMLAttributes,
  PropsWithChildren,
  forwardRef,
  memo,
} from "react";

// Acceptable values for tokens
type Variant = "surface" | "outline";
type Rounded = "sm" | "md" | "lg";
type Elevation = 0 | 1 | 2 | 3;

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "as"> {
  as?: ElementType; // e.g. 'section', 'article', 'div'
  variant?: Variant;
  rounded?: Rounded;
  elevation?: Elevation;
  bordered?: boolean;
}

const elevationClass: Record<Elevation, string> = {
  0: "",
  1: "shadow-sm",
  2: "shadow-md",
  3: "shadow-xl",
};

const roundedClass: Record<Rounded, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
};

const variantClass: Record<Variant, string> = {
  surface: "bg-surface",
  outline: "bg-surface border border-border",
};

export const Card = memo(
  forwardRef<HTMLElement, PropsWithChildren<CardProps>>(
    (
      {
        as = "div",
        variant = "surface",
        rounded = "md",
        elevation = 1,
        bordered = false,
        className,
        children,
        ...rest
      },
      ref,
    ) => {
      const Tag = as as ElementType;
      // Bordered is explicit for extra visual effect
      const borderClass =
        bordered && !variantClass[variant].includes("border")
          ? "border border-border"
          : "";

      // Compose className
      const classes = cn(
        "transition-shadow", // for elevation hover/focus
        variantClass[variant],
        elevationClass[elevation],
        roundedClass[rounded],
        borderClass,
        "p-md", // default padding from your tokens
        className,
      );

      return (
        <Tag ref={ref} className={classes} {...rest}>
          {children}
        </Tag>
      );
    },
  ),
);

Card.displayName = "Card";
export default Card;
