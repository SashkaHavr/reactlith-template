import { Config, Effect, Layer } from "effect";

import { ConfigNode } from "#config.ts";

export const ConfigNodeLive = Layer.effect(
  ConfigNode,
  Effect.gen(function* () {
    return {
      NODE_ENV: yield* Config.literals(["development", "production", "test"]),
    };
  }),
);
