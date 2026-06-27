import { Config, Layer, Schema } from "effect";

import { ConfigDB, ConfigNode } from "#config.ts";

export const ConfigNodeLive = Layer.effect(
  ConfigNode,
  Config.schema(
    Schema.Struct({
      ENV: Schema.Literals(["development", "production", "test"]),
    }),
    "NODE",
  ),
);

export const ConfigDBLive = Layer.effect(
  ConfigDB,
  Config.schema(
    Schema.Struct({
      URL: Schema.String,
    }),
    "DATABASE",
  ),
);
