import {
  mutationOptions as createMutationOptions,
  queryOptions as createQueryOptions,
  skipToken,
} from "@tanstack/react-query";
import type {
  DataTag,
  QueryFunctionContext,
  SkipToken,
  UnusedSkipTokenOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";
import type * as HttpApi from "effect/unstable/httpapi/HttpApi";
import type * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";
import { serverFetch } from "nitro";

const getApiBaseUrl = createIsomorphicFn()
  .server(() => "http://nitro.localhost")
  .client(() => "");
const getFetch = createIsomorphicFn()
  .server(() => async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(getRequest().headers);
    if (input instanceof Request) {
      for (const [name, value] of input.headers) headers.set(name, value);
    }
    if (init?.headers) {
      for (const [name, value] of new Headers(init.headers)) headers.set(name, value);
    }
    return serverFetch(input, { ...init, headers });
  })
  .client(() => fetch);

const apiLayer = FetchHttpClient.layer.pipe(
  Layer.provide(Layer.succeed(FetchHttpClient.Fetch, getFetch())),
);

export function createApiQueryUtils<
  const Identifier extends string,
  Groups extends HttpApiGroup.Constraint,
>(apiDefinition: HttpApi.HttpApi<Identifier, Groups>) {
  type ApiClient = HttpApiClient.Client<Groups>;
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
  type ApiEndpointSuccess<
    Group extends ApiGroup,
    Endpoint extends ApiEndpoint<Group>,
  > = Effect.Success<ApiEndpointEffect<Group, Endpoint>>;
  type ApiEndpointError<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = Effect.Error<
    ApiEndpointEffect<Group, Endpoint>
  >;
  type ApiMutationVariables<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> =
    ApiInputArgs<Group, Endpoint> extends [] ? void : ApiInputs<Group, Endpoint>;
  type ApiQueryKey<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = readonly [
    Identifier,
    Group,
    Endpoint,
    ...ApiInputArgs<Group, Endpoint>,
  ];
  type ApiTaggedQueryKey<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = DataTag<
    ApiQueryKey<Group, Endpoint>,
    ApiEndpointSuccess<Group, Endpoint>,
    ApiEndpointError<Group, Endpoint>
  >;
  type ApiQueryOptions<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>, Data> = Omit<
    UnusedSkipTokenOptions<
      ApiEndpointSuccess<Group, Endpoint>,
      ApiEndpointError<Group, Endpoint>,
      Data,
      ApiQueryKey<Group, Endpoint>
    >,
    "queryFn" | "queryHash" | "queryHashFn" | "queryKey"
  >;
  type ApiMutationOptions<
    Group extends ApiGroup,
    Endpoint extends ApiEndpoint<Group>,
    Variables,
    OnMutateResult,
  > = Omit<
    UseMutationOptions<
      ApiEndpointSuccess<Group, Endpoint>,
      ApiEndpointError<Group, Endpoint>,
      Variables,
      OnMutateResult
    >,
    "mutationKey"
  >;
  type ApiDefaultMutationOptions<
    Group extends ApiGroup,
    Endpoint extends ApiEndpoint<Group>,
    OnMutateResult,
  > = Omit<
    ApiMutationOptions<Group, Endpoint, ApiMutationVariables<Group, Endpoint>, OnMutateResult>,
    "mutationFn"
  >;
  type ApiCustomMutationOptions<
    Group extends ApiGroup,
    Endpoint extends ApiEndpoint<Group>,
    Variables,
    OnMutateResult,
  > = ApiMutationOptions<Group, Endpoint, Variables, OnMutateResult> & {
    mutationFn: NonNullable<
      ApiMutationOptions<Group, Endpoint, Variables, OnMutateResult>["mutationFn"]
    >;
  };
  type ApiEndpointDefinition<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = Extract<
    HttpApiGroup.Endpoints<HttpApiGroup.WithIdentifier<Groups, Extract<Group, string>>>,
    { readonly identifier: Extract<Endpoint, string> }
  >;
  type ApiQueryEndpoint<Group extends ApiGroup> = {
    [Endpoint in ApiEndpoint<Group>]: ApiEndpointDefinition<Group, Endpoint> extends {
      readonly method: "GET";
    }
      ? Endpoint
      : never;
  }[ApiEndpoint<Group>];
  type ApiMutationEndpoint<Group extends ApiGroup> = Exclude<
    ApiEndpoint<Group>,
    ApiQueryEndpoint<Group>
  >;
  type ApiQueryKeyArgs<Group extends ApiGroup, Endpoint extends ApiQueryEndpoint<Group>> = {
    group: Group;
    endpoint: Endpoint;
  } & (ApiInputArgs<Group, Endpoint> extends []
    ? { inputs?: never }
    : { inputs: ApiInputs<Group, Endpoint> | SkipToken });

  const apiClient = Effect.runSync(
    HttpApiClient.make(apiDefinition, { baseUrl: getApiBaseUrl() }).pipe(
      Effect.provide(apiLayer),
    ) as Effect.Effect<ApiClient>,
  );

  function queryKey<const Group extends ApiGroup, const Endpoint extends ApiEndpoint<Group>>(
    group: Group,
    endpoint: Endpoint,
    ...inputs: ApiInputArgs<Group, Endpoint>
  ) {
    return [apiDefinition.identifier, group, endpoint, ...inputs] as unknown as ApiTaggedQueryKey<
      Group,
      Endpoint
    >;
  }

  async function executeEndpoint<
    const Group extends ApiGroup,
    const Endpoint extends ApiEndpoint<Group>,
  >(
    group: Group,
    endpoint: Endpoint,
    inputs: ApiInputArgs<Group, Endpoint>,
    options?: Effect.RunOptions,
  ) {
    const method = apiClient[group][endpoint] as unknown as (
      ...args: ApiInputArgs<Group, Endpoint>
    ) => Effect.Effect<ApiEndpointSuccess<Group, Endpoint>, ApiEndpointError<Group, Endpoint>>;
    return Effect.runPromise(method(...inputs), options);
  }

  function queryOptions<
    const Group extends ApiGroup,
    const Endpoint extends ApiQueryEndpoint<Group>,
    Data = ApiEndpointSuccess<Group, Endpoint>,
  >(keyArgs: ApiQueryKeyArgs<Group, Endpoint>, options?: ApiQueryOptions<Group, Endpoint, Data>) {
    const { group, endpoint } = keyArgs;
    const input = keyArgs.inputs;
    const isSkipped = input === skipToken;
    const inputs = (input === undefined || isSkipped ? [] : [input]) as ApiInputArgs<
      Group,
      Endpoint
    >;
    const key = (
      isSkipped ? partialQueryKey(group, endpoint) : queryKey(group, endpoint, ...inputs)
    ) as ApiTaggedQueryKey<Group, Endpoint>;

    return createQueryOptions<
      ApiEndpointSuccess<Group, Endpoint>,
      ApiEndpointError<Group, Endpoint>,
      Data,
      ApiQueryKey<Group, Endpoint>
    >({
      ...options,
      queryKey: key,
      queryFn: isSkipped
        ? skipToken
        : async ({ signal }: QueryFunctionContext<ApiQueryKey<Group, Endpoint>>) =>
            executeEndpoint(group, endpoint, inputs, { signal }),
    } as unknown as UnusedSkipTokenOptions<
      ApiEndpointSuccess<Group, Endpoint>,
      ApiEndpointError<Group, Endpoint>,
      Data,
      ApiQueryKey<Group, Endpoint>
    >);
  }

  function makeMutationOptions<
    const Group extends ApiGroup,
    const Endpoint extends ApiMutationEndpoint<Group>,
    Variables = ApiMutationVariables<Group, Endpoint>,
    OnMutateResult = unknown,
  >(
    { group, endpoint }: { group: Group; endpoint: Endpoint },
    options?: ApiMutationOptions<Group, Endpoint, Variables, OnMutateResult>,
  ) {
    return createMutationOptions({
      ...options,
      mutationKey: partialQueryKey(group, endpoint),
      mutationFn:
        options?.mutationFn ??
        (async (variables: Variables) => {
          const inputs = (
            variables === undefined ? [] : [variables as ApiMutationVariables<Group, Endpoint>]
          ) as ApiInputArgs<Group, Endpoint>;
          return executeEndpoint(group, endpoint, inputs);
        }),
    });
  }

  function mutationOptions<
    const Group extends ApiGroup,
    const Endpoint extends ApiMutationEndpoint<Group>,
    Variables,
    OnMutateResult = unknown,
  >(
    keyArgs: { group: Group; endpoint: Endpoint },
    options: ApiCustomMutationOptions<Group, Endpoint, Variables, OnMutateResult>,
  ): ReturnType<typeof makeMutationOptions<Group, Endpoint, Variables, OnMutateResult>>;
  function mutationOptions<
    const Group extends ApiGroup,
    const Endpoint extends ApiMutationEndpoint<Group>,
    OnMutateResult = unknown,
  >(
    keyArgs: { group: Group; endpoint: Endpoint },
    options?: ApiDefaultMutationOptions<Group, Endpoint, OnMutateResult>,
  ): ReturnType<
    typeof makeMutationOptions<
      Group,
      Endpoint,
      ApiMutationVariables<Group, Endpoint>,
      OnMutateResult
    >
  >;
  function mutationOptions<
    const Group extends ApiGroup,
    const Endpoint extends ApiMutationEndpoint<Group>,
    Variables = ApiMutationVariables<Group, Endpoint>,
    OnMutateResult = unknown,
  >(
    keyArgs: { group: Group; endpoint: Endpoint },
    options?: ApiMutationOptions<Group, Endpoint, Variables, OnMutateResult>,
  ) {
    return makeMutationOptions(keyArgs, options);
  }

  function partialQueryKey(): readonly [Identifier];
  function partialQueryKey<const Group extends ApiGroup>(
    group: Group,
  ): readonly [Identifier, Group];
  function partialQueryKey<const Group extends ApiGroup, const Endpoint extends ApiEndpoint<Group>>(
    group: Group,
    endpoint: Endpoint,
  ): readonly [Identifier, Group, Endpoint];
  function partialQueryKey<const Group extends ApiGroup, const Endpoint extends ApiEndpoint<Group>>(
    group: Group,
    endpoint: Endpoint,
    ...inputs: ApiInputArgs<Group, Endpoint>
  ): ApiQueryKey<Group, Endpoint>;
  function partialQueryKey(...parts: readonly unknown[]) {
    return [apiDefinition.identifier, ...parts] as const;
  }

  return { apiClient, mutationOptions, partialQueryKey, queryKey, queryOptions };
}
