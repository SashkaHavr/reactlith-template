import { createIsomorphicFn, getGlobalStartContext } from "@tanstack/react-start";
import { Effect, Layer } from "effect";
import { FetchHttpClient, HttpClient } from "effect/http";
import { HttpApiClient } from "effect/http-api";

import { Api } from "@reactlith-template/api";

function createApi() {
  return Effect.runSync(
    HttpApiClient.make(Api).pipe(
      Effect.provide(
        FetchHttpClient.layer.pipe(
          Layer.provide(Layer.succeed(HttpClient.TracerPropagationEnabled, false)),
        ),
      ),
    ),
  );
}

let apiClient: ReturnType<typeof createApi> | undefined;

export const getApiClient = createIsomorphicFn()
  .server(() => getGlobalStartContext()!.apiClient)
  .client(() => (apiClient ??= createApi()));
