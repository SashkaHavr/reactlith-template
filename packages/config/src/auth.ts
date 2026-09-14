import { Config, Context, Layer, Schema } from "effect";

export class AuthConfig extends Context.Service<AuthConfig>()("services/AuthConfig", {
  make: Config.all({
    allowedHosts: Config.Array(Schema.NonEmptyString, ["BETTER", "AUTH", "ALLOWED", "HOSTS"]),
    ipAddressHeaders: Config.Array(Schema.NonEmptyString, [
      "BETTER",
      "AUTH",
      "IP",
      "ADDRESS",
      "HEADERS",
    ]).pipe(Config.option),
    secret: Config.Redacted("BETTER_AUTH_SECRET"),
    googleClientId: Config.NonEmptyString("GOOGLE_CLIENT_ID"),
    googleClientSecret: Config.Redacted("GOOGLE_CLIENT_SECRET"),
    googleEmulateUrl: Config.URL("GOOGLE_EMULATE_URL").pipe(Config.option),
    googleEmulateInternalUrl: Config.URL("GOOGLE_EMULATE_INTERNAL_URL").pipe(Config.option),
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
