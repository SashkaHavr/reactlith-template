import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Redacted } from "effect";

import { ac, roles } from "#permissions.ts";
import type { DBType } from "@reactlith-template/db";
import * as schema from "@reactlith-template/db/schema";

export function createAuth(
  db: DBType,
  authConfig: {
    readonly ALLOWED_HOSTS: ReadonlyArray<string>;
    readonly SECRET: Redacted.Redacted | undefined;
  },
  googleAuthConfig: {
    readonly CLIENT_ID: string;
    readonly CLIENT_SECRET: Redacted.Redacted;
    readonly EMULATE_URL: string | undefined;
  },
) {
  const googleClientSecret = Redacted.value(googleAuthConfig.CLIENT_SECRET);

  return betterAuth({
    basePath: "/auth",
    baseURL: {
      allowedHosts: [...authConfig.ALLOWED_HOSTS],
    },
    secret: authConfig.SECRET ? Redacted.value(authConfig.SECRET) : undefined,
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
      ...(googleAuthConfig.EMULATE_URL
        ? [
            genericOAuth({
              config: [
                {
                  providerId: "google-emulate",
                  clientId: googleAuthConfig.CLIENT_ID,
                  clientSecret: googleClientSecret,
                  authorizationUrl: `${googleAuthConfig.EMULATE_URL}/o/oauth2/v2/auth`,
                  tokenUrl: `${googleAuthConfig.EMULATE_URL}/oauth2/token`,
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
      google: googleAuthConfig.EMULATE_URL
        ? undefined
        : {
            clientId: googleAuthConfig.CLIENT_ID,
            clientSecret: googleClientSecret,
          },
    },
  });
}

export type AuthType = ReturnType<typeof createAuth>;

export type Permissions = {
  [K in keyof typeof ac.statements]?: (typeof ac.statements)[K][number][];
};
