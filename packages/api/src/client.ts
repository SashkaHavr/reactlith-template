import type { HttpApiClient, HttpApiEndpoint } from "effect/unstable/httpapi";
import { HttpApi } from "effect/unstable/httpapi";

import { ConfigApi } from "#features/config/schema";
import { GlobalMiddleware } from "#middleware/global/schema";

export class Api extends HttpApi.make("api")
  .add(ConfigApi)
  .middleware(GlobalMiddleware)
  .prefix("/api") {}

export type ApiClient = HttpApiClient.ForApi<typeof Api>;

type ApiGroup = keyof typeof Api.groups;
type ApiEndpoint<Group extends ApiGroup> = keyof (typeof Api.groups)[Group]["endpoints"];
type ApiEndpointByIdentifier<
  Group extends ApiGroup,
  Endpoint extends ApiEndpoint<Group>,
> = (typeof Api.groups)[Group]["endpoints"][Endpoint];

export type ApiInput = {
  [Group in ApiGroup]: {
    [Endpoint in ApiEndpoint<Group>]: HttpApiEndpoint.Request<
      ApiEndpointByIdentifier<Group, Endpoint>
    >;
  };
};

export type ApiOutput = {
  [Group in ApiGroup]: {
    [Endpoint in ApiEndpoint<Group>]: HttpApiEndpoint.SuccessWithIdentifier<
      Extract<ApiEndpointByIdentifier<Group, Endpoint>, HttpApiEndpoint.Constraint>,
      Extract<Endpoint, string>
    >;
  };
};

export type ApiErrors = {
  [Group in ApiGroup]: {
    [Endpoint in ApiEndpoint<Group>]: HttpApiEndpoint.Errors<
      ApiEndpointByIdentifier<Group, Endpoint>
    >;
  };
};
