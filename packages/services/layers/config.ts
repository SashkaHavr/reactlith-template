import { Config, Effect, Layer, Schema } from "effect";

import { AuthConfig, ConfigDB, ConfigNode, GoogleAuthConfig } from "#config.ts";

export const layerConfigNode = Layer.effect(
  ConfigNode,
  Config.schema(
    Schema.Struct({
      ENV: Schema.Literals(["development", "production", "test"]),
    }),
    "NODE",
  ),
);

export const layerConfigDB = Layer.effect(
  ConfigDB,
  Config.schema(
    Schema.Struct({
      URL: Schema.Redacted(Schema.String),
    }),
    "DATABASE",
  ),
);

export const layerAuthConfig = Layer.effect(
  AuthConfig,
  Effect.gen(function* () {
    const configNode = yield* ConfigNode;

    const authSchema = Schema.Struct({
      ALLOWED_HOSTS: Schema.Array(Schema.NonEmptyString),
      SECRET: Schema.Redacted(Schema.NonEmptyString),
    });
    const authPrefix = ["BETTER", "AUTH"];

    return yield* configNode.ENV === "development"
      ? Config.schema(
          Schema.Struct({
            ...authSchema.fields,
            SECRET: Schema.UndefinedOr(authSchema.fields.SECRET),
          }),
          authPrefix,
        ).pipe(
          Config.withDefault({
            ALLOWED_HOSTS: ["localhost:*", "127.0.0.1:*"],
            SECRET: undefined,
          }),
        )
      : Config.schema(authSchema, authPrefix);
  }),
);

export const layerGoogleAuthConfig = Layer.effect(
  GoogleAuthConfig,
  Config.schema(
    Schema.Struct({
      CLIENT_ID: Schema.NonEmptyString,
      CLIENT_SECRET: Schema.Redacted(Schema.NonEmptyString),
      EMULATE_URL: Schema.UndefinedOr(Schema.NonEmptyString),
    }),
    "GOOGLE",
  ),
);
