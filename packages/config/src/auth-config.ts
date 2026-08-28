import { Config, Context, Effect, Layer, Option, Redacted, Schema } from "effect";

export class AuthConfig extends Context.Service<AuthConfig>()("services/AuthConfig", {
  make: Effect.gen(function* () {
    const isDevelopment = yield* Config.string("NODE_ENV").pipe(
      Config.option,
      Config.map(Option.contains("development")),
    );
    const allowedHosts = Config.schema(
      Config.Array(Schema.NonEmptyString),
      "BETTER_AUTH_ALLOWED_HOSTS",
    );
    const secret = Config.redacted("BETTER_AUTH_SECRET");

    return yield* Config.all({
      allowedHosts: isDevelopment
        ? allowedHosts.pipe(Config.withDefault(["localhost:*", "127.0.0.1:*"]))
        : allowedHosts,
      secret: isDevelopment ? secret.pipe(Config.withDefault(Redacted.make(""))) : secret,
      googleClientId: Config.nonEmptyString("GOOGLE_CLIENT_ID"),
      googleClientSecret: Config.redacted("GOOGLE_CLIENT_SECRET"),
      googleEmulateUrl: Config.url("GOOGLE_EMULATE_URL").pipe(Config.option),
    });
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
