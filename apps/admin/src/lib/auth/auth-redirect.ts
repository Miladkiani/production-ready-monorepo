import { redirect } from "next/navigation";

/**
 * Redirect to login page (for Server Components)
 *
 * NOTE: This should rarely be needed since middleware handles all auth redirects.
 * Kept for backward compatibility and edge cases.
 *
 * IMPORTANT: Use relative path - Next.js automatically adds basePath
 */
export function redirectToLogin(): never {
  redirect("/login");
}
