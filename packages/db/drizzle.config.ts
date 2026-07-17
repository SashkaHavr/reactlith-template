// oxlint-disable node/no-process-env
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL as string },
});
