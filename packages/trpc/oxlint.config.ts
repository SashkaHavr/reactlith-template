import { defineConfig } from "oxlint";

import baseConfig from "../../oxlint.config";

export default defineConfig({
  extends: [baseConfig],
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
  overrides: [
    {
      files: ["src/context.ts"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
  ],
});
