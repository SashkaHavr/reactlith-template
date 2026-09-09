import { Effect, Layer, Predicate } from "effect";

import { StructuredLogger } from "@reactlith-template/services/structured-logger";

import { GlobalMiddleware } from "./schema";

export const GlobalMiddlewareLive = Layer.effect(
  GlobalMiddleware,
  Effect.gen(function* () {
    const log = yield* StructuredLogger;

    return GlobalMiddleware.of((effect, { endpoint, group }) =>
      Effect.gen(function* () {
        yield* log?.set({
          api: { path: `${group.identifier}.${endpoint.identifier}` },
        });
        return yield* effect.pipe(
          Effect.tapError((error) =>
            Effect.gen(function* () {
              if (Predicate.isError(error)) {
                yield* log?.error({
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
    );
  }),
);
