import { Config, Context, Layer } from "effect";

export class DBConfig extends Context.Service<DBConfig>()("services/DBConfig", {
  make: Config.all({
    databaseUrl: Config.Redacted("DATABASE_URL"),
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
