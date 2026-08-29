import { Effect, Layer } from "effect";

import { ApiLogger } from "#context";

import { GlobalMiddleware } from "./schema";

export const GlobalMiddlewareLive = Layer.succeed(GlobalMiddleware)(
  GlobalMiddleware.of((effect, { endpoint, group }) =>
    Effect.gen(function* () {
      const log = yield* ApiLogger.get;
      log?.set({
        api: { path: `${group.identifier}.${endpoint.identifier}` },
        package: "api",
      });
      return yield* effect;
    }),
  ),
);
