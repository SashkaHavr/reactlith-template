import { Context, Effect, Layer, Option } from "effect";
import type { AuditableLogger } from "evlog";
import { EvlogLogger } from "evlog/effect";
import { flattenRecord } from "evlog/toolkit";

const getLogger = Effect.serviceOption(EvlogLogger).pipe(Effect.map(Option.getOrUndefined));

export class StructuredLogger extends Context.Service<StructuredLogger>()(
  "services/StructuredLogger",
  {
    make: Effect.succeed({
      set: Effect.fnUntraced(function* (context) {
        const log = yield* getLogger;

        yield* Effect.sync(() => log?.set(context));
        yield* Effect.annotateCurrentSpan(flattenRecord(context));
      } satisfies AuditableLogger["set"]),
      error: Effect.fnUntraced(function* (error, context?) {
        const log = yield* getLogger;

        yield* Effect.sync(() => log?.error(error, context));
      } satisfies AuditableLogger["error"]),
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
