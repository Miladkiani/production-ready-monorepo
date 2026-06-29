"use client";

import { Modal, Button, Typography, Icon } from "@repo/ui";

interface LogoutConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Reusable logout confirmation modal
 *
 * This component provides a consistent logout confirmation dialog
 * across the application. It can be used in header, sidebar, mobile menu, etc.
 *
 * Features:
 * - Warning icon and messaging
 * - Loading state during logout
 * - Keyboard accessible
 * - Prevents closing during logout
 */
export function LogoutConfirmationModal({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmationModalProps) {
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Sign Out"
      size="md"
      aria-label="Logout confirmation dialog"
    >
      <div className="space-y-4">
        {/* Icon and Description */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <Icon name="LogOut" size={24} className="text-warning" />
          </div>
          <div>
            <Typography variant="body" color="muted">
              This will end your session
            </Typography>
          </div>
        </div>

        {/* Confirmation Message */}
        <Typography variant="body">
          Are you sure you want to sign out? You&apos;ll need to log in again to
          access the admin panel.
        </Typography>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cancel logout"
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            color="danger"
            onClick={onConfirm}
            disabled={isLoading}
            aria-label="Confirm logout"
          >
            {isLoading ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
