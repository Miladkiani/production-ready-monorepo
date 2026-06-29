import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CSP (Content Security Policy) Middleware
 *
 * This middleware generates a unique nonce for each request and sets CSP headers
 * to protect against XSS attacks and other security vulnerabilities.
 *
 * LEARNING NOTES:
 * - Nonce: A random string generated per request to allow specific inline scripts
 * - CSP directives control which resources can be loaded (scripts, styles, images, etc.)
 * - We start in "report-only" mode to test without breaking functionality
 */

export function middleware(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Generate a unique nonce (number used once) for this request
  // This allows us to safely use inline scripts in Next.js while blocking others
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // Build our CSP policy
  // Each directive controls a different type of resource
  const cspHeader = buildCSPPolicy(nonce, request);

  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Create response with CSP headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // CSP is now in enforcement mode (no more report-only warnings)
  // Production: Strict enforcement to protect against XSS and other attacks
  // Development: More permissive for hot reloading and debugging
  if (!isDevelopment) {
    response.headers.set("Content-Security-Policy", cspHeader);
  }

  // Additional security headers (bonus!)
  setSecurityHeaders(response);

  return response;
}

/**
 * Build the Content Security Policy
 *
 * LEARNING: Each directive is explained with why we need it
 */
function buildCSPPolicy(nonce: string, request: NextRequest): string {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Get your backend API URL for connect-src
  const apiUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000";
  const apiDomain = new URL(apiUrl).origin;

  const cspDirectives = {
    /**
     * default-src: Fallback for all resource types
     * 'self' = Only load from same origin (your domain)
     */
    "default-src": ["'self'"],

    /**
     * script-src: Controls JavaScript execution
     * - 'nonce-{random}': Allow specific inline scripts (Next.js needs this)
     * - 'strict-dynamic': Modern approach - trust scripts loaded by trusted scripts
     *   Note: When 'strict-dynamic' is present, 'self' is ignored in modern browsers
     * - Cloudflare CDN: Required for email protection and security features
     *
     * ⚠️ NEVER use 'unsafe-inline' or 'unsafe-eval' - they defeat CSP's purpose!
     */
    "script-src": [
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      // In development, Next.js uses eval for hot reloading
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
      // Cloudflare CDN for email protection (production only)
      ...(!isDevelopment ? ["https://yourdomain.com"] : []),
    ],

    /**
     * style-src: Controls CSS sources
     * - 'self': Stylesheets from your domain
     * - 'unsafe-inline': Required for Next.js styled-jsx and CSS-in-JS
     *   (This is a known limitation of CSS-in-JS libraries)
     */
    "style-src": ["'self'", "'unsafe-inline'"],

    /**
     * img-src: Controls image sources
     * - 'self': Images from your domain
     * - data: Allow data: URIs (base64 encoded images)
     * - https: Allow images from any HTTPS source
     * - apiDomain: Your backend uploads
     */
    "img-src": ["'self'", "data:", "https:", apiDomain],

    /**
     * font-src: Controls font sources
     * - 'self': Fonts from your domain
     * - data: Allow data: URIs for fonts
     */
    "font-src": ["'self'", "data:"],

    /**
     * connect-src: Controls AJAX, fetch, WebSocket connections
     * - 'self': API calls to your domain
     * - apiDomain: Your GraphQL backend
     * - ws://, wss://: WebSocket connections (for dev hot reload)
     */
    "connect-src": [
      "'self'",
      apiDomain,
      ...(isDevelopment ? ["ws://localhost:*", "wss://localhost:*"] : []),
    ],

    /**
     * frame-src: Controls iframe sources
     * - 'self': Allow iframes from your domain
     * - https://adplist.org: Allow ADPList reviews widget
     *
     * LEARNING: We allow ADPList specifically for the mentorship reviews widget
     */
    "frame-src": ["'self'", "https://adplist.org"],

    /**
     * object-src: Controls <object>, <embed>, <applet>
     * - 'none': These are legacy and security risks - block them
     */
    "object-src": ["'none'"],

    /**
     * base-uri: Controls <base> tag URLs
     * - 'self': Prevent attackers from changing base URL
     */
    "base-uri": ["'self'"],

    /**
     * form-action: Controls where forms can submit
     * - 'self': Forms can only submit to your domain
     * - apiDomain: Allow form submission to your backend
     */
    "form-action": ["'self'", apiDomain],

    /**
     * frame-ancestors: Controls who can embed your site in iframes
     * - 'none': Prevent your site from being embedded (clickjacking protection)
     *
     * LEARNING: This is different from frame-src!
     * - frame-src: Controls iframes YOU embed on your site (like ADPList widget)
     * - frame-ancestors: Controls who can embed YOUR site in their iframes
     */
    "frame-ancestors": ["'none'"],

    /**
     * upgrade-insecure-requests: Automatically upgrade HTTP to HTTPS
     * Only use in production!
     */
    ...(isDevelopment ? {} : { "upgrade-insecure-requests": [] }),
  };

  // Convert directives object to CSP header string
  return Object.entries(cspDirectives)
    .map(([key, values]) => {
      const value = values.length > 0 ? values.join(" ") : "";
      return value ? `${key} ${value}` : key;
    })
    .join("; ");
}

/**
 * Additional Security Headers (Best Practices)
 *
 * LEARNING: These headers provide additional layers of security
 */
function setSecurityHeaders(response: NextResponse) {
  /**
   * X-Frame-Options: Prevents clickjacking
   * DENY = Don't allow your site to be embedded in iframes
   */
  response.headers.set("X-Frame-Options", "DENY");

  /**
   * X-Content-Type-Options: Prevents MIME sniffing
   * nosniff = Browser must respect Content-Type header
   */
  response.headers.set("X-Content-Type-Options", "nosniff");

  /**
   * Referrer-Policy: Controls referrer information
   * strict-origin-when-cross-origin = Full URL for same-origin, origin only for cross-origin
   */
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  /**
   * X-DNS-Prefetch-Control: Controls DNS prefetching
   * off = Disable for privacy (prevents leaking browsing patterns)
   */
  response.headers.set("X-DNS-Prefetch-Control", "off");

  /**
   * Permissions-Policy: Controls browser features
   * Disable features you don't use (camera, microphone, geolocation, etc.)
   */
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  );
}

/**
 * Configure which paths this middleware runs on
 *
 * We exclude static files and API routes for better performance
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - sitemap.xml, robots.txt, manifest.webmanifest (metadata files)
     */
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
