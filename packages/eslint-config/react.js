import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import compat from "eslint-plugin-compat";
import baseConfig from "./base.js";

const flatCompat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
});

/**
 * ESLint configuration for React projects
 * Extends base config with React, React Hooks, and Browser Compat rules
 */
export default [
  ...baseConfig,
  ...flatCompat.extends(
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ),
  compat.configs["flat/recommended"],
  {
    files: ["**/*.tsx", "**/*.jsx", "**/*.ts", "**/*.js"],
    settings: {
      react: {
        version: "detect",
      },
      // Browser compatibility targets (from root package.json browserslist)
      polyfills: [
        // Add polyfills you use here
        "Promise",
        "fetch",
      ],
    },
    rules: {
      // React rules
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Using TypeScript for prop validation
      "react/display-name": "off",
      "react/no-unescaped-entities": "warn",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Browser compatibility - error on unsupported features
      "compat/compat": "error",
    },
  },
];
