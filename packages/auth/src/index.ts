import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { ac, roles } from "#/permissions";
import type { DBType } from "@reactlith-template/db";
import { schema } from "@reactlith-template/db";
import { getEnvAuth } from "@reactlith-template/env";

export function createAuth(db: DBType) {
  return betterAuth({
    basePath: "/api/auth",
    baseURL: {
      allowedHosts: getEnvAuth().BETTER_AUTH_ALLOWED_HOSTS,
    },
    secret: getEnvAuth().BETTER_AUTH_SECRET ? getEnvAuth().BETTER_AUTH_SECRET : undefined,
    session: {
      cookieCache: {
        enabled: true,
        // 5 minutes
        maxAge: 5 * 60,
      },
      // 1 year
      expiresIn: 60 * 60 * 24 * 365,
    },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    plugins: [
      admin({ ac, roles }),
      ...(getEnvAuth().GOOGLE_EMULATE_URL
        ? [
            genericOAuth({
              config: [
                {
                  providerId: "google-emulate",
                  clientId: getEnvAuth().GOOGLE_CLIENT_ID,
                  clientSecret: getEnvAuth().GOOGLE_CLIENT_SECRET,
                  authorizationUrl: `${getEnvAuth().GOOGLE_EMULATE_URL}/o/oauth2/v2/auth`,
                  tokenUrl: `${getEnvAuth().GOOGLE_EMULATE_URL}/oauth2/token`,
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
      google: getEnvAuth().GOOGLE_EMULATE_URL
        ? undefined
        : {
            clientId: getEnvAuth().GOOGLE_CLIENT_ID,
            clientSecret: getEnvAuth().GOOGLE_CLIENT_SECRET,
          },
    },
  });
}

export type AuthType = ReturnType<typeof createAuth>;

export type Permissions = {
  [K in keyof typeof ac.statements]?: (typeof ac.statements)[K][number][];
};
