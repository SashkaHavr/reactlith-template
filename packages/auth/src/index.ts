import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

import { logPlugin } from "#log-plugin.ts";
import { ac, roles } from "#permissions.ts";
import { db } from "@reactlith-template/db";
import { envAuth } from "@reactlith-template/env/auth";

export const auth = betterAuth({
  basePath: "/auth",
  baseURL: {
    allowedHosts: [...envAuth.BETTER_AUTH_ALLOWED_HOSTS],
  },
  secret: envAuth.BETTER_AUTH_SECRET,
  session: {
    cookieCache: {
      enabled: true,
      // 5 minutes
      maxAge: 5 * 60,
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  plugins: [admin({ ac, roles }), logPlugin],
  emailAndPassword: {
    enabled: envAuth.TEST_AUTH,
    disableSignUp: true,
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
});

export type AuthType = typeof auth;

export type Permissions = {
  [K in keyof typeof ac.statements]?: (typeof ac.statements)[K][number][];
};
