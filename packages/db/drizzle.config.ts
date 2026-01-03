import { envDB } from "@reactlith-template/env/db";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema",
  dialect: "postgresql",
  dbCredentials: { url: envDB.DATABASE_URL },
  casing: "snake_case",
});
