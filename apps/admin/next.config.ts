import type { NextConfig } from "next";

// Bundle analyzer setup
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// Parse backend URL from environment variables for image optimization
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
  // Development: Images come from backend via Next.js proxy OR direct backend access
  // Production: Images come from same domain via nginx proxy

  if (process.env.NODE_ENV === "development") {
    // Development: Allow BOTH proxied URL AND direct backend URL
    // This ensures images work whether backend returns proxied or direct URLs

    // 1. Proxied URL (preferred): http://localhost:3001/api/uploads
    configs.push({
      protocol: "http" as const,
      hostname: "localhost",
      port: "3001",
      pathname: "/api/uploads/**",
    });

    // 2. Direct backend URL (fallback): http://localhost:4000/uploads
    configs.push({
      protocol: "http" as const,
      hostname: "localhost",
      port: "4000",
      pathname: "/uploads/**",
    });
  } else {
    // Production: Use public API URL from environment variable
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "https://yourdomain.com/api";

    try {
      const url = new URL(apiUrl);
      configs.push({
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: "/api/uploads/**",
      });
    } catch {
      console.error("Invalid NEXT_PUBLIC_API_URL:", apiUrl);
    }
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
    // Server-side only (for server components GraphQL requests)
    GRAPHQL_URL: process.env.GRAPHQL_URL,
    API_URL: process.env.API_URL,
  },

  // 🎯 BasePath for nginx subpath routing (e.g., /admin)
  // Set NEXT_PUBLIC_ADMIN_PATH="" for root domain or NEXT_PUBLIC_ADMIN_PATH="/admin" for subpath
  // MUST match NEXT_PUBLIC_ADMIN_PATH used in middleware.ts and docker-compose.yml
  basePath: process.env.NEXT_PUBLIC_ADMIN_PATH || "",

  // 🔄 Rewrites: Proxy backend API in development
  // This allows admin (localhost:3001) to access backend (localhost:4000)
  // In production, nginx handles /api routing to backend
  async rewrites() {
    const isDevelopment = process.env.NODE_ENV === "development";
    if (!isDevelopment) {
      return [];
    }

    const backendUrl = "http://localhost:4000";

    return [
      // Proxy /api/graphql to backend /graphql
      {
        source: "/api/graphql",
        destination: `${backendUrl}/graphql`,
      },
      // Proxy /api/upload/* to backend /upload/* (controller route)
      {
        source: "/api/upload/:path*",
        destination: `${backendUrl}/upload/:path*`,
      },
      // Proxy /api/uploads/* to backend /uploads/* (static file serving)
      {
        source: "/api/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: getBackendImageConfig(),
    formats: ["image/avif", "image/webp"], // Modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Optimized breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Thumbnail sizes
    minimumCacheTTL: 60 * 60 * 24 * 7, // Cache images for 7 days
    dangerouslyAllowSVG: true, // Allow SVG images
    contentDispositionType: "attachment", // Security for SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // SVG CSP
  },
  experimental: {
    serverActions: {
      // Increased from 10mb to support large resume PDFs and images
      bodySizeLimit: "50mb",
    },
    typedRoutes: true,
    // Optimize CSS in production
    optimizeCss: true,
    // Enable PPR when stable (Next.js 15 experimental)
    // ppr: "incremental",
  },
  // Optimize production build
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn", "info"],
          }
        : false,
  },
  // Compression
  compress: true,
  // Power optimizations
  poweredByHeader: false, // Remove X-Powered-By header

  // Additional performance headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
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
        ],
      },
      // Cache static assets aggressively
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache fonts
      {
        source: "/_next/static/media/:path*",
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

export default withBundleAnalyzer(nextConfig);
