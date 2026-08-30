import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { Effect } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

import { Api } from "@reactlith-template/api";

function createApi() {
  return Effect.runSync(HttpApiClient.make(Api).pipe(Effect.provide(FetchHttpClient.layer)));
}

let apiClient: ReturnType<typeof createApi> | undefined;

export const getApiClient = createIsomorphicFn()
  .server(() => getGlobalStartContext()!.apiClient)
  .client(() => (apiClient ??= createApi()));
