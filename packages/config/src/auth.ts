import { Config, Context, Effect, Layer, Schema } from "effect";

export class AuthConfig extends Context.Service<AuthConfig>()("services/AuthConfig", {
  make: Effect.gen(function* () {
    return yield* Config.all({
      allowedHosts: Config.schema(Config.Array(Schema.NonEmptyString), "BETTER_AUTH_ALLOWED_HOSTS"),
      secret: Config.redacted("BETTER_AUTH_SECRET"),
      googleClientId: Config.nonEmptyString("GOOGLE_CLIENT_ID"),
      googleClientSecret: Config.redacted("GOOGLE_CLIENT_SECRET"),
      googleEmulateUrl: Config.url("GOOGLE_EMULATE_URL").pipe(Config.option),
      googleEmulateInternalUrl: Config.url("GOOGLE_EMULATE_INTERNAL_URL").pipe(Config.option),
    });
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
