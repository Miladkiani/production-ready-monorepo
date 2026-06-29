"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../functions";
import { Button } from "./Button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  showClose?: boolean;
  overlayClassName?: string;
  dialogClassName?: string;
  closeLabel?: string;
  "aria-label"?: string;
}

const sizeClass: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-[24rem]", // 384px
  md: "max-w-[32rem]", // 512px
  lg: "max-w-[40rem]", // 640px
  xl: "max-w-[48rem]", // 768px
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = "md",
  children,
  showClose = true,
  overlayClassName,
  dialogClassName,
  closeLabel = "Close dialog",
  "aria-label": ariaLabel,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Trap focus when open
  useEffect(() => {
    if (!open) return;
    const firstFocusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )[0];
    firstFocusable?.focus();

    const handleFocus = (e: FocusEvent) => {
      if (
        dialogRef.current &&
        open &&
        !dialogRef.current.contains(e.target as Node)
      ) {
        e.stopPropagation();
        firstFocusable?.focus();
      }
    };
    document.addEventListener("focus", handleFocus, true);
    return () => document.removeEventListener("focus", handleFocus, true);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (open) {
      const old = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = old;
      };
    }
  }, [open]);

  // Don't render anything if not open or not mounted (SSR safety)
  if (!open || !mounted) return null;

  // Modal content
  const modalContent = (
    <div
      ref={overlayRef}
      aria-modal="true"
      role="dialog"
      aria-label={ariaLabel || (typeof title === "string" ? title : undefined)}
      className={cn(
        // CRITICAL: z-[9999] ensures modal appears above all content
        // Portal to body + high z-index prevents stacking context issues
        "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 overflow-y-auto",
        overlayClassName,
      )}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      tabIndex={-1}
    >
      <div
        ref={dialogRef}
        className={cn(
          "bg-surface rounded-lg shadow-xl w-full p-6 my-auto",
          // Responsive max-height with better mobile support
          "max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]",
          // Responsive sizing
          "mx-auto",
          sizeClass[size],
          dialogClassName,
        )}
        tabIndex={0}
        style={{ outline: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          {title && (
            <div className="flex-1 mr-2" id="modal-title">
              {title}
            </div>
          )}
          {showClose && (
            <Button
              onClick={onClose}
              className="flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={closeLabel}
              icon="X"
              iconOnly
              color="mute"
            />
          )}
        </div>
        <div className="overflow-y-auto text-text">{children}</div>
      </div>
    </div>
  );

  // Render via portal to document.body to escape any stacking context
  return createPortal(modalContent, document.body);
};

export default Modal;
