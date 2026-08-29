import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { Effect, Layer, Scope } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";

import { AppRpcs } from "@reactlith-template/rpc";

const scope = Scope.makeUnsafe();
async function createRPC() {
  const protocolLayer = RpcClient.layerProtocolHttp({ url: "/api/rpc" }).pipe(
    Layer.provide(RpcSerialization.layerJson),
    Layer.provide(FetchHttpClient.layer),
  );

  return Effect.runPromise(
    RpcClient.make(AppRpcs).pipe(
      Effect.provide(protocolLayer),
      Effect.provideService(Scope.Scope, scope),
    ),
  );
}

let _rpc: ReturnType<typeof createRPC> | undefined;

export const getRPC = createIsomorphicFn()
  .server(async () => getGlobalStartContext()!.rpc)
  .client(async () => (_rpc ??= createRPC()));
