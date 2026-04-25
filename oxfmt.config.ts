import { defineConfig } from "oxfmt";

export default defineConfig({
  $schema: "./node_modules/oxfmt/configuration_schema.json",
  ignorePatterns: ["**/*.gen.ts", "**/drizzle", "**/generated", "**/dist"],
  sortImports: { internalPattern: ["@reactlith-template", "~/"] },
  sortTailwindcss: { stylesheet: "./apps/web/src/index.css" },
});
