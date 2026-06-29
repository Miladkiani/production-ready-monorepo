/**
 * Image URL Utilities for Admin
 *
 * Handles conversion of relative image URLs to absolute URLs for Next.js Image component.
 * Next.js Image optimizer requires absolute URLs when running on the server.
 */

/**
 * Get the base URL for resolving images
 */
function getImageBaseUrl(): string {
  // Admin uses NEXT_PUBLIC_API_URL which already points to the API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      // Ignore parse errors
    }
  }

  // Development fallback
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:4000";
  }

  return "";
}

/**
 * Resolve an image URL to an absolute URL for Next.js Image component
 *
 * @param src - Image source (can be relative or absolute)
 * @returns Absolute URL for the image
 */
export function resolveImageUrl(src: string | null | undefined): string {
  if (!src) {
    return "/default-avatar.png";
  }

  // Already absolute URL - return as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Relative URL - prepend base URL
  const baseUrl = getImageBaseUrl();
  if (baseUrl) {
    const cleanSrc = src.startsWith("/") ? src : `/${src}`;
    return `${baseUrl}${cleanSrc}`;
  }

  // Fallback: return original
  return src;
}
