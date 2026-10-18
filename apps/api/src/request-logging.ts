import { Cause, Clock, Effect, Exit, Option } from "effect";
import { HttpRouter, HttpServerRequest, HttpTraceContext } from "effect/http";
import { createRequestLogger } from "evlog";

import { Evlog } from "@reactlith-template/services/structured-logger";

export const RequestLogging = HttpRouter.middleware((httpEffect) =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const startedAt = yield* Clock.currentTimeMillis;
    const traceId = HttpTraceContext.fromHeaders(request.headers).pipe(
      Option.map((span) => span.traceId),
      Option.getOrUndefined,
    );
    const log = createRequestLogger({ method: request.method, path: request.url });
    log.set({ requestId: request.headers["x-railway-request-id"], traceId });

    return yield* httpEffect.pipe(
      Effect.provideService(Evlog, log),
      Effect.onExit(
        Effect.fnUntraced(function* (exit) {
          const duration = (yield* Clock.currentTimeMillis) - startedAt;
          const status = Exit.isSuccess(exit) ? exit.value.status : 500;
          if (Exit.isFailure(exit)) log.error(new Error(Cause.pretty(exit.cause)));
          log.emit({ status, _durationMs: duration, _forceKeep: status >= 400 || duration >= 500 });
        }),
      ),
    );
  }),
).layer;
