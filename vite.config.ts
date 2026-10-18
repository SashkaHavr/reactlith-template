import effectAntipattern from "@effect/tsgo/oxlint-presets/antipattern.json" with { type: "json" };
import effectCorrectness from "@effect/tsgo/oxlint-presets/correctness.json" with { type: "json" };
import effectNative from "@effect/tsgo/oxlint-presets/effect-native.json" with { type: "json" };
import effectRecommended from "@effect/tsgo/oxlint-presets/recommended.json" with { type: "json" };
import { defineConfig, defaultExclude } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    $schema: "./node_modules/oxfmt/configuration_schema.json",
    ignorePatterns: ["**/*.gen.ts", "**/generated/auth-schema.ts", "**/dist"],
    sortImports: { internalPattern: ["@reactlith-template", "~/"] },
    sortTailwindcss: { stylesheet: "./apps/web/src/index.css" },
  },
  test: {
    mockReset: true,
    projects: [
      {
        test: {
          name: "unit",
          include: ["{apps,packages}/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
          exclude: [...defaultExclude, "{apps,packages}/**/repo.{test,spec}.?(c|m)[jt]s?(x)"],
        },
      },
      {
        test: {
          name: "repo",
          maxWorkers: "50%",
          sequence: { groupOrder: 1 },
          globalSetup: "./vitest.db-setup.ts",
          include: ["{apps,packages}/**/repo.{test,spec}.?(c|m)[jt]s?(x)"],
        },
      },
    ],
  },
  lint: {
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
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    env: {
      browser: true,
    },
    categories: {
      correctness: "error",
      suspicious: "error",
    },
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",

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
      "effecttsgo/unstable-api-usage": "off",
      "effecttsgo/schema-class-missing-brand": "off",
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
    options: { typeAware: true, typeCheck: true },
  },
});
