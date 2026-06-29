import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Centralized Auth Configuration (imported inline to avoid edge runtime issues)
 *
 * CRITICAL: BASE_PATH must match next.config.ts basePath:
 * - Development: "" (empty, no prefix) - runs on localhost:3001
 * - Production: "/admin" (subpath under main domain via nginx)
 *
 * Use `|| ""` to match next.config.ts behavior (not `?? "/admin"`)
 */
const BASE_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "";
const API_URL = process.env.API_URL || "http://localhost:4000";
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const REFRESH_BUFFER_MINUTES = 5;

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Decode JWT to extract user info (server-side, using Buffer)
 */
function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = Buffer.from(
      parts[1].replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf-8");

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
 * Check if JWT access token is expired or will expire soon
 */
function isTokenExpired(
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

/**
 * Refresh access token via REST API (server-to-server)
 */
async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshTokenResponse | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("[Middleware] Token refresh failed:", res.status);
      return null;
    }

    const data = await res.json();
    if (!data?.accessToken || !data?.refreshToken) {
      console.error("[Middleware] Invalid refresh response");
      return null;
    }

    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch (error) {
    console.error("[Middleware] Token refresh error:", error);
    return null;
  }
}

/**
 * Check if path is login page
 */
function isLoginPage(pathname: string): boolean {
  return pathname === "/login" || pathname === "/login/";
}

/**
 * Check if path is a public asset
 */
function isPublicAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    /\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/i.test(pathname)
  );
}

/**
 * Check if path is a backend API route (proxied by nginx)
 */
function isBackendApiRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/api/graphql") ||
    pathname.startsWith("/api/upload") ||
    pathname.startsWith("/api/uploads")
  );
}

/**
 * Build CSP Policy (moved to separate function for clarity)
 */
function buildCSPPolicy(nonce: string): string {
  const isDevelopment = process.env.NODE_ENV === "development";
  const graphqlUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/graphql";
  const restApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  let graphqlDomain = "'self'";
  let restApiDomain = "'self'";

  if (graphqlUrl.startsWith("http")) {
    try {
      graphqlDomain = new URL(graphqlUrl).origin;
    } catch {
      graphqlDomain = "'self'";
    }
  }
  if (restApiUrl?.startsWith("http")) {
    try {
      restApiDomain = new URL(restApiUrl).origin;
    } catch {
      restApiDomain = "'self'";
    }
  }

  const cspDirectives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https://www.google.com/recaptcha/",
      "https://www.gstatic.com/recaptcha/",
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "https:",
      graphqlDomain,
      ...(graphqlDomain !== restApiDomain ? [restApiDomain] : []),
    ],
    "font-src": ["'self'", "data:"],
    "connect-src": [
      "'self'",
      graphqlDomain,
      ...(graphqlDomain !== restApiDomain ? [restApiDomain] : []),
      "https://www.google.com/recaptcha/",
      ...(isDevelopment ? ["ws://localhost:*", "wss://localhost:*"] : []),
    ],
    "frame-src": [
      "https://www.google.com/recaptcha/",
      "https://recaptcha.google.com/recaptcha/",
    ],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": [
      "'self'",
      graphqlDomain,
      ...(graphqlDomain !== restApiDomain ? [restApiDomain] : []),
    ],
    "frame-ancestors": ["'none'"],
    ...(isDevelopment ? {} : { "upgrade-insecure-requests": [] }),
  };

  return Object.entries(cspDirectives)
    .map(([key, values]) => {
      const value = values.length > 0 ? values.join(" ") : "";
      return value ? `${key} ${value}` : key;
    })
    .join("; ");
}

/**
 * Set security headers on response
 */
function setSecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()",
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }
}

/**
 * Create redirect response to login page
 */
function createLoginRedirect(
  request: NextRequest,
  fromPath: string,
  cspHeader: string,
  clearCookies = false,
): NextResponse {
  const loginUrl = new URL(BASE_PATH + "/login", request.nextUrl.origin);
  loginUrl.searchParams.set("from", fromPath);

  const response = NextResponse.redirect(loginUrl);

  if (clearCookies) {
    // Clear invalid tokens
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      domain: COOKIE_DOMAIN,
    });
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      domain: COOKIE_DOMAIN,
    });
    response.cookies.set("auth-status", "", {
      httpOnly: false,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
      domain: COOKIE_DOMAIN,
    });
  }

  const isDevelopment = process.env.NODE_ENV === "development";
  if (isDevelopment) {
    response.headers.set("Content-Security-Policy-Report-Only", cspHeader);
  } else {
    response.headers.set("Content-Security-Policy", cspHeader);
  }
  setSecurityHeaders(response);

  return response;
}

/**
 * Create redirect response to dashboard
 */
function createDashboardRedirect(
  request: NextRequest,
  cspHeader: string,
): NextResponse {
  const dashboardUrl = new URL(BASE_PATH + "/", request.nextUrl.origin);
  const response = NextResponse.redirect(dashboardUrl);

  const isDevelopment = process.env.NODE_ENV === "development";
  if (isDevelopment) {
    response.headers.set("Content-Security-Policy-Report-Only", cspHeader);
  } else {
    response.headers.set("Content-Security-Policy", cspHeader);
  }
  setSecurityHeaders(response);

  return response;
}

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================

