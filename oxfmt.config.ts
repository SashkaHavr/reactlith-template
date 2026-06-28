import { defineConfig } from "oxfmt";

export default defineConfig({
  $schema: "./node_modules/oxfmt/configuration_schema.json",
  ignorePatterns: ["**/*.gen.ts", "**/drizzle", "**/generated", "**/dist"],
  overrides: [
    {
      files: ["apps/web"],
      sortTailwindcss: { stylesheet: "./apps/web/src/index.css" },
    },
  ],
});
