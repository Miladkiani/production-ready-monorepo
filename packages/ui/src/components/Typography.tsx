"use client";

import { cn } from "../functions";
import React, {
  ElementType,
  PropsWithChildren,
  forwardRef,
  ComponentPropsWithoutRef,
} from "react";

// Supported HTML tags
type TypographyTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "label"
  | "div";

type Variant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle"
  | "body"
  | "body-strong"
  | "caption"
  | "overline";

type Weight =
  | "thin"
  | "extralight"
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";

type Color =
  | "text"
  | "text-primary"
  | "text-secondary"
  | "text-muted"
  | "primary"
  | "accent"
  | "secondary"
  | "muted"
  | "inverse"
  | "success"
  | "warning"
  | "error"
  | "info";

type Align = "start" | "center" | "end" | "justify";

// Variant defaults
const variantClassMap: Record<Variant, string> = {
  display: "text-4xl md:text-5xl font-bold",
  h1: "text-3xl md:text-4xl font-bold",
  h2: "text-2xl md:text-3xl font-bold",
  h3: "text-xl md:text-2xl font-semibold",
  h4: "text-lg md:text-xl font-semibold",
  h5: "text-base md:text-lg font-medium",
  h6: "text-sm md:text-base font-medium",
  subtitle: "text-base text-muted font-medium",
  body: "text-base font-normal",
  "body-strong": "text-base font-semibold",
  caption: "text-sm text-muted",
  overline: "text-xs uppercase tracking-widest text-muted",
};

const weightClassMap: Record<Weight, string> = {
  thin: "font-thin",
  extralight: "font-extralight",
  light: "font-light",
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
};

const colorClassMap: Record<Color, string> = {
  text: "text-text",
  "text-primary": "text-text-primary",
  "text-secondary": "text-text-secondary",
  "text-muted": "text-text-muted",
  primary: "text-primary",
  accent: "text-accent",
  secondary: "text-secondary",
  muted: "text-muted",
  inverse: "text-text-inverse",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
  info: "text-info",
};

const alignClassMap: Record<Align, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
  justify: "text-justify",
};

const variantDefaultMap: Record<Variant, TypographyTag> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle: "h6",
  body: "p",
  "body-strong": "p",
  caption: "span",
  overline: "span",
};

// Polymorphic Props
type TypographyOwnProps<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  weight?: Weight;
  color?: Color;
  align?: Align;
  className?: string;
};

type TypographyProps<T extends ElementType> = TypographyOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof TypographyOwnProps<T>>;

// Component with better type inference
export const Typography = forwardRef(
  <T extends ElementType = "span">(
    {
      as,
      variant = "body",
      weight,
      color = "text",
      align,
      className,
      children,
      ...rest
    }: TypographyProps<T>,
    ref: React.Ref<Element>,
  ) => {
    const Tag = (as || variantDefaultMap[variant]) as ElementType;

    const classes = cn(
      variantClassMap[variant],
      weight ? weightClassMap[weight] : undefined,
      colorClassMap[color],
      align ? alignClassMap[align] : undefined,
      className,
    );

    return (
      <Tag ref={ref} className={classes} {...rest}>
        {children}
      </Tag>
    );
  },
) as <T extends ElementType = "span">(
  props: TypographyProps<T> & { ref?: React.Ref<Element> },
) => React.ReactElement | null;

export default Typography;
