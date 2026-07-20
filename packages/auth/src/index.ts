import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { ac, roles } from "#/permissions";
import type { DBType } from "@reactlith-template/db";
import { schema } from "@reactlith-template/db";

export function createAuth(
  db: DBType,
  authConfig: { secret: string | undefined; hosts: readonly string[] },
  googleAuthConfig: { clientId: string; clientSecret: string; emulateUrl: string | undefined },
) {
  const googleClientSecret = googleAuthConfig.clientSecret;

  return betterAuth({
    basePath: "/auth",
    baseURL: {
      allowedHosts: [...authConfig.hosts],
    },
    secret: authConfig.secret ? authConfig.secret : undefined,
    session: {
      cookieCache: {
        enabled: true,
        // 5 minutes
        maxAge: 5 * 60,
      },
    },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
    }),
    plugins: [
      admin({ ac, roles }),
      ...(googleAuthConfig.emulateUrl
        ? [
            genericOAuth({
              config: [
                {
                  providerId: "google-emulate",
                  clientId: googleAuthConfig.clientId,
                  clientSecret: googleClientSecret,
                  authorizationUrl: `${googleAuthConfig.emulateUrl}/o/oauth2/v2/auth`,
                  tokenUrl: `${googleAuthConfig.emulateUrl}/oauth2/token`,
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
      google: googleAuthConfig.emulateUrl
        ? undefined
        : {
            clientId: googleAuthConfig.clientId,
            clientSecret: googleClientSecret,
          },
    },
  });
}

export type AuthType = ReturnType<typeof createAuth>;

export type Permissions = {
  [K in keyof typeof ac.statements]?: (typeof ac.statements)[K][number][];
};
