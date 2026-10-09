import { Config, Context, Layer } from "effect";

export class TelemetryConfig extends Context.Service<TelemetryConfig>()(
  "services/TelemetryConfig",
  {
    make: Config.all({
      disabled: Config.Boolean("OTEL_SDK_DISABLED").pipe(Config.withDefault(false)),
      endpoint: Config.String("OTEL_EXPORTER_OTLP_ENDPOINT").pipe(Config.option),
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
