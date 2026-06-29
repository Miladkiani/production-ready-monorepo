import baseConfig from "./base.js";

/**
 * ESLint configuration for NestJS projects
 * Extends base config with NestJS specific rules
 */
export default [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    rules: {
      // NestJS uses decorators extensively
      "@typescript-eslint/no-explicit-any": "warn",

      // Allow console in backend services
      "no-console": "off",

      // NestJS commonly uses classes without explicit return types
      "@typescript-eslint/explicit-function-return-type": "off",

      // Allow empty interfaces (common in NestJS DTOs)
      "@typescript-eslint/no-empty-interface": "off",

      // Allow unused vars prefixed with underscore (common in NestJS)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];
