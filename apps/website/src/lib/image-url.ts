/**
 * Image URL Utilities
 *
 * Handles conversion of relative image URLs to absolute URLs for Next.js Image component.
 * Next.js Image optimizer requires absolute URLs when running on the server.
 *
 * Flow:
 * - Database stores: /api/uploads/avatars/image.webp (relative)
 * - Server needs: https://yourdomain.com/api/uploads/avatars/image.webp (absolute)
 */

/**
 * Get the base URL for resolving images
 * - Production: Uses NEXT_PUBLIC_SITE_URL for images
 * - Development: Uses backend URL (localhost:4000) for images
 */
function getImageBaseUrl(): string {
  // Development: Always use backend URL for images
  if (process.env.NODE_ENV === "development") {
    const apiUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL;
    if (apiUrl) {
      try {
        const url = new URL(apiUrl);
        return `${url.protocol}//${url.host}`;
      } catch {
        // Fallback to default backend URL
        return "http://localhost:4000";
      }
    }
    return "http://localhost:4000";
  }

  // Production: Use NEXT_PUBLIC_SITE_URL (images served via nginx proxy)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  // Production fallback: derive from API URL
  const apiUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      // Ignore parse errors
    }
  }

  // Last resort - return empty string (will use relative URL)
  return "";
}

/**
 * Resolve an image URL to an absolute URL for Next.js Image component
 *
 * @param src - Image source (can be relative or absolute)
 * @returns Absolute URL for the image
 *
 * @example
 * // Development - relative URL with /api/uploads
 * resolveImageUrl('/api/uploads/avatars/image.webp')
 * // Returns: 'http://localhost:4000/uploads/avatars/image.webp'
 *
 * // Production - relative URL
 * resolveImageUrl('/api/uploads/avatars/image.webp')
 * // Returns: 'https://yourdomain.com/api/uploads/avatars/image.webp'
 *
 * // Absolute URL (unchanged)
 * resolveImageUrl('https://example.com/image.webp')
 * // Returns: 'https://example.com/image.webp'
 */
export function resolveImageUrl(src: string): string {
  // Already absolute URL - return as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Relative URL - prepend base URL
  const baseUrl = getImageBaseUrl();
  if (baseUrl) {
    // In development, backend serves images at /uploads, not /api/uploads
    // Remove /api prefix for backend URLs in development
    let cleanSrc = src.startsWith("/") ? src : `/${src}`;

    if (
      process.env.NODE_ENV === "development" &&
      cleanSrc.startsWith("/api/uploads")
    ) {
      cleanSrc = cleanSrc.replace("/api/uploads", "/uploads");
    }

    return `${baseUrl}${cleanSrc}`;
  }

  // Fallback: return original (will work client-side)
  return src;
}

/**
 * Check if an image URL is from our uploads directory
 */
export function isUploadedImage(src: string): boolean {
  return src.includes("/uploads/") || src.includes("/api/uploads/");
}
