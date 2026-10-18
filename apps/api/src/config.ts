import { Config, Context, Layer } from "effect";

export class ApiConfig extends Context.Service<ApiConfig>()("api/ApiConfig", {
  make: Config.all({
    port: Config.Port("PORT").pipe(Config.withDefault(3001)),
    otelServiceName: Config.NonEmptyString("OTEL_SERVICE_NAME").pipe(Config.option),
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
