"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, Icon, Typography, type IconName } from "@repo/ui";
import { ADMIN_ROUTES, NAV_ITEMS } from "@admin/constants";
import { useLogoutWithConfirmation } from "./useLogoutWithConfirmation";

interface MobileSidebarProps {
  /** Optional custom trigger element. If not provided, uses default hamburger button */
  trigger?: React.ReactNode;
}

/**
 * Mobile Sidebar Navigation Component
 *
 * Provides a responsive slide-out navigation drawer for mobile devices.
 * Features:
 * - Slide-in animation from left
 * - Backdrop overlay with click-to-close
 * - Keyboard navigation (Escape to close)
 * - Focus trap for accessibility
 * - Auto-close on navigation
 * - Prevents body scroll when open
 */
export function MobileSidebar({ trigger }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { handleLogoutClick, modal } = useLogoutWithConfirmation();

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }

      // Focus trap
      if (event.key === "Tab" && sidebarRef.current) {
        const focusableElements =
          sidebarRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Prevent body scroll when sidebar is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);

    // Focus first focusable element when sidebar opens
    const timer = setTimeout(() => {
      const firstFocusable = sidebarRef.current?.querySelector<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      firstFocusable?.focus();
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      clearTimeout(timer);
    };
  }, [isOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        handleClose();
      }
    },
    [handleClose],
  );

  const isActive = (href: string) => {
    if (href === ADMIN_ROUTES.DASHBOARD) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const triggerButton = trigger ?? (
    <button
      ref={triggerRef}
      type="button"
      onClick={handleOpen}
      className={cn(
        "lg:hidden flex items-center justify-center",
        "w-10 h-10 rounded-lg",
        "text-text-muted hover:text-text hover:bg-surface-hover",
        "transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
      )}
      aria-label="Open navigation menu"
      aria-expanded={isOpen}
      aria-controls="mobile-sidebar"
    >
      <Icon name="Menu" size={24} aria-hidden="true" />
    </button>
  );

  // Don't render portal on server
  if (!mounted) {
    return <>{triggerButton}</>;
  }

  const sidebarContent = (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      id="mobile-sidebar"
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <div
        ref={sidebarRef}
        className={cn(
          "absolute top-0 left-0 h-full w-72 max-w-[85vw]",
          "bg-surface border-r border-border shadow-xl",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="flex flex-col h-full" aria-label="Mobile navigation">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center shadow-lg">
                <Icon
                  name="Sparkles"
                  size={20}
                  className="text-white"
                  aria-hidden="true"
                />
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
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "flex items-center justify-center",
                "w-10 h-10 rounded-lg",
                "text-text-muted hover:text-text hover:bg-surface-hover",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              )}
              aria-label="Close navigation menu"
            >
              <Icon name="X" size={24} aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const active = isActive(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={handleClose}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                    active
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-text-muted hover:text-text hover:bg-surface-hover active:scale-[0.98]",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    name={icon as IconName}
                    size={20}
                    className={cn(
                      "transition-transform duration-200 shrink-0",
                      active ? "scale-110 text-white" : "group-hover:scale-110",
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{label}</span>
                  {active && (
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-border/50 mx-4" />

          {/* Bottom Section - Logout */}
          <div className="p-4">
            <button
              type="button"
              onClick={() => {
                handleClose();
                handleLogoutClick();
              }}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium w-full",
                "text-text-muted transition-all duration-200",
                "hover:text-error hover:bg-error/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
              )}
              aria-label="Logout from dashboard"
            >
              <Icon
                name="LogOut"
                size={20}
                className="group-hover:translate-x-0.5 transition-transform duration-200 shrink-0"
                aria-hidden="true"
              />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Logout confirmation modal */}
      {modal}
    </div>
  );

  return (
    <>
      {triggerButton}
      {createPortal(sidebarContent, document.body)}
    </>
  );
}
