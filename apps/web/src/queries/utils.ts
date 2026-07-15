import { queryOptions } from "@tanstack/react-query";
import type { UnusedSkipTokenOptions } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";
import { serverFetch } from "nitro";

import { Api } from "@reactlith-template/api/index";

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

const apiLayer = Layer.merge(
  FetchHttpClient.layer,
  Layer.succeed(FetchHttpClient.Fetch, getFetch()),
);
export async function api<A, E>(
  call: (client: HttpApiClient.ForApi<typeof Api>) => Effect.Effect<A, E>,
) {
  return HttpApiClient.make(Api, { baseUrl: getApiBaseUrl() }).pipe(
    Effect.flatMap(call),
    Effect.provide(apiLayer),
    Effect.runPromise,
  );
}

export type ApiClient = HttpApiClient.ForApi<typeof Api>;
type ApiGroup = keyof ApiClient;
type ApiEndpoint<Group extends ApiGroup> = keyof ApiClient[Group];
type ApiInputs<
  Group extends ApiGroup,
  Endpoint extends ApiEndpoint<Group>,
> = ApiClient[Group][Endpoint] extends (request: infer Request) => unknown
  ? Omit<Exclude<Request, void>, "responseMode">
  : never;
type ApiInputArgs<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = keyof ApiInputs<
  Group,
  Endpoint
> extends never
  ? []
  : [inputs: ApiInputs<Group, Endpoint>];
type ApiEndpointEffect<
  Group extends ApiGroup,
  Endpoint extends ApiEndpoint<Group>,
> = ApiClient[Group][Endpoint] extends (...args: never[]) => infer Result ? Result : never;
type ApiQueryKey<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = readonly [
  typeof Api.identifier,
  Group,
  Endpoint,
  ...ApiInputArgs<Group, Endpoint>,
];
type ApiQueryOptions<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>, Data> = Omit<
  UnusedSkipTokenOptions<
    Effect.Success<ApiEndpointEffect<Group, Endpoint>>,
    Effect.Error<ApiEndpointEffect<Group, Endpoint>>,
    Data,
    ApiQueryKey<Group, Endpoint>
  >,
  "queryKey" | "queryFn"
>;
type ApiQueryKeyArgs<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = {
  group: Group;
  endpoint: Endpoint;
} & (ApiInputArgs<Group, Endpoint> extends []
  ? { inputs?: never }
  : { inputs: ApiInputs<Group, Endpoint> });

function queryKey<const Group extends ApiGroup, const Endpoint extends ApiEndpoint<Group>>(
  group: Group,
  endpoint: Endpoint,
  ...inputs: ApiInputArgs<Group, Endpoint>
) {
  return [Api.identifier, group, endpoint, ...inputs] as const;
}

export function apiQueryOptions<
  const Group extends ApiGroup,
  const Endpoint extends ApiEndpoint<Group>,
  Data = Effect.Success<ApiEndpointEffect<Group, Endpoint>>,
>(keyArgs: ApiQueryKeyArgs<Group, Endpoint>, options?: ApiQueryOptions<Group, Endpoint, Data>) {
  const { group, endpoint } = keyArgs;
  const inputs = ("inputs" in keyArgs ? [keyArgs.inputs] : []) as ApiInputArgs<Group, Endpoint>;
  const key = queryKey(group, endpoint, ...inputs);

  return queryOptions<
    Effect.Success<ApiEndpointEffect<Group, Endpoint>>,
    Effect.Error<ApiEndpointEffect<Group, Endpoint>>,
    Data,
    ApiQueryKey<Group, Endpoint>
  >({
    ...options,
    queryKey: key,
    queryFn: async () =>
      api((client) => {
        const method = client[group][endpoint] as unknown as (
          ...args: ApiInputArgs<Group, Endpoint>
        ) => Effect.Effect<
          Effect.Success<ApiEndpointEffect<Group, Endpoint>>,
          Effect.Error<ApiEndpointEffect<Group, Endpoint>>
        >;
        return method(...inputs);
      }),
  });
}

export function partialQueryKey(): readonly [typeof Api.identifier];
export function partialQueryKey<const Group extends ApiGroup>(
  group: Group,
): readonly [typeof Api.identifier, Group];
export function partialQueryKey<
  const Group extends ApiGroup,
  const Endpoint extends ApiEndpoint<Group>,
>(group: Group, endpoint: Endpoint): readonly [typeof Api.identifier, Group, Endpoint];
export function partialQueryKey<
  const Group extends ApiGroup,
  const Endpoint extends ApiEndpoint<Group>,
>(
  group: Group,
  endpoint: Endpoint,
  ...inputs: ApiInputArgs<Group, Endpoint>
): readonly [typeof Api.identifier, Group, Endpoint, ...ApiInputArgs<Group, Endpoint>];
export function partialQueryKey(...parts: readonly unknown[]) {
  return [Api.identifier, ...parts] as const;
}
