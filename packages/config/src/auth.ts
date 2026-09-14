import { Config, Context, Layer, Schema } from "effect";

export class AuthConfig extends Context.Service<AuthConfig>()("services/AuthConfig", {
  make: Config.all({
    allowedHosts: Config.schema(Config.Array(Schema.NonEmptyString), [
      "BETTER",
      "AUTH",
      "ALLOWED",
      "HOSTS",
    ]),
    ipAddressHeaders: Config.schema(Config.Array(Schema.NonEmptyString), [
      "BETTER",
      "AUTH",
      "IP",
      "ADDRESS",
      "HEADERS",
    ]).pipe(Config.option),
    secret: Config.redacted("BETTER_AUTH_SECRET"),
    googleClientId: Config.nonEmptyString("GOOGLE_CLIENT_ID"),
    googleClientSecret: Config.redacted("GOOGLE_CLIENT_SECRET"),
    googleEmulateUrl: Config.url("GOOGLE_EMULATE_URL").pipe(Config.option),
    googleEmulateInternalUrl: Config.url("GOOGLE_EMULATE_INTERNAL_URL").pipe(Config.option),
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
