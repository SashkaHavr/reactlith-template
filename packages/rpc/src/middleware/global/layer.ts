import { Effect, Layer } from "effect";

import { RpcLogger } from "#context";

import { GlobalMiddleware } from "./schema";

export const GlobalMiddlewareLive = Layer.succeed(GlobalMiddleware)(
  GlobalMiddleware.of((effect, options) =>
    Effect.gen(function* () {
      const log = yield* RpcLogger;
      log?.set({
        rpc: { path: options.rpc._tag },
        package: "rpc",
      });
      return yield* effect;
    }),
  ),
);
