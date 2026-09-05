import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { admin, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Context, Effect, Layer, Option, Redacted } from "effect";

import { ac, roles } from "#permissions";
import { AuthConfig } from "@reactlith-template/config/auth";
import { DrizzlePostgresClient, schema } from "@reactlith-template/db";

export class BetterAuthServerClient extends Context.Service<BetterAuthServerClient>()(
  "auth/BetterAuthServerClient",
  {
    make: Effect.gen(function* () {
      const db = yield* DrizzlePostgresClient;
      const config = yield* AuthConfig;
      const googleEmulateUrl = Option.getOrUndefined(config.googleEmulateUrl);

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
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(AuthConfig.layer),
    Layer.provideMerge(DrizzlePostgresClient.layer),
  );
  static readonly layerWithoutDependencies = Layer.effect(this, this.make);
}

export type AuthType = Effect.Success<typeof BetterAuthServerClient.make>;

export type AuthPermissions = {
  [K in keyof typeof ac.statements]?: (typeof ac.statements)[K][number][];
};
