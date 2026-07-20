import { mutationOptions, queryOptions } from "@tanstack/react-query";
import type { UnusedSkipTokenOptions, UseMutationOptions } from "@tanstack/react-query";
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
  type ApiQueryOptions<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>, Data> = Omit<
    UnusedSkipTokenOptions<
      ApiEndpointSuccess<Group, Endpoint>,
      ApiEndpointError<Group, Endpoint>,
      Data,
      ApiQueryKey<Group, Endpoint>
    >,
    "queryKey" | "queryFn"
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
  type ApiQueryKeyArgs<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = {
    group: Group;
    endpoint: Endpoint;
  } & (ApiInputArgs<Group, Endpoint> extends []
    ? { inputs?: never }
    : { inputs: ApiInputs<Group, Endpoint> });

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
    return [apiDefinition.identifier, group, endpoint, ...inputs] as ApiQueryKey<Group, Endpoint>;
  }

  function apiQueryOptions<
    const Group extends ApiGroup,
    const Endpoint extends ApiEndpoint<Group>,
    Data = ApiEndpointSuccess<Group, Endpoint>,
  >(keyArgs: ApiQueryKeyArgs<Group, Endpoint>, options?: ApiQueryOptions<Group, Endpoint, Data>) {
    const { group, endpoint } = keyArgs;
    const inputs = ("inputs" in keyArgs ? [keyArgs.inputs] : []) as ApiInputArgs<Group, Endpoint>;
    const key = queryKey(group, endpoint, ...inputs);

    return queryOptions<
      ApiEndpointSuccess<Group, Endpoint>,
      ApiEndpointError<Group, Endpoint>,
      Data,
      ApiQueryKey<Group, Endpoint>
    >({
      ...options,
      queryKey: key,
      queryFn: async () => {
        const method = apiClient[group][endpoint] as unknown as (
          ...args: ApiInputArgs<Group, Endpoint>
        ) => Effect.Effect<ApiEndpointSuccess<Group, Endpoint>, ApiEndpointError<Group, Endpoint>>;
        return method(...inputs).pipe(Effect.runPromise);
      },
    });
  }

  function apiMutationOptions<
    const Group extends ApiGroup,
    const Endpoint extends ApiEndpoint<Group>,
    Variables = ApiMutationVariables<Group, Endpoint>,
    OnMutateResult = unknown,
  >(
    { group, endpoint }: { group: Group; endpoint: Endpoint },
    options?: ApiMutationOptions<Group, Endpoint, Variables, OnMutateResult>,
  ) {
    return mutationOptions({
      ...options,
      mutationKey: partialQueryKey(group, endpoint),
      mutationFn:
        options?.mutationFn ??
        (async (inputs: Variables) => {
          const method = apiClient[group][endpoint] as unknown as (
            inputs: ApiMutationVariables<Group, Endpoint>,
          ) => Effect.Effect<
            ApiEndpointSuccess<Group, Endpoint>,
            ApiEndpointError<Group, Endpoint>
          >;
          return method(inputs as ApiMutationVariables<Group, Endpoint>).pipe(Effect.runPromise);
        }),
    });
  }

  type ApiQueryOptionsArgs<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>, Data> =
    ApiInputArgs<Group, Endpoint> extends []
      ? [inputs?: undefined, options?: ApiQueryOptions<Group, Endpoint, Data>]
      : [inputs: ApiInputs<Group, Endpoint>, options?: ApiQueryOptions<Group, Endpoint, Data>];
  type ApiQueryProcedure<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = {
    readonly queryOptions: <Data = ApiEndpointSuccess<Group, Endpoint>>(
      ...args: ApiQueryOptionsArgs<Group, Endpoint, Data>
    ) => ReturnType<typeof apiQueryOptions<Group, Endpoint, Data>>;
  };
  type ApiMutationProcedure<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = {
    readonly mutationOptions: {
      <Variables, OnMutateResult = unknown>(
        options: ApiCustomMutationOptions<Group, Endpoint, Variables, OnMutateResult>,
      ): ReturnType<typeof apiMutationOptions<Group, Endpoint, Variables, OnMutateResult>>;
      <OnMutateResult = unknown>(
        options?: ApiDefaultMutationOptions<Group, Endpoint, OnMutateResult>,
      ): ReturnType<
        typeof apiMutationOptions<
          Group,
          Endpoint,
          ApiMutationVariables<Group, Endpoint>,
          OnMutateResult
        >
      >;
    };
  };
  type ApiEndpointDefinition<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> = Extract<
    HttpApiGroup.Endpoints<HttpApiGroup.WithIdentifier<Groups, Extract<Group, string>>>,
    { readonly identifier: Extract<Endpoint, string> }
  >;
  type ApiProcedure<Group extends ApiGroup, Endpoint extends ApiEndpoint<Group>> =
    ApiEndpointDefinition<Group, Endpoint> extends { readonly method: "GET" }
      ? ApiQueryProcedure<Group, Endpoint>
      : ApiMutationProcedure<Group, Endpoint>;
  type ApiRouter = {
    readonly [Group in ApiGroup]: {
      readonly [Endpoint in ApiEndpoint<Group>]: ApiProcedure<Group, Endpoint>;
    };
  };

  const api = Object.fromEntries(
    Object.entries(apiDefinition.groups as unknown as Record<string, HttpApiGroup.Top>).map(
      ([group, groupDefinition]) => [
        group,
        Object.fromEntries(
          Object.keys(groupDefinition.endpoints).map((endpoint) => [
            endpoint,
            {
              queryOptions: (inputs?: unknown, options?: unknown) =>
                apiQueryOptions(
                  (inputs === undefined
                    ? { group, endpoint }
                    : { group, endpoint, inputs }) as never,
                  options as never,
                ),
              mutationOptions: (options?: unknown) =>
                apiMutationOptions({ group, endpoint } as never, options as never),
            },
          ]),
        ),
      ],
    ),
  ) as unknown as ApiRouter;

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

  return { api, apiClient, partialQueryKey, queryKey };
}
