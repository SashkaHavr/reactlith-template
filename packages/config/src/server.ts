import { Config, Context, Layer } from "effect";

export class ServerConfig extends Context.Service<ServerConfig>()("services/ServerConfig", {
  make: Config.all({
    nodeEnv: Config.Literals(["development", "production", "test"], "NODE_ENV"),
    publicUrl: Config.URL("PUBLIC_URL"),
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
