"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, Icon } from "@repo/ui";
import { useHeaderSecuritySettings } from "./HeaderSecuritySettings";
import { useLogoutWithConfirmation } from "./useLogoutWithConfirmation";

interface ProfileMenuProps {
  userInitials?: string;
}

/**
 * Profile Menu Component
 *
 * Displays user avatar with dropdown menu including:
 * - Security Settings (via HeaderSecuritySettings hook)
 * - Profile Settings
 * - Logout
 */
export function ProfileMenu({ userInitials = "AU" }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { menuItem: securityMenuItem, modal: securityModal } =
    useHeaderSecuritySettings();
  const { handleLogoutClick, modal: logoutModal } = useLogoutWithConfirmation();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    handleLogoutClick();
  };

  const handleSecuritySettings = () => {
    setIsOpen(false);
    securityMenuItem.onClick();
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Avatar Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
          aria-label="User menu"
          aria-expanded={isOpen}
        >
          <Avatar
            initials={userInitials}
            alt="Admin User"
            size="md"
            status="online"
            className="shadow-md transition-transform group-hover:scale-105 bg-gradient-to-br from-secondary to-secondary/60 text-white border-0"
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-surface border border-border overflow-hidden z-50">
            {/* Security Settings */}
            <button
              type="button"
              onClick={handleSecuritySettings}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-text hover:bg-surface-secondary transition-colors"
            >
              <Icon name="Shield" size={16} className="text-muted" />
              <span>{securityMenuItem.label}</span>
            </button>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors"
            >
              <Icon name="LogOut" size={16} className="text-error" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Security Settings Modal */}
      {securityModal}

      {/* Logout Confirmation Modal */}
      {logoutModal}
    </>
  );
}
