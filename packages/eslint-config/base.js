import js from "@eslint/js";
import turboConfig from "eslint-config-turbo/flat";
import tseslint from "typescript-eslint";

/**
 * Base ESLint configuration for all TypeScript projects
 * Includes: ESLint recommended, TypeScript ESLint, Turbo
 */
export default tseslint.config(
  // Global ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/*.tsbuildinfo",
      "**/pnpm-lock.yaml",
    ],
  },

  // ESLint recommended rules
  js.configs.recommended,

  // Turbo-specific rules
  ...turboConfig,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,

  // Custom rules for all projects
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // TypeScript rules - more lenient to avoid parser bugs
      "@typescript-eslint/no-unused-vars": "off", // Disabled due to parser bug with function types
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // General JavaScript/TypeScript rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",
      "no-var": "error",

      // Turbo rules - NODE_ENV is a standard env var
      "turbo/no-undeclared-env-vars": "off",
    },
  },
);
