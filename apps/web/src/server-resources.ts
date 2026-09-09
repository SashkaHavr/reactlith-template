import { getGlobalStartContext } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Context, Effect, Exit, Layer, Logger, Scope } from "effect";
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiClient } from "effect/unstable/httpapi";

import { Api } from "@reactlith-template/api";
import { ApiLive } from "@reactlith-template/api/layer";
import { BetterAuthServerClient } from "@reactlith-template/auth";
import { createAuthClient } from "@reactlith-template/auth/client";
import { Auth } from "@reactlith-template/auth/service";
import { AuthConfig } from "@reactlith-template/config/auth";
import { DBConfig } from "@reactlith-template/config/db";
import { ServerConfig } from "@reactlith-template/config/server";
import { Database, DrizzlePostgresClient, PgClientLive } from "@reactlith-template/db";
import { Evlog, StructuredLogger } from "@reactlith-template/services/structured-logger";

const scope = Scope.makeUnsafe();
const layerContext = await Effect.runPromise(
  Layer.empty.pipe(
    Layer.provideMerge(BetterAuthServerClient.layerWithoutDependencies),
    Layer.provideMerge(DrizzlePostgresClient.layerWithoutDependencies),
    Layer.provide(DBConfig.layer),
    Layer.provideMerge(AuthConfig.layer),
    Layer.provideMerge(ServerConfig.layer),
    Layer.buildWithScope(scope),
  ),
);

export const resources = await Effect.runPromise(
  Effect.gen(function* () {
    const db = yield* DrizzlePostgresClient;
    const auth = yield* BetterAuthServerClient;
    const serverConfig = yield* ServerConfig;
    return { db, auth, serverConfig };
  }).pipe(Effect.provide(layerContext)),
);

export const authClient = createAuthClient({
  baseURL: resources.serverConfig.publicUrl.href,
  customFetchImpl: async (input, init) => resources.auth.handler(getSsrRequest(input, init)),
});

const { handler: _apiHandler, dispose: disposeApiHandler } = HttpRouter.toWebHandler(
  HttpApiBuilder.layer(Api).pipe(
    Layer.provide(ApiLive),
    Layer.provide(StructuredLogger.layer),
    Layer.provide(Logger.layer([Logger.tracerLogger])),
    Layer.provide(Database.layerWithoutDependencies),
    Layer.provide(PgClientLive),
    Layer.provide(Auth.layer(authClient)),
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
