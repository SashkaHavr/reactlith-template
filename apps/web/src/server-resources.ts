import * as NodeSdk from "@effect/opentelemetry/NodeSdk";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { getGlobalStartContext } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Context, Effect, Exit, Layer, Logger, Option, Scope } from "effect";
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiClient } from "effect/unstable/httpapi";

import { Api } from "@reactlith-template/api";
import { ApiLive } from "@reactlith-template/api/layer";
import { BetterAuth } from "@reactlith-template/auth";
import { createAuthClient } from "@reactlith-template/auth/client";
import { Auth } from "@reactlith-template/auth/service";
import { AuthConfig } from "@reactlith-template/config/auth";
import { DBConfig } from "@reactlith-template/config/db";
import { ServerConfig } from "@reactlith-template/config/server";
import { TelemetryConfig } from "@reactlith-template/config/telemetry";
import { Database, DrizzlePostgres } from "@reactlith-template/db";
import { Evlog, StructuredLogger } from "@reactlith-template/services/structured-logger";

const scope = Scope.makeUnsafe();
const layerContext = await Effect.runPromise(
  Layer.empty.pipe(
    Layer.provideMerge(BetterAuth.layerWithoutDependencies),
    Layer.provideMerge(DrizzlePostgres.layerWithoutDependencies),
    Layer.provideMerge(DBConfig.layer),
    Layer.provideMerge(AuthConfig.layer),
    Layer.provideMerge(ServerConfig.layer),
    Layer.buildWithScope(scope),
  ),
);

export const resources = await Effect.runPromise(
  Effect.gen(function* () {
    const db = yield* DrizzlePostgres;
    const auth = yield* BetterAuth;
    const serverConfig = yield* ServerConfig;
    return { db, auth, serverConfig };
  }).pipe(Effect.provide(layerContext)),
);

export const authClient = createAuthClient({
  baseURL: resources.serverConfig.publicUrl.href,
  customFetchImpl: async (input, init) => resources.auth.handler(getSsrRequest(input, init)),
});

const TelemertySdkLive = Layer.unwrap(
  Effect.gen(function* () {
    const config = yield* TelemetryConfig;

    if (config.disabled || Option.isNone(config.endpoint)) {
      return NodeSdk.layerEmpty;
    }

    return NodeSdk.layer(() => ({
      resource: { serviceName: "reactlith-template-web" },
      spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
    }));
  }),
);

const { handler: _apiHandler, dispose: disposeApiHandler } = HttpRouter.toWebHandler(
  HttpApiBuilder.layer(Api).pipe(
    Layer.provide(ApiLive),
    Layer.provide(StructuredLogger.layer),
    Layer.provide(Logger.layer([Logger.tracerLogger])),
    Layer.provideMerge(TelemertySdkLive),
    Layer.provide(TelemetryConfig.layer),
    Layer.provide(Database.layerWithoutDependencies),
    Layer.provide(Auth.layer),
    Layer.provide(Layer.succeedContext(layerContext)),
    Layer.provide(HttpServer.layerServices),
  ),
  { disableLogger: true },
);

export async function apiHandler(request: Request) {
  const context = getGlobalStartContext()!;
  return await _apiHandler(request, context.log ? Context.make(Evlog, context.log) : undefined);
}

function getSsrRequest(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) {
  const request = new Request(
    input instanceof Request ? input : new URL(input, resources.serverConfig.publicUrl),
    init,
  );
  const headers = new Headers(getRequest().headers);
  request.headers.forEach((value, key) => headers.set(key, value));
  return new Request(request, { headers });
}

export const apiClient = Effect.runSync(
  HttpApiClient.make(Api, { baseUrl: resources.serverConfig.publicUrl }).pipe(
    Effect.provide(
      FetchHttpClient.layer.pipe(
        Layer.provide(
          Layer.succeed(FetchHttpClient.Fetch, async (input, init) =>
            apiHandler(getSsrRequest(input, init)),
          ),
        ),
      ),
    ),
  ),
);

export async function dispose() {
  await Effect.runPromise(Scope.close(scope, Exit.void));
  await disposeApiHandler();
}
