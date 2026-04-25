import { defineConfig } from "oxlint";

import baseConfig from "../../oxlint.config";

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
  },
  overrides: [
    {
      files: ["src/components/ui/**", "src/utils/cookie.ts"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
  ],
});
