import { getRequest } from "@tanstack/react-start/server";
import { Effect, Exit, Layer, Scope } from "effect";
import { FetchHttpClient, HttpRouter, HttpServer } from "effect/unstable/http";
import { HttpApiBuilder, HttpApiClient } from "effect/unstable/httpapi";
import { fetch as nitroFetch } from "nitro";

import { Api } from "@reactlith-template/api";
import { ApiLive } from "@reactlith-template/api/layer";
import { BetterAuthServerClient } from "@reactlith-template/auth";
import { AuthConfig } from "@reactlith-template/config/auth-config";
import { DBConfig } from "@reactlith-template/config/db-config";
import { Database, DrizzlePostgresClient, PgClientLive } from "@reactlith-template/db";

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

const serverFetch: typeof nitroFetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input);
  const headers = new Headers(getRequest().headers);
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  return nitroFetch(`${url.pathname}${url.search}`, { ...init, headers });
};

export const api = await Effect.runPromise(
  HttpApiClient.make(Api, { baseUrl: "http://localhost" }).pipe(
    Effect.provide(
      FetchHttpClient.layer.pipe(
        Layer.provide(
          Layer.succeed(FetchHttpClient.Fetch, serverFetch as unknown as typeof globalThis.fetch),
        ),
      ),
    ),
  ),
);

export async function dispose() {
  await Effect.runPromise(Scope.close(scope, Exit.void));
  await apiHandlerLayer.dispose();
}
