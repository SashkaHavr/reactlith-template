import { getRequest } from "@tanstack/react-start/server";
import { Context, Effect, Exit, Layer, Scope } from "effect";
import { FetchHttpClient, HttpEffect } from "effect/unstable/http";
import { RpcClient, RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { fetch as nitroFetch } from "nitro";

import { BetterAuthServerClient } from "@reactlith-template/auth";
import { AuthConfig } from "@reactlith-template/config/auth-config";
import { DBConfig } from "@reactlith-template/config/db-config";
import { Database, DrizzlePostgresClient, PgClientLive } from "@reactlith-template/db";
import { AppRpcs } from "@reactlith-template/rpc";
import { AppRpcsLive } from "@reactlith-template/rpc/layer";

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

class RpcHttpEffect extends Context.Service<RpcHttpEffect>()("web/RpcHttpEffect", {
  make: RpcServer.toHttpEffect(AppRpcs).pipe(
    Effect.provide(
      AppRpcsLive.pipe(
        Layer.provide(Database.layerWithoutDependencies.pipe(Layer.provide(PgClientLive))),
      ),
    ),
    Effect.provide(layerContext),
    Effect.provide(RpcSerialization.layerJson),
  ),
}) {
  static readonly layer = Layer.effect(this, this.make);
}

const rpcHandlerLayer = HttpEffect.toWebHandlerLayerWith(RpcHttpEffect.layer, {
  toHandler: (context) => Effect.succeed(Context.get(context, RpcHttpEffect)),
});
export const rpcHandler = rpcHandlerLayer.handler;

const serverFetch: typeof nitroFetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input);
  const headers = new Headers(getRequest().headers);
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  return nitroFetch(`${url.pathname}${url.search}`, { ...init, headers });
};

export const rpc = await Effect.runPromise(
  RpcClient.make(AppRpcs).pipe(
    Effect.provide(
      RpcClient.layerProtocolHttp({ url: "http://localhost/api/rpc" }).pipe(
        Layer.provide(RpcSerialization.layerJson),
        Layer.provide(
          FetchHttpClient.layer.pipe(
            Layer.provide(
              Layer.succeed(
                FetchHttpClient.Fetch,
                serverFetch as unknown as typeof globalThis.fetch,
              ),
            ),
          ),
        ),
      ),
    ),
    Effect.provideService(Scope.Scope, scope),
  ),
);

export async function dispose() {
  await Effect.runPromise(Scope.close(scope, Exit.void));
  await rpcHandlerLayer.dispose();
}
