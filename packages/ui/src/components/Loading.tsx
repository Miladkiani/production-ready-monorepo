"use client";

import { cn } from "../functions";
import React from "react";

interface LoadingProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number; // in pixels
  className?: string;
  label?: string; // for accessibility
}

export const Loading: React.FC<LoadingProps> = ({
  size = 16,
  className,
  label = "Loading",
  ...props
}) => {
  return (
    <svg
      {...props}
      className={cn("animate-spin text-current", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="status"
      aria-label={label}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
};
