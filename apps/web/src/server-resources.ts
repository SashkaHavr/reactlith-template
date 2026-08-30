import { getRequest } from "@tanstack/react-start/server";
import { Effect, Exit, Layer, Scope } from "effect";
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiClient } from "effect/unstable/httpapi";
import { serverFetch as nitroServerFetch } from "nitro";

import { Api } from "@reactlith-template/api";
import { ApiLive } from "@reactlith-template/api/layer";
import { BetterAuthServerClient } from "@reactlith-template/auth";
import { AuthConfig } from "@reactlith-template/config/auth-config";
import { DBConfig } from "@reactlith-template/config/db-config";
import { Database, DrizzlePostgresClient, PgClientLive } from "@reactlith-template/db";

import { createAuthClientFromFetch } from "./lib/auth";

const scope = Scope.makeUnsafe();

const layerContext = await Effect.runPromise(
  BetterAuthServerClient.layerWithoutDependencies.pipe(
    Layer.provideMerge(
      DrizzlePostgresClient.layerWithoutDependencies.pipe(Layer.provide(DBConfig.layer)),
    ),
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

const apiRoutes = HttpApiBuilder.layer(Api).pipe(
  Layer.provide(
    ApiLive.pipe(
      Layer.provide(Database.layerWithoutDependencies.pipe(Layer.provide(PgClientLive))),
    ),
  ),
  Layer.provide(Layer.succeedContext(layerContext)),
);
const apiHandlerLayer = HttpRouter.toWebHandler(
  apiRoutes.pipe(Layer.provide(HttpServer.layerServices)),
  { disableLogger: true },
);
export const apiHandler = apiHandlerLayer.handler;

async function serverFetch(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) {
  const request = new Request(
    input instanceof Request ? input : new URL(input, "http://localhost"),
    init,
  );
  const headers = new Headers(getRequest().headers);
  request.headers.forEach((value, key) => headers.set(key, value));
  return nitroServerFetch(new Request(request, { headers }));
}

export const authClient = createAuthClientFromFetch(serverFetch as typeof fetch);

export const apiClient = await Effect.runPromise(
  HttpApiClient.make(Api, { baseUrl: "http://localhost" }).pipe(
    Effect.provide(
      FetchHttpClient.layer.pipe(
        Layer.provide(Layer.succeed(FetchHttpClient.Fetch, serverFetch as typeof fetch)),
      ),
    ),
  ),
);

export async function dispose() {
  await Effect.runPromise(Scope.close(scope, Exit.void));
  await apiHandlerLayer.dispose();
}
