import { Context, Effect, Layer, Option, Predicate } from "effect";
import type { AuditableLogger } from "evlog";
import { flattenRecord } from "evlog/toolkit";

export class Evlog extends Context.Service<Evlog, AuditableLogger>()("services/Evlog") {
  static readonly get = Effect.serviceOption(Evlog).pipe(Effect.map(Option.getOrUndefined));
}

export class StructuredLogger extends Context.Service<StructuredLogger>()(
  "services/StructuredLogger",
  {
    make: Effect.succeed({
      set: Effect.fnUntraced(function* (context) {
        const log = yield* Evlog.get;

        yield* Effect.sync(() => log?.set(context));
        yield* Effect.annotateCurrentSpan(flattenRecord(context));
      } satisfies AuditableLogger["set"]),
      error: Effect.fnUntraced(function* (error, context?) {
        const log = yield* Evlog.get;

        yield* Effect.sync(() => log?.error(error, context));

        if (Predicate.isString(error)) {
          yield* Effect.logError(error).pipe(Effect.annotateLogs(flattenRecord({ ...context })));
        } else {
          yield* Effect.logError(error.message).pipe(
            Effect.annotateLogs(
              flattenRecord({
                ...context,
                name: error.name,
                cause: error.cause,
                stack: error.stack,
              }),
            ),
          );
        }
      } satisfies AuditableLogger["error"]),
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
