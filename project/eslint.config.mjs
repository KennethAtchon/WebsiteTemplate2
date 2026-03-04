import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // React rules
      "react/no-unescaped-entities": "off",
      // Allow unused variables starting with underscore
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Allow any types
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    // Override react-hooks rules that need the plugin registered in scope
    plugins: { "react-hooks": reactHooksPlugin },
    rules: {
      // setState-in-effect: both uses in this codebase are intentional
      // (reading localStorage on mount, responding to URL-param-driven navigation)
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // Playwright test fixtures use a parameter named `use` which ESLint misidentifies as React's use() hook
    files: ["**/__tests__/**"],
    plugins: { "react-hooks": reactHooksPlugin },
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  // Override default ignores of eslint-config-next
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores
    "lib/generated/**",
    "node_modules/**",
    "infrastructure/database/lib/**",
    "database/lib/**",
    "coverage/**",
    "scripts/**",
  ]),
]);

export default eslintConfig;
