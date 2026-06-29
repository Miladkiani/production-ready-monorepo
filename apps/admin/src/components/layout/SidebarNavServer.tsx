"use client";

import { NAV_ITEMS } from "@admin/constants";
import { Icon, Typography } from "@repo/ui";
import { SidebarNavClient } from "./SidebarNavClient";
import { useLogoutWithConfirmation } from "./useLogoutWithConfirmation";

/**
 * Server-rendered sidebar navigation.
 * Only the active state tracking is handled on the client.
 */
export function SidebarNavServer() {
  return (
    <nav
      className="flex flex-col gap-y-2 p-4 w-64 border-e border-border bg-surface h-screen"
      aria-label="Main navigation"
    >
      {/* Logo/Brand Section - Server Rendered */}
      <div className="px-3 py-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center shadow-lg">
            <Icon name="Sparkles" size={20} className="text-white" />
          </div>
          <div>
            <Typography
              variant="h6"
              weight="bold"
              className="text-text leading-tight"
            >
              Admin
            </Typography>
            <Typography
              variant="caption"
              color="muted"
              className="leading-tight"
            >
              Dashboard
            </Typography>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50 mx-2 mb-2" />

      {/* Navigation Items - Client Component for active state */}
      <div className="flex-1 space-y-1">
        <SidebarNavClient items={[...NAV_ITEMS]} />
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50 mx-2 my-2" />

      {/* Bottom Section - Logout Button */}
      <LogoutButton />
    </nav>
  );
}

/**
 * Logout Button Component with Confirmation Modal
 * Separated to keep server component clean
 */
function LogoutButton() {
  const { handleLogoutClick, modal } = useLogoutWithConfirmation();

  return (
    <>
      <button
        type="button"
        onClick={handleLogoutClick}
        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-200 hover:text-error hover:bg-error/5 w-full"
        aria-label="Logout"
      >
        <Icon
          name="LogOut"
          size={20}
          className="group-hover:translate-x-0.5 transition-transform duration-200"
        />
        <span>Logout</span>
      </button>
      {modal}
    </>
  );
}
