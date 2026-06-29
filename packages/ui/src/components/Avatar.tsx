"use client";
import { cn } from "../functions";
import React, { ImgHTMLAttributes, useState } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Shape = "circle" | "rounded";
type Status = "online" | "offline" | "away" | undefined;

const sizeClass: Record<Size, string> = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-xl",
};

const shapeClass: Record<Shape, string> = {
  circle: "rounded-full",
  rounded: "rounded-md",
};

const statusClass: Record<Exclude<Status, undefined>, string> = {
  online: "bg-success",
  offline: "bg-text-muted",
  away: "bg-warning",
};

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
  src?: string;
  alt?: string;
  initials?: string; // fallback initials, auto-generated if not supplied
  size?: Size;
  shape?: Shape;
  status?: Status;
  className?: string;
}

function getInitials(name?: string) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0]?.toUpperCase() ?? "?";
  return (words[0][0] + words[1][0]).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  initials,
  size = "md",
  shape = "circle",
  status,
  className,
  ...rest
}) => {
  const [errored, setErrored] = useState(false);

  // Accessible alt fallback
  const textAlt = alt || initials || "Avatar";
  const fallbackInitials = initials || getInitials(alt || "");

  return (
    <span
      className={cn(
        "inline-block relative bg-surface text-text font-semibold select-none border border-border",
        sizeClass[size],
        shapeClass[shape],
        className,
      )}
      aria-label={textAlt}
      role="img"
    >
      {/* Image or fallback */}
      {src && !errored ? (
        <img
          src={src}
          alt={textAlt}
          className={cn("object-cover w-full h-full", shapeClass[shape])}
          onError={() => setErrored(true)}
          loading="lazy"
          {...rest}
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex items-center justify-center w-full h-full uppercase"
        >
          {fallbackInitials}
        </span>
      )}

      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            "absolute block rounded-full border-2 border-surface",
            {
              "bottom-0 end-0 w-3 h-3": size === "xs" || size === "sm",
              "bottom-0 end-0 w-4 h-4":
                size === "md" || size === "lg" || size === "xl",
            },
            statusClass[status],
          )}
          aria-label={status}
          title={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      )}
    </span>
  );
};

export default Avatar;
