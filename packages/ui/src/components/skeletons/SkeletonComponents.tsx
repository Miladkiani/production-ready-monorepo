import {
  SkeletonBox,
  SkeletonCircle,
  SkeletonText,
  SkeletonImage,
} from "./SkeletonPrimitives";

/**
 * SkeletonCard - Card skeleton with image, title, and text lines
 */
interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className = "",
  showImage = true,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div
      className={`rounded-xl border border-card bg-card p-5 space-y-4 ${className}`}
      aria-hidden="true"
    >
      {showImage && <SkeletonImage aspectRatio="video" />}
      <div className="space-y-3">
        <SkeletonText width="3/4" className="h-6" />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <SkeletonText
              key={i}
              width={i === lines - 1 ? "1/2" : "full"}
              className="h-4"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonAvatar - Avatar skeleton with optional text
 */
interface SkeletonAvatarProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function SkeletonAvatar({
  className = "",
  size = "md",
  showText = false,
}: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <SkeletonCircle className={sizeClasses[size]} />
      {showText && (
        <div className="flex-1 space-y-2">
          <SkeletonText width="1/2" className="h-4" />
          <SkeletonText width="1/4" className="h-3" />
        </div>
      )}
    </div>
  );
}

/**
 * SkeletonList - List of skeleton items
 */
interface SkeletonListProps {
  className?: string;
  count?: number;
  gap?: "sm" | "md" | "lg";
}

export function SkeletonList({
  className = "",
  count = 3,
  gap = "md",
}: SkeletonListProps) {
  const gapClasses = {
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
  };

  return (
    <div className={`${gapClasses[gap]} ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonCircle className="w-10 h-10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonText width="3/4" className="h-4" />
            <SkeletonText width="1/2" className="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonArticle - Article card skeleton
 */
export function SkeletonArticle({ className = "" }: { className?: string }) {
  return (
    <article
      className={`group rounded-xl border border-card shadow-card bg-card overflow-hidden flex flex-col h-full ${className}`}
      aria-hidden="true"
    >
      {/* Thumbnail */}
      <SkeletonImage aspectRatio="video" className="rounded-none" />

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Date */}
        <div className="flex items-center gap-2">
          <SkeletonBox className="w-4 h-4" />
          <SkeletonText width="1/4" className="h-3" />
        </div>

        {/* Title */}
        <SkeletonText width="full" className="h-6" />
        <SkeletonText width="3/4" className="h-6" />

        {/* Excerpt */}
        <div className="space-y-2 flex-1">
          <SkeletonText width="full" className="h-4" />
          <SkeletonText width="full" className="h-4" />
          <SkeletonText width="1/2" className="h-4" />
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-auto">
          <SkeletonBox className="w-16 h-6 rounded-full" />
          <SkeletonBox className="w-20 h-6 rounded-full" />
          <SkeletonBox className="w-14 h-6 rounded-full" />
        </div>

        {/* Read more */}
        <div className="flex items-center gap-2 mt-2">
          <SkeletonText width="1/4" className="h-4" />
          <SkeletonBox className="w-4 h-4" />
        </div>
      </div>
    </article>
  );
}

/**
 * SkeletonButton - Button skeleton
 */
interface SkeletonButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function SkeletonButton({
  className = "",
  size = "md",
  fullWidth = false,
}: SkeletonButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-20",
    md: "h-10 w-24",
    lg: "h-12 w-32",
  };

  return (
    <SkeletonBox
      className={`rounded-lg ${fullWidth ? "w-full" : sizeClasses[size]} ${className}`}
    />
  );
}

/**
 * SkeletonTable - Table skeleton
 */
interface SkeletonTableProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export function SkeletonTable({
  className = "",
  rows = 5,
  columns = 4,
}: SkeletonTableProps) {
  return (
    <div className={`space-y-4 ${className}`} aria-hidden="true">
      {/* Header */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonText key={i} width="3/4" className="h-5" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonText key={colIndex} width="full" className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}
