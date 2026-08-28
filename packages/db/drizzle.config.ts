import { defineConfig } from "drizzle-kit";
import { Effect, Redacted } from "effect";

import { DBConfig } from "@reactlith-template/config/db-config";

const config = Effect.runSync(DBConfig.make);

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: Redacted.value(config.databaseUrl) },
});
