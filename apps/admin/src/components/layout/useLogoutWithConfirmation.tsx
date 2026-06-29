"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@admin/lib/auth/auth-context";
import { LogoutConfirmationModal } from "../common/LogoutConfirmationModal";

/**
 * Reusable logout hook with confirmation modal
 *
 * This hook provides:
 * - State management for confirmation modal
 * - Logout functionality from auth context
 * - Loading state during logout
 * - Modal component ready to render
 *
 * Usage:
 * ```tsx
 * const { showModal, handleLogoutClick, modal } = useLogoutWithConfirmation();
 *
 * // In your component:
 * <button onClick={handleLogoutClick}>Logout</button>
 * {modal}
 * ```
 */
export function useLogoutWithConfirmation() {
  const { logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleConfirmLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // Don't reset state - user is being redirected
    } catch (error) {
      console.error("Logout failed:", error);
      // Reset on error so user can try again
      setIsLoggingOut(false);
      setShowModal(false);
    }
  }, [logout]);

  const handleCancelLogout = useCallback(() => {
    if (!isLoggingOut) {
      setShowModal(false);
    }
  }, [isLoggingOut]);

  const modal = (
    <LogoutConfirmationModal
      open={showModal}
      onClose={handleCancelLogout}
      onConfirm={handleConfirmLogout}
      isLoading={isLoggingOut}
    />
  );

  return {
    showModal,
    isLoggingOut,
    handleLogoutClick,
    modal,
  };
}
