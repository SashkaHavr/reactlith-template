import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { Context, Layer, ManagedRuntime } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";
import { Atom } from "effect/reactivity";
import { RpcClient as EffectRpcClient, RpcSerialization } from "effect/rpc";

import { Api } from "@reactlith-template/api-contract";

export class RpcClient extends Context.Service<RpcClient>()("web/RpcClient", {
  make: EffectRpcClient.make(Api),
}) {
  static readonly layer = Layer.effect(this, this.make);
}

function createClientRuntime() {
  return ManagedRuntime.make(
    RpcClient.layer.pipe(
      Layer.provideMerge(EffectRpcClient.layerProtocolHttp({ url: "/api/rpc" })),
      Layer.provideMerge(RpcSerialization.layerNdjson),
      Layer.provideMerge(
        FetchHttpClient.layer.pipe(
          Layer.provide(Layer.succeed(HttpClient.TracerPropagationEnabled, false)),
        ),
      ),
    ),
  );
}

let clientRuntime: ReturnType<typeof createClientRuntime> | undefined;

export const getRuntime = createIsomorphicFn()
  .server(() => getGlobalStartContext()!.runtime)
  .client(() => (clientRuntime ??= createClientRuntime()));

export const apiRuntime = Atom.runtime(() => Layer.effectContext(getRuntime().contextEffect));
