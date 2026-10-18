import { createServer } from "node:http";

import * as NodeSdk from "@effect/opentelemetry/NodeSdk";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Effect, Layer, Logger } from "effect";
import { HttpEffect, HttpRouter } from "effect/http";
import { HttpApiBuilder } from "effect/http-api";
import { initLogger } from "evlog";

import { ApiConfig } from "#config";
import { ConfigApiLiveWithServices } from "#features/config/layer";
import { NumbersApiLiveWithServices } from "#features/numbers/layer";
import { AuthenticationMiddlewareLive } from "#middleware/authentication/layer";
import { GlobalMiddlewareLive } from "#middleware/global/layer";
import { AuthorizationMiddlewareLive } from "#middleware/permission/layer";
import { RequestLogging } from "#request-logging";
import { Api } from "@reactlith-template/api-contract";
import { BetterAuth } from "@reactlith-template/auth";
import { Auth } from "@reactlith-template/auth/service";
import { AuthConfig } from "@reactlith-template/config/auth";
import { Database } from "@reactlith-template/db";
import { StructuredLogger } from "@reactlith-template/services/structured-logger";

initLogger({
  sampling: { rates: { info: 0, warn: 0, debug: 0, error: 100 } },
  redact: false,
});

const config = Effect.runSync(ApiConfig.make);

export const AuthRoutes = HttpRouter.use(
  Effect.fnUntraced(function* (router) {
    const auth = yield* BetterAuth;
    return yield* router.add("*", "/api/auth/*", HttpEffect.fromWebHandler(auth.handler));
  }),
);

export const ApiLive = Layer.mergeAll(ConfigApiLiveWithServices, NumbersApiLiveWithServices).pipe(
  Layer.provideMerge(AuthorizationMiddlewareLive),
  Layer.provideMerge(AuthenticationMiddlewareLive),
  Layer.provideMerge(GlobalMiddlewareLive),
);

Layer.launch(
  HttpRouter.serve(
    Layer.mergeAll(HttpApiBuilder.layer(Api).pipe(Layer.provide(ApiLive)), AuthRoutes).pipe(
      Layer.provide(
        NodeSdk.layer(() => ({
          resource: { serviceName: config.otelServiceName.valueOrUndefined ?? "api" },
          spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
        })),
      ),
      Layer.provide(RequestLogging),
      Layer.provide(Auth.layer),
      Layer.provide(Database.layer),
      Layer.provide(BetterAuth.layer),
      Layer.provide(AuthConfig.layer),
      Layer.provide(StructuredLogger.layer),
    ),
    { disableLogger: true },
  ).pipe(
    Layer.provide(NodeHttpServer.layer(createServer, { host: "0.0.0.0", port: config.port })),
    Layer.provide(Logger.layer([Logger.tracerLogger])),
  ),
).pipe(NodeRuntime.runMain);
