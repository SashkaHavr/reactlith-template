import { createIsomorphicFn } from "@tanstack/react-start";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";
import { serverFetch } from "nitro";

import { Api } from "@reactlith-template/api/index";

const getApiBaseUrl = createIsomorphicFn()
  .server(() => "http://nitro.localhost")
  .client(() => "");
const getFetch = createIsomorphicFn()
  .server(() => serverFetch)
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

export function queryKey<const Group extends ApiGroup, const Endpoint extends ApiEndpoint<Group>>(
  group: Group,
  endpoint: Endpoint,
  ...inputs: ApiInputArgs<Group, Endpoint>
) {
  return [Api.identifier, group, endpoint, ...inputs] as const;
}
