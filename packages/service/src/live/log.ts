import { Effect, Layer } from "effect";
import { HttpRouter, HttpServerRequest } from "effect/unstable/http";
import { initLogger } from "evlog";
import { defineFrameworkIntegration } from "evlog/toolkit";
import type { EvlogConfig } from "evlog/toolkit";

import { ConfigNode } from "#config.ts";
import { Log } from "#log.ts";
import type { LogType } from "@reactlith-template/utils/log";

const integration = defineFrameworkIntegration<HttpServerRequest.HttpServerRequest>({
  name: "evlog-effect-http",
  extractRequest: (req) => ({
    method: req.method,
    path: req.url,
    headers: req.headers,
  }),
  attachLogger: () => {},
});

export function LogMiddlewareLive(config: EvlogConfig) {
  return HttpRouter.middleware<{ provides: Log }>()(
    Effect.gen(function* () {
      const configNode = yield* ConfigNode;
      initLogger({
        ...config,
        env: {
          service: "reactlith-template-web-backend",
          environment: configNode.NODE_ENV,
          ...config.env,
        },
        sampling: {
          rates: {
            info: configNode.NODE_ENV === "development" ? 0 : 5,
            warn: 0,
            debug: 0,
            error: 100,
          },
          keep: [{ status: 400 }, { duration: 500 }],
          ...config.sampling,
        },
      });

      return (httpEffect) =>
        Effect.gen(function* () {
          const request = yield* HttpServerRequest.HttpServerRequest;
          const { skipped, finish, logger } = integration.start(request);
          const evlogService = Layer.sync(Log, () => logger as LogType);
          const appWithLogger = httpEffect.pipe(Effect.provide(evlogService));
          if (skipped) {
            return yield* appWithLogger;
          }
          const response = yield* appWithLogger.pipe(
            Effect.tapDefect((error) =>
              Effect.promise(async () => await finish({ error: error as Error, status: 500 })),
            ),
          );
          yield* Effect.promise(async () => await finish({ status: response.status }));
          return response;
        });
    }),
    { global: true },
  );
}
