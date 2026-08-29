import type { HttpApiClient, HttpApiEndpoint } from "effect/unstable/httpapi";
import { HttpApi } from "effect/unstable/httpapi";

import { ConfigApi } from "#features/config/schema";
import { NumbersApi } from "#features/numbers/schema";
import { GlobalMiddleware } from "#middleware/global/schema";

export class AppApi extends HttpApi.make("app")
  .add(ConfigApi)
  .add(NumbersApi)
  .middleware(GlobalMiddleware)
  .prefix("/api/rpc") {}

export type AppApiClient = HttpApiClient.ForApi<typeof AppApi>;

type AppApiGroup = keyof typeof AppApi.groups;
type AppApiEndpoint<Group extends AppApiGroup> = keyof (typeof AppApi.groups)[Group]["endpoints"];
type AppApiEndpointByIdentifier<
  Group extends AppApiGroup,
  Endpoint extends AppApiEndpoint<Group>,
> = (typeof AppApi.groups)[Group]["endpoints"][Endpoint];

export type AppApiInput = {
  [Group in AppApiGroup]: {
    [Endpoint in AppApiEndpoint<Group>]: HttpApiEndpoint.Request<
      AppApiEndpointByIdentifier<Group, Endpoint>
    >;
  };
};

export type AppApiOutput = {
  [Group in AppApiGroup]: {
    [Endpoint in AppApiEndpoint<Group>]: HttpApiEndpoint.SuccessWithIdentifier<
      Extract<AppApiEndpointByIdentifier<Group, Endpoint>, HttpApiEndpoint.Constraint>,
      Extract<Endpoint, string>
    >;
  };
};

export type AppApiErrors = {
  [Group in AppApiGroup]: {
    [Endpoint in AppApiEndpoint<Group>]: HttpApiEndpoint.Errors<
      AppApiEndpointByIdentifier<Group, Endpoint>
    >;
  };
};
