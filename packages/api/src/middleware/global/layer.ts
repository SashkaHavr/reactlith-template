import { Effect, Layer, Predicate } from "effect";

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
      return yield* effect.pipe(
        Effect.tapError((error) =>
          Effect.sync(() => {
            if (Predicate.isError(error)) {
              log?.error({
                message:
                  Predicate.hasProperty(error, "_tag") && Predicate.isString(error._tag)
                    ? error._tag
                    : error.message,
                name: error.name,
                cause: error.cause,
                stack: error.stack,
              });
            }
          }),
        ),
      );
    }),
  ),
);
