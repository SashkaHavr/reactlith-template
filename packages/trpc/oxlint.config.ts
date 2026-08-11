import { defineConfig } from "oxlint";

import baseConfig from "../../oxlint.config.ts";

export default defineConfig({
  extends: [baseConfig],
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
});
