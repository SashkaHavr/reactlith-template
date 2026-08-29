import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { Effect } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

import { AppApi } from "@reactlith-template/rpc";

async function createApi() {
  return Effect.runPromise(
    HttpApiClient.make(AppApi, { baseUrl: globalThis.location.origin }).pipe(
      Effect.provide(FetchHttpClient.layer),
    ),
  );
}

let api: ReturnType<typeof createApi> | undefined;

export const getApi = createIsomorphicFn()
  .server(async () => getGlobalStartContext()!.api)
  .client(async () => (api ??= createApi()));
