import { Config, Layer, Schema } from "effect";

import { ConfigDB, ConfigNode } from "#config.ts";

export const layerConfigNode = Layer.effect(
  ConfigNode,
  Config.schema(
    Schema.Struct({
      ENV: Schema.Literals(["development", "production", "test"]),
    }),
    "NODE",
  ),
);

export const layerConfigDB = Layer.effect(
  ConfigDB,
  Config.schema(
    Schema.Struct({
      URL: Schema.Redacted(Schema.String),
    }),
    "DATABASE",
  ),
);
