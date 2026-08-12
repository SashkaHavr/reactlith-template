import { defineConfig } from "oxlint";

import baseConfig from "../../oxlint.config.ts";

export default defineConfig({
  extends: [baseConfig],
  jsPlugins: ["../../oxlint.plugins.js"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "@trpc/server",
            importNames: ["TRPCError"],
            message: 'Use `import { TRPCError } from "#context"` instead',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ["src/routers/*/service.ts", "src/routers/*/repo.ts"],
      rules: {
        "local/no-catch": "error",
        "local/no-throw": "error",
      },
    },
  ],
});
