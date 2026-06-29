import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // API routes — internal, not for indexing
          "/api/",

          // Next.js internal routes
          "/_next/",

          // Block junk/malformed URLs that bots may try
          "/%24", // /$
          "/%26", // /&
          "/&",
          "/$",

          // Block old/deleted metadata image routes that no longer exist.
          // These were removed in favor of static /logo.png images.
          // Google may still have them cached — blocking prevents re-crawling.
          "/opengraph-image",
          "/twitter-image",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
