import { Effect, Layer, Predicate } from "effect";

import { StructuredLogger } from "@reactlith-template/services/structured-logger";

import { GlobalMiddleware } from "./schema";

export const GlobalMiddlewareLive = Layer.effect(
  GlobalMiddleware,
  Effect.gen(function* () {
    const log = yield* StructuredLogger;
    const logError = Effect.fn(function* (error: unknown) {
      if (Predicate.isError(error)) {
        const tag =
          Predicate.hasProperty(error, "_tag") && Predicate.isString(error._tag)
            ? error._tag
            : undefined;
        yield* log?.error(
          {
            message: error.message !== "" ? error.message : (tag ?? ""),
            name: error.name,
            cause: error.cause,
            stack: error.stack,
          },
          {
            _tag: tag,
          },
        );
      }
    });

    return GlobalMiddleware.of((effect, { endpoint, group }) =>
      Effect.gen(function* () {
        yield* log?.set({
          api: { path: `${group.identifier}.${endpoint.identifier}` },
        });
        return yield* effect.pipe(Effect.tapError(logError), Effect.tapDefect(logError));
      }),
    );
  }),
);
