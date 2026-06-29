"use client";

import { memo, useCallback } from "react";
import { Modal } from "./Modal";
import { Typography } from "./Typography";
import { Button } from "./Button";
import type { ButtonColor } from "./Button";

export type ConfirmationVariant = "danger" | "warning" | "info";

export interface ConfirmationAction {
  label: string;
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export interface ConfirmationModalProps {
  /**
   * Controls the modal's visibility
   */
  open: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title: string;

  /**
   * Modal description/message
   */
  description: string | React.ReactNode;

  /**
   * Visual variant determining color scheme
   * @default "info"
   */
  variant?: ConfirmationVariant;

  /**
   * Optional custom actions. If not provided, shows Cancel and Confirm buttons
   */
  actions?: {
    /**
     * Primary/confirm action (e.g., Delete, Confirm)
     */
    confirm?: ConfirmationAction;

    /**
     * Cancel/discard action
     */
    cancel?: ConfirmationAction;
  };

  /**
   * Size of the modal
   * @default "sm"
   */
  size?: "sm" | "md" | "lg" | "xl";

  /**
   * ARIA label for accessibility
   */
  "aria-label"?: string;
}

/**
 * ConfirmationModal - A reusable confirmation dialog component
 *
 * Features:
 * - Accessible: Full keyboard navigation, ARIA attributes, focus management
 * - Flexible: Support for danger, warning, and info variants
 * - Customizable: Optional custom actions or default Cancel/Confirm
 * - Performance: Memoized to prevent unnecessary re-renders
 *
 * @example
 * ```tsx
 * <ConfirmationModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Delete Item?"
 *   description="Are you sure you want to delete this item? This action cannot be undone."
 *   variant="danger"
 *   actions={{
 *     confirm: {
 *       label: "Delete",
 *       onClick: handleDelete,
 *       isLoading: isDeleting
 *     },
 *     cancel: {
 *       label: "Cancel",
 *       onClick: () => setShowModal(false)
 *     }
 *   }}
 * />
 * ```
 */
export const ConfirmationModal = memo<ConfirmationModalProps>(
  function ConfirmationModal({
    open,
    onClose,
    title,
    description,
    variant = "info",
    actions,
    size = "sm",
    "aria-label": ariaLabel,
  }) {
    // Map variant to button color
    const confirmColor: ButtonColor =
      variant === "danger"
        ? "danger"
        : variant === "warning"
          ? "warning"
          : "info";

    // Default confirm action
    const defaultConfirmAction: ConfirmationAction = {
      label: "Confirm",
      onClick: onClose,
    };

    // Default cancel action
    const defaultCancelAction: ConfirmationAction = {
      label: "Cancel",
      onClick: onClose,
    };

    const confirmAction = actions?.confirm ?? defaultConfirmAction;
    const cancelAction = actions?.cancel ?? defaultCancelAction;

    // Handle confirm with loading state
    const handleConfirm = useCallback(async () => {
      try {
        await confirmAction.onClick();
      } catch (error) {
        // Let parent handle error
        console.error("Confirmation action failed:", error);
      }
    }, [confirmAction]);

    // Handle cancel
    const handleCancel = useCallback(async () => {
      try {
        await cancelAction.onClick();
      } catch (error) {
        console.error("Cancel action failed:", error);
      }
    }, [cancelAction]);

    // Determine if any action is loading
    const isAnyLoading = confirmAction.isLoading ?? cancelAction.isLoading;

    // Prevent closing when loading
    const handleClose = useCallback(() => {
      if (!isAnyLoading) {
        onClose();
      }
    }, [isAnyLoading, onClose]);

    return (
      <Modal
        open={open}
        onClose={handleClose}
        title={
          <Typography variant="h6" weight="semibold" color="text">
            {title}
          </Typography>
        }
        size={size}
        showClose={!isAnyLoading}
        aria-label={ariaLabel ?? title}
      >
        <div className="space-y-6">
          {/* Description */}
          <div>
            {typeof description === "string" ? (
              <Typography variant="body" color="text-secondary">
                {description}
              </Typography>
            ) : (
              description
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              color="mute"
              onClick={handleCancel}
              disabled={isAnyLoading ?? cancelAction.disabled}
              isLoading={cancelAction.isLoading}
              type="button"
            >
              {cancelAction.label}
            </Button>
            <Button
              variant="solid"
              color={confirmColor}
              onClick={handleConfirm}
              disabled={isAnyLoading ?? confirmAction.disabled}
              isLoading={confirmAction.isLoading}
              type="button"
            >
              {confirmAction.label}
            </Button>
          </div>
        </div>
      </Modal>
    );
  },
);
