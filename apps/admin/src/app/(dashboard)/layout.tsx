import type { Metadata } from "next";

import {
  SidebarNavServer,
  ProfileMenu,
  MobileSidebar,
} from "@admin/components/layout";
import { HeaderBreadcrumb } from "@admin/components/layout/HeaderBreadcrumb";
import { SecuritySettingsProvider } from "@admin/lib/contexts/security-settings-context";
import { AuthGuard } from "@admin/components/auth-guard";
import { ThemeToggle, Typography } from "@repo/ui";

export const metadata: Metadata = {
  title: "Admin Dashboard — Turborepo Starter",
  description: "Admin panel for managing your application content.",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <SecuritySettingsProvider>
        <div className="flex min-h-screen bg-background text-text" dir="auto">
          {/* Sidebar - Server Component with minimal client interactivity */}
          <aside className="hidden lg:block sticky top-0 h-screen">
            <SidebarNavServer />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header with gradient border and shadow */}
            <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border bg-surface/95 backdrop-blur-sm shadow-sm gap-3">
              {/* Left side: Mobile menu + Breadcrumb */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Mobile Sidebar Toggle */}
                <MobileSidebar />

                {/* Breadcrumb - hidden on very small screens */}
                <div className="hidden xs:block min-w-0">
                  <HeaderBreadcrumb />
                </div>
              </div>

              {/* User Profile Section */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Profile Menu with Security Settings */}
                <ProfileMenu />
              </div>
            </header>

            {/* Mobile Breadcrumb - visible only on very small screens */}
            <div className="xs:hidden px-4 py-2 border-b border-border/50 bg-surface/50">
              <HeaderBreadcrumb />
            </div>

            {/* Main Content with max width and better spacing */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
              <div className="max-w-[1600px] mx-auto">{children}</div>
            </main>

            {/* Optional Footer */}
            <footer className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-surface/50 backdrop-blur-sm">
              <div className="max-w-[1600px] mx-auto flex items-center justify-between text-xs text-muted">
                <Typography
                  variant="caption"
                  color="muted"
                  className="whitespace-nowrap"
                >
                  © 2025 Admin Dashboard. All rights reserved.
                </Typography>
              </div>
            </footer>
          </div>
        </div>
      </SecuritySettingsProvider>
    </AuthGuard>
  );
}
