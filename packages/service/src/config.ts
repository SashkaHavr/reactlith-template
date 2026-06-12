import { Context } from "effect";

export class ConfigNode extends Context.Service<
  ConfigNode,
  { NODE_ENV: "development" | "production" | "test" }
>()("@reactlith-template/config-node") {}
