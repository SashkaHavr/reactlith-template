import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import * as schema from "@reactlith-template/db/schema";
import { ac, roles } from "#permissions.ts";

export const auth = betterAuth({
  database: drizzleAdapter({schema: schema}, {provider: "pg"}),
  plugins: [admin({ ac, roles })],
  advanced: {
    database: {
      generateId: false,
    },
  },
});

