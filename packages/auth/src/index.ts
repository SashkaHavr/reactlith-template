import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { admin, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Effect, Option, Redacted } from "effect";

import { ac, roles } from "#permissions";
import { schema } from "@reactlith-template/db";
import type { DBType } from "@reactlith-template/db";
import { AuthConfig } from "@reactlith-template/services/auth-config";

export function createAuth(db: DBType) {
  const config = Effect.runSync(AuthConfig.make);
  const googleEmulateUrl = config.googleEmulateUrl.pipe(Option.getOrUndefined);

  return betterAuth({
    basePath: "/api/auth",
    baseURL: {
      allowedHosts: [...config.allowedHosts],
    },
    secret: Redacted.value(config.secret) || undefined,
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
      ...(googleEmulateUrl
        ? [
            genericOAuth({
              config: [
                {
                  providerId: "google-emulate",
                  clientId: config.googleClientId,
                  clientSecret: Redacted.value(config.googleClientSecret),
                  authorizationUrl: new URL("/o/oauth2/v2/auth", googleEmulateUrl).href,
                  tokenUrl: new URL("/oauth2/token", googleEmulateUrl).href,
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
      google: {
        clientId: config.googleClientId,
        clientSecret: Redacted.value(config.googleClientSecret),
        enabled: googleEmulateUrl === undefined,
      },
    },
  });
}

export type AuthType = ReturnType<typeof createAuth>;

export type Permissions = {
  [K in keyof typeof ac.statements]?: (typeof ac.statements)[K][number][];
};