/**
 * Admin Middleware - Single Source of Truth for Authentication
 *
 * RESPONSIBILITIES:
 * 1. Validate/refresh tokens (ONLY place this happens)
 * 2. Redirect unauthenticated users to login
 * 3. Redirect authenticated users away from login page
 * 4. Inject auth headers for Server Components
 * 5. Apply CSP and security headers
 *
 * ARCHITECTURE:
 * - ALL auth redirects happen here (not in client components)
 * - Passes user info via x-auth-user header to Server Components
 * - Server Components pass auth state to AuthProvider as props
 * - AuthProvider initializes immediately (no client-side fetch needed)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDevelopment = process.env.NODE_ENV === "development";

  // Normalize pathname (Next.js should strip basePath, but defensive check)
  let normalizedPath = pathname;
  if (BASE_PATH && normalizedPath.startsWith(BASE_PATH)) {
    normalizedPath = normalizedPath.slice(BASE_PATH.length) || "/";
  }

  // Development: If user navigates to /admin (which is the production basePath),
  // redirect them to / since basePath="" in development
  if (!BASE_PATH && normalizedPath === "/admin") {
    const dashboardUrl = new URL("/", request.nextUrl.origin);
    return NextResponse.redirect(dashboardUrl);
  }

  // Generate CSP nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = buildCSPPolicy(nonce);

  // -------------------------------------------------------------------------
  // FAST PATHS (no auth needed)
  // -------------------------------------------------------------------------

  // Skip middleware for backend API routes (proxied by nginx)
  if (isBackendApiRoute(normalizedPath)) {
    return NextResponse.next();
  }

  // Skip middleware for public assets
  if (isPublicAsset(normalizedPath)) {
    return NextResponse.next();
  }

  // -------------------------------------------------------------------------
  // AUTH CHECK
  // -------------------------------------------------------------------------

  const refreshTokenCookie = request.cookies.get("refreshToken");
  const hasRefreshToken = !!refreshTokenCookie?.value;

  // -------------------------------------------------------------------------
  // UNAUTHENTICATED USER
  // -------------------------------------------------------------------------

  if (!hasRefreshToken) {
    // Allow access to login page
    if (isLoginPage(normalizedPath)) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-nonce", nonce);

      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });

      response.cookies.set("csp-nonce", nonce, {
        httpOnly: true,
        secure: !isDevelopment,
        sameSite: "strict",
        path: "/",
        maxAge: 60,
      });

      if (isDevelopment) {
        response.headers.set("Content-Security-Policy-Report-Only", cspHeader);
      } else {
        response.headers.set("Content-Security-Policy", cspHeader);
      }
      setSecurityHeaders(response);

      return response;
    }

    // Redirect to login for protected pages
    return createLoginRedirect(request, normalizedPath, cspHeader);
  }

  // -------------------------------------------------------------------------
  // AUTHENTICATED USER - Refresh token if needed
  // -------------------------------------------------------------------------

  const existingAccessToken = request.cookies.get("accessToken")?.value;
  let accessToken: string | null = null;
  let user: AuthUser | null = null;

  // Check if access token needs refresh
  if (isTokenExpired(existingAccessToken)) {
    const tokens = await refreshAccessToken(refreshTokenCookie.value);

    if (!tokens) {
      // Refresh failed - token is invalid, redirect to login
      return createLoginRedirect(request, normalizedPath, cspHeader, true);
    }

    accessToken = tokens.accessToken;
    user = decodeJwtPayload(accessToken);
  } else {
    // Use existing token
    accessToken = existingAccessToken!;
    user = decodeJwtPayload(accessToken);
  }

  // -------------------------------------------------------------------------
  // AUTHENTICATED USER ON LOGIN PAGE - Redirect to dashboard
  // -------------------------------------------------------------------------

  if (isLoginPage(normalizedPath)) {
    return createDashboardRedirect(request, cspHeader);
  }

  // -------------------------------------------------------------------------
  // AUTHENTICATED USER ON PROTECTED PAGE - Allow access
  // -------------------------------------------------------------------------

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("authorization", `Bearer ${accessToken}`);

  // Pass user info to Server Components via header
  if (user) {
    requestHeaders.set("x-auth-user", JSON.stringify(user));
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set cookies
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60, // 15 minutes
    domain: COOKIE_DOMAIN,
  });

  // Auth status cookie (readable by client for UX)
  response.cookies.set("auth-status", "authenticated", {
    httpOnly: false,
    secure: !isDevelopment,
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
    domain: COOKIE_DOMAIN,
  });

  response.cookies.set("csp-nonce", nonce, {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: "strict",
    path: "/",
    maxAge: 60,
  });

  if (isDevelopment) {
    response.headers.set("Content-Security-Policy-Report-Only", cspHeader);
  } else {
    response.headers.set("Content-Security-Policy", cspHeader);
  }
  setSecurityHeaders(response);

  return response;
}

// ============================================================================
// MIDDLEWARE MATCHER
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static files
     * Note: Paths are relative to basePath (/admin)
     */
    "/",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
