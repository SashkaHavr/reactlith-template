import type { Redacted } from "effect";
import { Context } from "effect";

export class ConfigNode extends Context.Service<
  ConfigNode,
  {
    readonly ENV: "development" | "production" | "test";
  }
>()("@reactlith-template/config-node") {}

export class ConfigDB extends Context.Service<
  ConfigDB,
  {
    readonly URL: Redacted.Redacted;
  }
>()("@reactlith-template/config-db") {}
