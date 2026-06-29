import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import reactConfig from "./react.js";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

/**
 * ESLint configuration for Next.js projects
 * Extends React config with Next.js specific rules
 */
export default [
  ...reactConfig,
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.tsx", "**/*.jsx", "**/*.ts", "**/*.js"],
    rules: {
      // Next.js specific rules
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "warn",

      // Allow console in Next.js server components
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  },
];
