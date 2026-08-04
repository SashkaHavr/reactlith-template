import { defineConfig } from "drizzle-kit";

import { getEnvDB } from "@reactlith-template/env";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: getEnvDB().DATABASE_URL },
});
