/**
 * Centralized Authentication Configuration
 *
 * Single source of truth for all auth-related configuration.
 * Import this in middleware, auth-context, auth-guard, etc.
 */

// ============================================================================
// PATHS
// ============================================================================

/**
 * Base path for the admin app (must match next.config.ts basePath)
 *
 * CRITICAL: Use `|| ""` to match next.config.ts behavior:
 * - Production: "/admin" (set via NEXT_PUBLIC_ADMIN_PATH env var in docker-compose.yml)
 * - Development: "" (empty, runs on localhost:3001 without subpath)
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "";

/**
 * Login page path (relative to basePath)
 */
export const LOGIN_PATH = "/login";

/**
 * Dashboard path (relative to basePath)
 */
export const DASHBOARD_PATH = "/";

/**
 * Full login URL (with basePath)
 */
export const FULL_LOGIN_PATH = BASE_PATH + LOGIN_PATH;

/**
 * Full dashboard URL (with basePath)
 */
export const FULL_DASHBOARD_PATH = BASE_PATH + DASHBOARD_PATH;

// ============================================================================
// COOKIES
// ============================================================================

/**
 * Cookie domain (for cross-subdomain cookies)
 */
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

/**
 * Cookie configuration for access token
 */
export const ACCESS_TOKEN_COOKIE = {
  name: "accessToken",
  httpOnly: true, // Security: prevent XSS from reading token
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 15 * 60, // 15 minutes (matches JWT expiry)
};

/**
 * Cookie configuration for refresh token
 */
export const REFRESH_TOKEN_COOKIE = {
  name: "refreshToken",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  // maxAge is managed by backend
};

/**
 * Cookie for auth status indicator (readable by client for UX)
 */
export const AUTH_STATUS_COOKIE = {
  name: "auth-status",
  httpOnly: false, // Intentionally readable by client
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 15 * 60, // 15 minutes
};

// ============================================================================
// TOKEN SETTINGS
// ============================================================================

/**
 * Access token expiry in seconds
 */
export const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes

/**
 * Buffer time before expiry to trigger refresh (in minutes)
 */
export const REFRESH_BUFFER_MINUTES = 5;

// ============================================================================
// API URLs
// ============================================================================

/**
 * Backend API URL for server-to-server communication
 * Uses internal Docker network in production
 */
export const API_URL = process.env.API_URL || "http://localhost:4000";

/**
 * GraphQL URL for client-side requests
 */
export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";

/**
 * GraphQL URL for server-side requests (internal Docker network)
 */
export const GRAPHQL_INTERNAL_URL =
  process.env.GRAPHQL_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  "http://localhost:4000/graphql";

// ============================================================================
// HEADERS
// ============================================================================

/**
 * Header names used for auth communication between middleware and components
 */
export const AUTH_HEADERS = {
  /** Authorization header with Bearer token */
  AUTHORIZATION: "authorization",
  /** JSON-encoded user object from middleware */
  USER: "x-auth-user",
  /** CSP nonce for inline scripts */
  NONCE: "x-nonce",
};

// ============================================================================
// ROUTE HELPERS
// ============================================================================

/**
 * Check if a path is the login page
 */
export function isLoginPage(pathname: string): boolean {
  const normalized = pathname.replace(BASE_PATH, "") || "/";
  return normalized === LOGIN_PATH || normalized === LOGIN_PATH + "/";
}

/**
 * Check if a path is a public asset (no auth required)
 */
export function isPublicAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/i.test(pathname)
  );
}

/**
 * Check if a path is a backend API route (proxied by nginx)
 */
export function isBackendApiRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/api/graphql") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/uploads")
  );
}

/**
 * Check if a path is an internal API route
 */
export function isInternalApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/auth");
}

/**
 * Check if a path requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  const normalized = pathname.replace(BASE_PATH, "") || "/";
  return (
    !isLoginPage(normalized) &&
    !isPublicAsset(normalized) &&
    !isBackendApiRoute(normalized)
  );
}

// ============================================================================
// USER TYPE
// ============================================================================

/**
 * User object extracted from JWT token
 */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Decode JWT token to extract user info
 * Note: This is basic parsing; actual validation is done on backend
 */
export function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Handle both Node.js Buffer and browser atob
    let payload: string;
    if (typeof Buffer !== "undefined") {
      payload = Buffer.from(
        parts[1].replace(/-/g, "+").replace(/_/g, "/"),
        "base64",
      ).toString("utf-8");
    } else {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      payload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
    }

    const decoded = JSON.parse(payload);
    return {
      id: decoded.sub || decoded.id,
      email: decoded.email || "",
      role: decoded.role || "USER",
    };
  } catch {
    return null;
  }
}

/**
 * Check if JWT token is expired or will expire soon
 */
export function isTokenExpired(
  token: string | undefined,
  bufferMinutes = REFRESH_BUFFER_MINUTES,
): boolean {
  if (!token) return true;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = JSON.parse(
      Buffer.from(
        parts[1].replace(/-/g, "+").replace(/_/g, "/"),
        "base64",
      ).toString(),
    );

    if (!payload.exp) return true;

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    const bufferTime = bufferMinutes * 60 * 1000;

    return currentTime >= expirationTime - bufferTime;
  } catch {
    return true;
  }
}
