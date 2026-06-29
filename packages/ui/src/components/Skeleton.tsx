"use client";

import React from "react";
import { cn } from "../functions";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 16,
  circle = false,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        "animate-pulse bg-surface border border-border",
        circle ? "rounded-full" : "rounded-md",
        className,
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      role="status"
      aria-label="Loading..."
    />
  );
};
