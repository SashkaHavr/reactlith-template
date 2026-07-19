import { defineConfig, configDefaults } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  test: {
    exclude: [...configDefaults.exclude, "references"],
  },
  fmt: {
    ignorePatterns: ["**/*.gen.ts", "**/drizzle", "**/generated", "**/dist"],
    sortImports: { internalPattern: ["@reactlith-template", "~/"] },
    overrides: [
      {
        files: ["apps/web"],
        sortTailwindcss: { stylesheet: "./apps/web/src/index.css" },
      },
    ],
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    ignorePatterns: ["**/generated/**", "*.gen.ts"],
    plugins: [
      "eslint",
      "typescript",
      "unicorn",
      "oxc",
      "import",
      "jsdoc",
      "node",
      "promise",
      "jest",
      "react",
      "jsx-a11y",
    ],
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
      "require-yield": "off",

      "typescript/no-misused-promises": "error",
      "typescript/consistent-type-imports": "error",
      "typescript/no-import-type-side-effects": "error",
      "typescript/no-unsafe-type-assertion": "off",
      "typescript/promise-function-async": "error",
      "typescript/strict-boolean-expressions": [
        "error",
        { allowNullableBoolean: true, allowNullableString: true },
      ],
      "typescript/return-await": ["error", "error-handling-correctness-only"],
      "typescript/consistent-return": "off",

      "import/consistent-type-specifier-style": "error",
      "import/no-default-export": "error",
      "import/no-named-as-default-member": "off",
      "import/no-named-as-default": "off",

      "react/react-in-jsx-scope": "off",

      "promise/always-return": ["error", { ignoreLastCallback: true }],

      "unicorn/filename-case": [
        "error",
        {
          ignore: ["^*.gen.ts", "\\$.*tsx$"],
        },
      ],

      "jsx-a11y/prefer-tag-over-role": "off",
    },
    overrides: [
      {
        files: ["*.config.ts"],
        rules: { "import/no-default-export": "off" },
      },
      {
        files: ["packages/trpc/**"],
        rules: {
          "no-restricted-imports": [
            "error",
            {
              paths: [
                {
                  name: "@reactlith-template/db",
                  importNames: ["db"],
                  allowTypeImports: true,
                },
                {
                  name: "@reactlith-template/auth",
                  importNames: ["auth"],
                  allowTypeImports: true,
                },
              ],
            },
          ],
        },
      },
      {
        files: ["apps/web/**"],
        rules: {
          "no-restricted-imports": [
            "error",
            {
              patterns: [
                {
                  group: ["@base-ui/**"],
                },
              ],
              paths: [
                {
                  name: "@tanstack/react-start/server",
                  importNames: ["getCookie", "setCookie", "deleteCookie"],
                },
              ],
            },
          ],
        },
        env: {
          browser: true,
        },
      },
      {
        files: ["apps/web/src/components/ui/**", "apps/web/src/utils/cookie.ts"],
        rules: {
          "no-restricted-imports": "off",
        },
      },
    ],
    options: { typeAware: true, typeCheck: true },
  },
});
