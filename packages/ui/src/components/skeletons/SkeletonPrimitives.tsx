/**
 * Base skeleton components for loading states
 * These primitives can be composed to create more complex skeleton UIs
 */

interface SkeletonProps {
  className?: string;
}

/**
 * SkeletonBox - Basic rectangular skeleton
 */
export function SkeletonBox({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface rounded-md ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonCircle - Circular skeleton for avatars/icons
 */
export function SkeletonCircle({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface rounded-full ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText - Text line skeleton with natural width variation
 */
interface SkeletonTextProps extends SkeletonProps {
  width?: "full" | "3/4" | "1/2" | "1/4";
}

export function SkeletonText({
  className = "",
  width = "full",
}: SkeletonTextProps) {
  const widthClasses = {
    full: "w-full",
    "3/4": "w-3/4",
    "1/2": "w-1/2",
    "1/4": "w-1/4",
  };

  return (
    <div
      className={`animate-pulse bg-surface rounded h-4 ${widthClasses[width]} ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonLine - Thin line skeleton for dividers/borders
 */
export function SkeletonLine({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface rounded h-px w-full ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonImage - Image/thumbnail skeleton
 */
interface SkeletonImageProps extends SkeletonProps {
  aspectRatio?: "square" | "video" | "portrait";
}

export function SkeletonImage({
  className = "",
  aspectRatio = "video",
}: SkeletonImageProps) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
  };

  return (
    <div
      className={`animate-pulse bg-surface rounded-lg ${aspectClasses[aspectRatio]} ${className}`}
      aria-hidden="true"
    />
  );
}
