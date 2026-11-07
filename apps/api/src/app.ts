import * as NodeSdk from "@effect/opentelemetry/NodeSdk";
import { NodeHttpServer } from "@effect/platform-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { sql } from "drizzle-orm";
import { Effect, Exit, Layer, Logger, Schema } from "effect";
import { HttpEffect, HttpRouter, HttpServerResponse } from "effect/http";
import { HttpApiBuilder } from "effect/http-api";
import { defineEvlog, definePlugin, toLoggerConfig, toMiddlewareOptions } from "evlog";
import { initLoggerLayer, loggerLayer, routerLayer } from "evlog/effect";

import { ApiConfig } from "#/config";
import { ConfigApiLive } from "#/features/config/layer";
import { NumbersApiLiveWithServices } from "#/features/numbers/layer";
import { AuthenticationMiddlewareLive } from "#/middleware/authentication/layer";
import { GlobalMiddlewareLive } from "#/middleware/global/layer";
import { AuthorizationMiddlewareLive } from "#/middleware/permission/layer";
import { Api } from "@reactlith-template/api-contract";
import { BetterAuth } from "@reactlith-template/auth";
import { Auth } from "@reactlith-template/auth/service";
import { AuthConfig } from "@reactlith-template/config/auth";
import { Database } from "@reactlith-template/db";
import { StructuredLogger } from "@reactlith-template/services/structured-logger";

const config = Effect.runSync(ApiConfig.make);
const evlogConfig = defineEvlog({
  service: "api",
  sampling: {
    rates: { info: 0, warn: 0, debug: 0, error: 100 },
    keep: [{ status: 400 }, { duration: 500 }],
  },
  redact: false,
  plugins: [
    definePlugin({
      name: "railway-request-id",
      onRequestStart({ logger, headers }) {
        const requestId = headers?.["x-railway-request-id"];
        if (requestId) logger.set({ requestId });
      },
    }),
  ],
});

const AuthRoutes = HttpRouter.use(
  Effect.fnUntraced(function* (router) {
    const auth = yield* BetterAuth;
    return yield* router.add("*", "/api/auth/*", HttpEffect.fromWebHandler(auth.handler));
  }),
);

export class NotReady extends Schema.TaggedError<NotReady>()("NotReady", {}) {}

const HealthRoutes = HttpRouter.use(
  Effect.fnUntraced(function* (router) {
    const db = yield* Database;
    yield* router.add("GET", "/api/health/live", HttpServerResponse.json(null, { status: 204 }));
    yield* router.add(
      "GET",
      "/api/health/ready",
      Effect.gen(function* () {
        return Exit.isSuccess(yield* db.execute(sql`select 1`).pipe(Effect.exit))
          ? yield* HttpServerResponse.json(null, { status: 204 })
          : yield* HttpServerResponse.schemaJson(NotReady)(NotReady.make(), { status: 400 });
      }),
    );
  }),
);

const ApiLive = Layer.mergeAll(ConfigApiLive, NumbersApiLiveWithServices).pipe(
  Layer.provideMerge(AuthorizationMiddlewareLive),
  Layer.provideMerge(AuthenticationMiddlewareLive),
  Layer.provideMerge(GlobalMiddlewareLive),
);

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: config.otelServiceName.valueOrUndefined ?? "api" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

export const App = Layer.mergeAll(HttpApiBuilder.layer(Api), HealthRoutes, AuthRoutes).pipe(
  Layer.provide(ApiLive),
  Layer.provideMerge(NodeSdkLive),
  Layer.provide(routerLayer(toMiddlewareOptions(evlogConfig))),
  Layer.provide(Auth.layer),
  Layer.provide(Database.layer),
  Layer.provide(BetterAuth.layer),
  Layer.provide(AuthConfig.layer),
  Layer.provide(StructuredLogger.layer),
  Layer.provide(NodeHttpServer.layerHttpServices),
  Layer.provide(initLoggerLayer(toLoggerConfig(evlogConfig))),
  Layer.provide(loggerLayer()),
  Layer.provide(Logger.layer([Logger.tracerLogger])),
);
