import { z } from "zod";

/**
 * URL Security Validation
 * Prevents XSS attacks via dangerous protocols (javascript:, data:, file:, etc.)
 */

/**
 * Safe URL protocols
 */
const SAFE_PROTOCOLS = ["http://", "https://"] as const;

/**
 * Check if URL uses a safe protocol or is a relative path
 * Relative paths (starting with /) are safe as they can't be XSS vectors
 */
export const isSafeUrl = (url: string): boolean => {
  const trimmedUrl = url.trim();

  // Allow relative URLs (starting with /)
  if (trimmedUrl.startsWith("/")) {
    return true;
  }

  // Allow absolute URLs with safe protocols
  const lowerUrl = trimmedUrl.toLowerCase();
  return SAFE_PROTOCOLS.some((protocol) => lowerUrl.startsWith(protocol));
};

/**
 * @deprecated Use isSafeUrl instead
 */
export const isSafeProtocol = (url: string): boolean => isSafeUrl(url);

/**
 * Secure URL schema - allows http://, https://, or relative paths (/)
 * Prevents XSS via javascript:, data:, file: protocols
 */
export const secureUrl = () =>
  z
    .string()
    .min(1, "URL is required")
    .refine(
      (url) => isSafeUrl(url),
      "URL must use http://, https://, or be a relative path starting with /",
    );

/**
 * Optional secure URL schema
 */
export const optionalSecureUrl = () =>
  z
    .string()
    .refine(
      (url) => isSafeUrl(url),
      "URL must use http://, https://, or be a relative path starting with /",
    )
    .optional();

/**
 * Secure URL that can be empty string or valid URL
 */
export const secureUrlOrEmpty = () =>
  z
    .string()
    .refine(
      (url) => url === "" || isSafeUrl(url),
      "URL must be empty, use http://, https://, or be a relative path starting with /",
    )
    .optional();

/**
 * Validate URL is HTTPS only (more secure)
 */
export const httpsOnlyUrl = () =>
  z
    .url("Please provide a valid URL")
    .refine(
      (url) => url.toLowerCase().trim().startsWith("https://"),
      "URL must use https:// protocol for security",
    );

/**
 * Optional HTTPS only URL
 */
export const optionalHttpsOnlyUrl = () =>
  z
    .url("Please provide a valid URL")
    .refine(
      (url) => url.toLowerCase().trim().startsWith("https://"),
      "URL must use https:// protocol for security",
    )
    .optional();

/**
 * Type exports
 */
export type SecureUrl = z.infer<ReturnType<typeof secureUrl>>;
export type OptionalSecureUrl = z.infer<ReturnType<typeof optionalSecureUrl>>;
export type HttpsOnlyUrl = z.infer<ReturnType<typeof httpsOnlyUrl>>;
