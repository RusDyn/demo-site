import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import jsxA11y from "eslint-plugin-jsx-a11y";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

import portfolioPlugin from "./eslint-plugin/index.js";

const portfolioRules = {
  "portfolio/no-transitive-reexports": "warn",
  "portfolio/no-trivial-wrappers": "warn",
};

const jsConfig = {
  ...js.configs.recommended,
  files: ["**/*.{js,mjs,cjs,jsx}"],
};

const nextBaseConfig = {
  ...nextPlugin.configs["core-web-vitals"],
  plugins: {
    "@next/next": nextPlugin,
  },
};

const nextEnhancements = {
  files: ["**/*.{js,jsx,ts,tsx}"],
  plugins: {
    "@next/next": nextPlugin,
    "jsx-a11y": jsxA11y,
    unicorn,
    sonarjs,
    security,
    portfolio: portfolioPlugin,
  },
  rules: {
    ...portfolioRules,
    "unicorn/no-null": "off",
    "unicorn/prefer-module": "off",
    "unicorn/filename-case": "off",
    "sonarjs/no-duplicate-string": "off",
    "security/detect-object-injection": "warn",
  },
};

const jsxA11yConfig = {
  files: ["**/*.{jsx,tsx}"],
  plugins: {
    "jsx-a11y": jsxA11y,
  },
  rules: jsxA11y.configs.recommended.rules,
};

const typeAwareConfigs = tseslint.configs.strictTypeChecked.map((config) => ({
  ...config,
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
    },
  },
}));

const stylisticTypeConfigs = tseslint.configs.stylisticTypeChecked.map((config) => ({
  ...config,
  files: ["**/*.{ts,tsx}"],
}));

const strictTypeRules = {
  files: ["**/*.{ts,tsx}"],
  rules: {
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
    "@typescript-eslint/no-unnecessary-condition": ["error", { allowConstantLoopConditions: true }],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/restrict-template-expressions": [
      "error",
      {
        allowNumber: true,
        allowBoolean: true,
        allowNullish: true,
      },
    ],
  },
};

const componentComplexityRule = {
  files: ["components/**/*.ts", "components/**/*.tsx"],
  rules: {
    "sonarjs/cognitive-complexity": ["error", 25],
  },
};

const testOverrides = {
  files: [
    "**/*.test.{ts,tsx,js,jsx}",
    "**/*.spec.{ts,tsx,js,jsx}",
    "**/test-setup.{ts,tsx,js,jsx}",
    "test-patterns/**/*.ts",
    "tests/**/*.test.{js,ts}",
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-unnecessary-condition": "off",
    "security/detect-object-injection": "off",
    "sonarjs/no-duplicate-string": "off",
    ...portfolioRules,
  },
};

export default [
  {
    ignores: [
      "node_modules/",
      ".next/",
      "dist/",
      "out/",
      ".vercel/",
      "coverage/**/*",
      "html/**/*",
      "reports/**/*",
      "test-patterns/**/*",
      ".tsbuildinfo",
      "*.config.js",
      "lint-staged.config.*",
      "commitlint.config.*",
      "prisma/migrations/",
      "prisma/dev.db",
      "prisma/dev.db-journal",
      "next-env.d.ts",
      "supabase/.branches",
      "supabase/.temp",
    ],
  },
  jsConfig,
  nextBaseConfig,
  nextEnhancements,
  jsxA11yConfig,
  ...typeAwareConfigs,
  ...stylisticTypeConfigs,
  strictTypeRules,
  componentComplexityRule,
  testOverrides,
  {
    files: ["lib/prisma.ts"],
    rules: {
      "@typescript-eslint/no-redundant-type-constituents": "off",
    },
  },
];
