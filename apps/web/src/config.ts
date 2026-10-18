import { Config, Context, Layer } from "effect";

export class WebConfig extends Context.Service<WebConfig>()("web/WebConfig", {
  make: Config.all({
    publicUrl: Config.URL("PUBLIC_URL"),
    apiInternalUrl: Config.URL("API_INTERNAL_URL").pipe(
      Config.withDefault(new URL("http://localhost:3001")),
    ),
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
