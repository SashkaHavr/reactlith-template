import { defineConfig } from "drizzle-kit";
import { Effect, Redacted } from "effect";

import { DBConfig } from "@reactlith-template/config/db";

const config = await Effect.runPromise(DBConfig.make);

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: Redacted.value(config.databaseUrl) },
});
