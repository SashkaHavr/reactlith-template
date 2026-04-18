import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

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
  plugins: [
    admin({ ac, roles }),
    logPlugin,
    ...(envAuth.GOOGLE_EMULATE_URL
      ? [
          genericOAuth({
            config: [
              {
                providerId: "google-emulate",
                clientId: envAuth.GOOGLE_CLIENT_ID,
                clientSecret: envAuth.GOOGLE_CLIENT_SECRET,
                authorizationUrl: `${envAuth.GOOGLE_EMULATE_URL}/o/oauth2/v2/auth`,
                tokenUrl: `${envAuth.GOOGLE_EMULATE_URL}/oauth2/token`,
              },
            ],
          }),
        ]
      : []),
    tanstackStartCookies(),
  ],
  advanced: {
    database: {
      generateId: false,
    },
  },
  socialProviders: {
    google: envAuth.GOOGLE_EMULATE_URL
      ? undefined
      : {
          clientId: envAuth.GOOGLE_CLIENT_ID,
          clientSecret: envAuth.GOOGLE_CLIENT_SECRET,
        },
  },
});

export type AuthType = typeof auth;

export type Permissions = {
  [K in keyof typeof ac.statements]?: (typeof ac.statements)[K][number][];
};
