import { defineConfig } from "oxlint";

import baseConfig from "../../oxlint.config.ts";

export default defineConfig({
  extends: [baseConfig],
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
    "typescript/only-throw-error": "off",
  },
  overrides: [
    {
      files: ["src/components/ui/**"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
  ],
});
