/**
 * Loading UI for Dashboard
 *
 * This is shown instantly while:
 * - Middleware checks authentication
 * - Server components fetch data
 * - Page transitions occur
 *
 * CRITICAL: This prevents "flash of unauthenticated content" by showing
 * a loading state immediately when visiting /admin without a token.
 * The middleware redirect happens, but this shows first.
 */

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-border border-t-primary" />
          <div className="absolute inset-0 h-16 w-16 animate-pulse rounded-full border-4 border-primary/20" />
        </div>

        {/* Loading text with fade animation */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-medium text-foreground animate-pulse">
            Loading dashboard...
          </p>
          <p className="text-xs text-muted">Please wait</p>
        </div>
      </div>
    </div>
  );
}
