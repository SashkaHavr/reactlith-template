import { getRequest } from "@tanstack/react-start/server";
import { Config, Effect, Layer, ManagedRuntime } from "effect";
import { FetchHttpClient, HttpClient, HttpRouter } from "effect/http";
import { HttpApiClient } from "effect/http-api";
import { serverFetch } from "nitro/app";

import { Api } from "@reactlith-template/api-contract";
import { App } from "@reactlith-template/api/src/app.ts";
import { createAuthClient } from "@reactlith-template/auth/client";
import { ApiClient } from "~/lib/api";

export const api = HttpRouter.toWebHandler(App, { disableLogger: true });

const serverConfig = Effect.runSync(
  Config.all({
    publicUrl: Config.URL("PUBLIC_URL"),
  }),
);

const ssrFetch: typeof fetch = async (input, init) => {
  const request = new Request(
    input instanceof Request ? input : new URL(input, serverConfig.publicUrl),
    init,
  );
  const headers = new Headers(getRequest().headers);
  for (const [key, value] of request.headers.entries()) {
    headers.set(key, value);
  }
  return serverFetch(new Request(request, { headers }));
};

export const authClient = createAuthClient({
  baseURL: serverConfig.publicUrl.href,
  customFetchImpl: ssrFetch,
});

export const runtime = ManagedRuntime.make(
  Layer.effect(ApiClient, HttpApiClient.make(Api, { baseUrl: serverConfig.publicUrl })).pipe(
    Layer.provideMerge(
      FetchHttpClient.layer.pipe(
        Layer.provide(Layer.succeed(FetchHttpClient.Fetch, ssrFetch)),
        Layer.provide(Layer.succeed(HttpClient.TracerPropagationEnabled, false)),
      ),
    ),
  ),
);
