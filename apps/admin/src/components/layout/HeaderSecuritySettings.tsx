"use client";

import { useSecuritySettingsModal } from "@admin/lib/contexts/security-settings-context";
import { SecuritySettingsModal } from "@admin/components/SecuritySettingsModal";

/**
 * Header Security Settings Hook
 *
 * Provides security settings menu item and modal for header dropdown integration.
 * Follows GraphMessenger architecture pattern.
 *
 * Usage:
 * ```tsx
 * const { menuItem, modal } = useHeaderSecuritySettings();
 * // Add menuItem to dropdown items
 * // Render modal in header component
 * ```
 */
export function useHeaderSecuritySettings() {
  const { isModalOpen, openModal, closeModal } = useSecuritySettingsModal();

  const menuItem = {
    label: "Security Settings",
    icon: "Shield" as const,
    onClick: openModal,
  };

  const modal = (
    <SecuritySettingsModal open={isModalOpen} onOpenChange={closeModal} />
  );

  return { menuItem, modal };
}
