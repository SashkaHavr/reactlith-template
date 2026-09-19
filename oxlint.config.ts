import effectAntipattern from "@effect/tsgo/oxlint-presets/antipattern.json" with { type: "json" };
import effectCorrectness from "@effect/tsgo/oxlint-presets/correctness.json" with { type: "json" };
import effectNative from "@effect/tsgo/oxlint-presets/effect-native.json" with { type: "json" };
import effectRecommended from "@effect/tsgo/oxlint-presets/recommended.json" with { type: "json" };
import { defineConfig } from "oxlint";

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",
  ignorePatterns: ["**/generated/**", "*.gen.ts", "*.js", "packages/oxlint/**"],
  plugins: [
    "eslint",
    "typescript",
    "unicorn",
    "oxc",
    "import",
    "jsdoc",
    "node",
    "promise",
    "vitest",
    "react",
    "jsx-a11y",
    "effecttsgo",
  ],
  env: {
    browser: true,
  },
  categories: {
    correctness: "error",
    suspicious: "error",
  },
  rules: {
    eqeqeq: "error",
    curly: ["error", "multi-line"],
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "no-var": "error",
    "no-process-env": "error",
    "no-shadow": "off",
    "typescript/only-throw-error": "error",
    "no-underscore-dangle": "off",

    "typescript/no-misused-promises": "error",
    "typescript/consistent-type-imports": "error",
    "typescript/no-import-type-side-effects": "error",
    "typescript/no-unsafe-type-assertion": "off",
    "typescript/promise-function-async": "error",
    "typescript/strict-boolean-expressions": [
      "error",
      { allowNullableBoolean: true, allowNullableString: true, allowAny: true },
    ],
    "typescript/return-await": ["error", "error-handling-correctness-only"],
    "typescript/consistent-return": "off",

    "import/consistent-type-specifier-style": "error",
    "import/no-default-export": "error",
    "import/no-named-as-default-member": "off",
    "import/no-named-as-default": "off",
    "import/namespace": ["error", { allowComputed: true }],

    "react/react-in-jsx-scope": "off",

    "promise/always-return": ["error", { ignoreLastCallback: true }],

    "unicorn/filename-case": [
      "error",
      {
        ignore: ["^*.gen.ts", "\\$.*tsx$"],
      },
    ],

    "jsx-a11y/prefer-tag-over-role": "off",

    ...Object.fromEntries(Object.keys(effectCorrectness.rules).map((k) => [k, "error" as const])),
    ...Object.fromEntries(Object.keys(effectAntipattern.rules).map((k) => [k, "error" as const])),
    ...Object.fromEntries(Object.keys(effectRecommended.rules).map((k) => [k, "error" as const])),
    ...Object.fromEntries(Object.keys(effectNative.rules).map((k) => [k, "off" as const])),

    "effecttsgo/new-schema-class": "error",
    "effecttsgo/strict-effect-provide": "off",
    "vitest/no-standalone-expect": "off",
    "no-restricted-imports": [
      "error",
      {
        paths: [{ name: "@effect/vitest", allowImportNames: ["layer"] }],
      },
    ],
  },
  overrides: [
    {
      files: ["*.config.ts"],
      rules: { "import/no-default-export": "off" },
    },
    {
      files: ["./packages/db/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                name: "drizzle-orm/pg-core",
                importNames: ["pgTable", "camelCase"],
                allowTypeImports: true,
                message: "Use snakeCase.table instead",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["./apps/web/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@base-ui/**"],
              },
              {
                group: ["server-resources"],
              },
            ],
          },
        ],
        "typescript/only-throw-error": "off",
      },
    },
    {
      files: ["**/src/components/ui/**"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
  ],
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
