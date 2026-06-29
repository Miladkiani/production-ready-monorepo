"use client";

import { useAuth } from "@admin/lib";

/**
 * AuthGuard - Client-side Route Protection (Simplified)
 *
 * ARCHITECTURE (Optimized):
 * - Middleware handles ALL authentication and redirects
 * - AuthGuard only provides loading state during hydration
 * - No redirect logic here - trust middleware
 *
 * WHY SIMPLIFIED:
 * - Middleware is the single source of truth for auth
 * - Server Components pass auth state via props
 * - AuthProvider initializes immediately (no loading state needed)
 * - This component is kept for backward compatibility but mostly passes through
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state only during initial hydration
  // This should rarely show since AuthProvider initializes with server state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated (shouldn't happen - middleware redirects)
  // Show a brief message while middleware handles redirect
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-sm text-muted">Redirecting...</p>
      </div>
    );
  }

  // Authenticated - render protected content
  return <>{children}</>;
}
