import { createServer } from "node:http";

import * as NodeSdk from "@effect/opentelemetry/NodeSdk";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Effect, Layer, Logger } from "effect";
import { HttpRouter } from "effect/http";
import { initLogger } from "evlog";

import { ApiConfig } from "#config";
import { RequestLogging } from "#request-logging";
import { ApiRoutes } from "#routes";
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

Layer.launch(
  HttpRouter.serve(
    ApiRoutes.pipe(
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
