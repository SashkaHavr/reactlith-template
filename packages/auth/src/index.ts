import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";

import { adminPluginOptions } from "#permissions.ts";
import { db } from "@reactlith-template/db";
import { envAuth } from "@reactlith-template/env/auth";

export const auth = betterAuth({
  basePath: "/auth",
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
  socialProviders: {
    github:
      envAuth.GITHUB_CLIENT_ID && envAuth.GITHUB_CLIENT_SECRET
        ? {
            clientId: envAuth.GITHUB_CLIENT_ID,
            clientSecret: envAuth.GITHUB_CLIENT_SECRET,
          }
        : undefined,
  },
  plugins: [
    admin({
      ...adminPluginOptions,
    }),
  ],
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
  [K in keyof typeof adminPluginOptions.ac.statements]: (typeof adminPluginOptions.ac.statements)[K][number][];
};
