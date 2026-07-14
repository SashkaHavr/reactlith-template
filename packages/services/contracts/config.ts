import type { Redacted } from "effect";
import { Context } from "effect";

export class ConfigNode extends Context.Service<
  ConfigNode,
  {
    readonly ENV: "development" | "production" | "test";
  }
>()("services/ConfigNode") {}

export class ConfigDB extends Context.Service<
  ConfigDB,
  {
    readonly URL: Redacted.Redacted;
  }
>()("services/ConfigDB") {}
