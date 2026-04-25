import { defineConfig } from "oxlint";

export default defineConfig({
  $schema: "./node_modules/oxlint/configuration_schema.json",
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
        ignore: "^*.gen.ts|\\$.*tsx$",
      },
    ],
  },
  overrides: [
    {
      files: ["*.config.ts"],
      rules: { "import/no-default-export": "off" },
    },
  ],
  options: {
    typeAware: true,
    typeCheck: true,
  },
});
