import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { ac, roles } from "#permissions.ts";

export const auth = betterAuth({
  database: drizzleAdapter({}, {provider: "pg"}),
  plugins: [admin({ ac, roles })],
  advanced: {
    database: {
      generateId: false,
    },
  },
});

