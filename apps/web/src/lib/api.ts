import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { Context, Layer, ManagedRuntime } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";
import { HttpApiClient } from "effect/http-api";
import { Atom } from "effect/reactivity";

import { Api } from "@reactlith-template/api-contract";

export class ApiClient extends Context.Service<ApiClient>()("web/ApiClient", {
  make: HttpApiClient.make(Api),
}) {
  static readonly layer = Layer.effect(this, this.make);
}

function createClientRuntime() {
  return ManagedRuntime.make(
    ApiClient.layer.pipe(
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
