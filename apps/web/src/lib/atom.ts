import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Effect } from "effect";
import { Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import type * as AsyncResult from "effect/unstable/reactivity/AsyncResult";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as AtomHttpApi from "effect/unstable/reactivity/AtomHttpApi";
import * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";
import { serverFetch } from "nitro";

import { Api } from "@reactlith-template/api/index";

export function createAtomRegistry() {
  return AtomRegistry.make();
}

export async function preloadAtom<A, E>(
  registry: AtomRegistry.AtomRegistry,
  atom: Atom.Atom<AsyncResult.AsyncResult<A, E>>,
) {
  return AtomRegistry.getResult(registry, atom, { suspendOnWaiting: true }).pipe(Effect.runPromise);
}

const getApiBaseUrl = createIsomorphicFn()
  .server(() => "http://nitro.localhost")
  .client(() => "");
const getFetch = createIsomorphicFn()
  .server(() => async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(getRequest().headers);
    if (input instanceof Request) {
      for (const [name, value] of input.headers) {
        headers.set(name, value);
      }
    }
    if (init?.headers) {
      for (const [name, value] of new Headers(init.headers)) {
        headers.set(name, value);
      }
    }
    return serverFetch(input, { ...init, headers });
  })
  .client(() => fetch);

export interface ApiClient {}
export const ApiClient = AtomHttpApi.Service<ApiClient>()("ApiClient", {
  api: Api,
  baseUrl: getApiBaseUrl(),
  httpClient: () =>
    FetchHttpClient.layer.pipe(Layer.provide(Layer.succeed(FetchHttpClient.Fetch, getFetch()))),
});

export const withQuerySWR = Atom.swr({ staleTime: 30_000, revalidateOnMount: true });

type ReactivityKey = "numbers";

export function reactivityKeys(key: readonly ReactivityKey[]) {
  return key;
}

export function atomParams({
  reactivityKeys,
  serializationKey,
}: {
  reactivityKeys?: readonly ReactivityKey[];
  serializationKey?: string;
}) {
  return {
    reactivityKeys,
    serializationKey,
    timeToLive: "5 minutes" as const,
  };
}
