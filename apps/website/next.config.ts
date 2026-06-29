import type { NextConfig } from "next";

// Parse backend URL from environment variables
const getBackendImageConfig = (): Array<{
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
}> => {
  const configs: Array<{
    protocol: "http" | "https";
    hostname: string;
    port?: string;
    pathname: string;
  }> = [];

  // CRITICAL: Images must be accessible by Next.js Image optimizer
  // Development: Images come from backend (localhost:4000 OR production URLs from DB)
  // Production: Images come from production domain

  const apiUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      configs.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: "/api/uploads/**", // Production: /api/uploads/**
      });

      // Also support /uploads/** for direct backend access
      if (url.port === "4000") {
        configs.push({
          protocol: url.protocol.replace(":", "") as "http" | "https",
          hostname: url.hostname,
          port: url.port,
          pathname: "/uploads/**", // Development: /uploads/**
        });
      }
    } catch {
      console.warn("Failed to parse API URL for image configuration");
    }
  }

  // Fallback: Allow localhost:4000 for local development
  if (process.env.NODE_ENV === "development") {
    // Backend direct access (preferred)
    configs.push({
      protocol: "http" as const,
      hostname: "localhost",
      port: "4000",
      pathname: "/uploads/**",
    });
    configs.push({
      protocol: "http" as const,
      hostname: "localhost",
      port: "4000",
      pathname: "/api/uploads/**",
    });
    // Fallback: Allow localhost:3000 for edge cases (shouldn't happen but safety net)
    configs.push({
      protocol: "http" as const,
      hostname: "localhost",
      port: "3000",
      pathname: "/api/uploads/**",
    });
  }

  // CRITICAL: Allow production domain for images stored with full URLs
  // This handles cases where images are stored as full URLs in the database
  // Read from environment variable (comma-separated list)
  const imageDomainsEnv = process.env.NEXT_PUBLIC_IMAGE_DOMAINS || "";
  const productionDomains = imageDomainsEnv
    .split(",")
    .map((d) => d.trim())
    .filter((d) => d.length > 0 && d !== "localhost");

  productionDomains.forEach((domain) => {
    configs.push({
      protocol: "https" as const,
      hostname: domain,
      pathname: "/api/uploads/**",
    });
  });

  return configs;
};

const nextConfig: NextConfig = {
  /* config options here */
  // 🐳 Docker: Enable standalone output for smaller images
  output: "standalone",

  // 🔑 Expose server-side environment variables to Next.js runtime
  // CRITICAL: Without this, GRAPHQL_URL and API_URL won't be available in server components
  env: {
    // Server-side only (for SSR GraphQL requests)
    GRAPHQL_URL: process.env.GRAPHQL_URL,
    API_URL: process.env.API_URL,
  },

  images: {
    remotePatterns: getBackendImageConfig(),
    formats: ["image/avif", "image/webp"], // Modern image formats for better performance
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Optimized breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Thumbnail sizes
    minimumCacheTTL: 60 * 60 * 24 * 7, // Cache images for 7 days
    dangerouslyAllowSVG: true, // Allow SVG images (needed for logos/icons)
    contentDispositionType: "attachment", // Security for SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // SVG CSP
    // Optimize image quality for better file size
    unoptimized: false, // Ensure optimization is enabled
  },
  // Enable typed routes for better type safety
  typedRoutes: true,
  experimental: {
    serverActions: {
      // Increased to 50mb to support large content
      bodySizeLimit: "50mb",
    },
    // Optimize CSS in production
    optimizeCss: true,
  },
  // Optimize production build
  compiler: {
    // Remove console statements in production (except errors and warnings)
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
  // Enable compression
  compress: true,
  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Security and performance headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Cache static images aggressively
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache Next.js static assets (fonts, etc.)
        source: "/_next/static/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Cache Next.js build files
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
