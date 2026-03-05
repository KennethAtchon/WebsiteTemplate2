import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["*.ts", "*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["*.config.ts", "*.config.js", "*.config.mjs"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        process: "readonly",
        require: "readonly",
      },
    },
  },
  prettier,
  {
    ignores: [
      "dist",
      "node_modules",
      "src/routeTree.gen.ts",
      "src/shared/components/ui",
    ],
  },
];
