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
            name: "drizzle-orm/pg-core",
            importNames: ["pgTable", "camelCase"],
            allowTypeImports: true,
            message: "Use snakeCase.table instead",
          },
        ],
      },
    ],
  },
});
