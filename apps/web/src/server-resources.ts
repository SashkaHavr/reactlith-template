import { getGlobalStartContext } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Context, Effect, Exit, Layer, Scope } from "effect";
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiClient } from "effect/unstable/httpapi";

import { Api } from "@reactlith-template/api";
import { ApiLive, ApiLogger } from "@reactlith-template/api/layer";
import { BetterAuthServerClient } from "@reactlith-template/auth";
import { createAuthClient } from "@reactlith-template/auth/client";
import { Auth, BetterAuthClient } from "@reactlith-template/auth/service";
import { AuthConfig } from "@reactlith-template/config/auth";
import { DBConfig } from "@reactlith-template/config/db";
import { Database, DrizzlePostgresClient, PgClientLive } from "@reactlith-template/db";

const scope = Scope.makeUnsafe();
const layerContext = await Effect.runPromise(
  Layer.empty.pipe(
    Layer.provideMerge(BetterAuthServerClient.layerWithoutDependencies),
    Layer.provideMerge(DrizzlePostgresClient.layerWithoutDependencies),
    Layer.provide(DBConfig.layer),
    Layer.provideMerge(AuthConfig.layer),
    Layer.buildWithScope(scope),
  ),
);

const acquireResources = Effect.gen(function* () {
  const db = yield* DrizzlePostgresClient;
  const auth = yield* BetterAuthServerClient;
  return { db, auth };
});

export const resources = await Effect.runPromise(
  acquireResources.pipe(Effect.provide(layerContext)),
);

export const authClient = createAuthClient({
  customFetchImpl: async (input, init) => resources.auth.handler(getSsrRequest(input, init)),
});

const { handler: _apiHandler, dispose: disposeApiHandler } = HttpRouter.toWebHandler(
  HttpApiBuilder.layer(Api).pipe(
    Layer.provide(ApiLive),
    Layer.provide(Database.layerWithoutDependencies),
    Layer.provide(PgClientLive),
    Layer.provide(Auth.layer),
    Layer.provide(Layer.succeed(BetterAuthClient, authClient)),
    Layer.provide(Layer.succeedContext(layerContext)),
    Layer.provide(HttpServer.layerServices),
  ),
  { disableLogger: true },
);

export async function apiHandler(request: Request) {
  const context = getGlobalStartContext()!;
  return await _apiHandler(request, Context.make(ApiLogger, context.log));
}

function getSsrRequest(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) {
  const request = new Request(
    input instanceof Request ? input : new URL(input, "http://localhost"),
    init,
  );
  const headers = new Headers(getRequest().headers);
  request.headers.forEach((value, key) => headers.set(key, value));
  return new Request(request, { headers });
}

export const apiClient = await Effect.runPromise(
  HttpApiClient.make(Api, { baseUrl: "http://localhost" }).pipe(
    Effect.provide(
      FetchHttpClient.layer.pipe(
        Layer.provide(
          Layer.succeed(FetchHttpClient.Fetch, (async (input, init) =>
            apiHandler(getSsrRequest(input, init))) as typeof fetch),
        ),
      ),
    ),
  ),
);

export async function dispose() {
  await Effect.runPromise(Scope.close(scope, Exit.void));
  await disposeApiHandler();
}
