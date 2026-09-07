import { Config, Context, Layer } from "effect";

export class ServerConfig extends Context.Service<ServerConfig>()("services/ServerConfig", {
  make: Config.all({
    nodeEnv: Config.literals(["development", "production", "test"], "NODE_ENV"),
    publicUrl: Config.url("PUBLIC_URL"),
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
