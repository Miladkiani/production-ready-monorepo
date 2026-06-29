import nextConfig from "@repo/eslint-config/next";
import tseslint from "typescript-eslint";

/**
 * ESLint configuration for admin (Next.js app)
 * Uses shared config with browser compatibility checking disabled for modern browsers
 */
export default tseslint.config(
  ...nextConfig,
  {
    ignores: [
      "next-env.d.ts",
      "*.config.mjs",
      "*.config.ts",
      ".next/**",
      "out/**",
    ],
  },
  {
    rules: {
      "compat/compat": "off", // Disable browser compat checks - modern app targets modern browsers
    },
  },
);
