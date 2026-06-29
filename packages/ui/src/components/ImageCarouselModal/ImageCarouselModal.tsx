"use client";

import { useEffect, useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon";
import { Typography } from "../Typography";

export interface ImageCarouselModalProps {
  /** Array of image URLs to display in the carousel */
  images: string[];
  /** Initial index to display (default: 0) */
  initialIndex?: number;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Image component to use for rendering images (e.g., next/image) */
  ImageComponent: ComponentType<{
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    sizes?: string;
    priority?: boolean;
  }>;
  /** Alt text prefix for images (will append index) */
  altTextPrefix?: string;
  /** Custom className for the modal */
  className?: string;
}

export function ImageCarouselModal({
  images,
  initialIndex = 0,
  open,
  onClose,
  ImageComponent,
  altTextPrefix = "Image",
  className = "",
}: ImageCarouselModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting for portal (SSR safety)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset to initial index when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentIndex, images.length, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Don't render anything if not open or not mounted (SSR safety)
  if (!open || !mounted) return null;

  const showNavigation = images.length > 1;

  // Modal content to be rendered via portal
  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col bg-black ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label="Image carousel modal"
    >
      {/* Top Bar with Close Button - Fixed at top, always visible */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-2">
          {/* Image Counter */}
          <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
            <Typography variant="caption" className="text-white font-medium">
              {currentIndex + 1} / {images.length}
            </Typography>
          </div>
        </div>
        {/* Close Button - Large touch target for mobile */}
        <button
          onClick={onClose}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-white/90 hover:bg-white active:bg-white/80 text-black shadow-lg transition-colors"
          style={{ touchAction: "manipulation" }}
          aria-label="Close modal"
        >
          <Icon name="X" size={28} />
        </button>
      </div>

      {/* Image Container - Full screen with centered image */}
      <div className="flex-1 relative flex items-center justify-center w-full h-full">
        {/* Previous Button */}
        {showNavigation && (
          <button
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 active:bg-black text-white transition-colors"
            style={{ touchAction: "manipulation" }}
            aria-label="Previous image"
          >
            <Icon name="ChevronLeft" size={28} />
          </button>
        )}

        {/* Image */}
        <div className="relative w-full h-full">
          <ImageComponent
            src={images[currentIndex]}
            alt={`${altTextPrefix} ${currentIndex + 1} of ${images.length}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>

        {/* Next Button */}
        {showNavigation && (
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 active:bg-black text-white transition-colors"
            style={{ touchAction: "manipulation" }}
            aria-label="Next image"
          >
            <Icon name="ChevronRight" size={28} />
          </button>
        )}
      </div>

      {/* Bottom Bar - Thumbnail Navigation */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 pb-6 pt-4 flex justify-center"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        {/* Thumbnail Navigation (for 2-5 images) */}
        {images.length > 1 && images.length <= 5 && (
          <div className="flex gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/70 w-3"
                }`}
                style={{ touchAction: "manipulation" }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render via portal to document.body to escape any stacking context
  return createPortal(modalContent, document.body);
}

// Default export for dynamic import
export default ImageCarouselModal;
