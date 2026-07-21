import { Layer } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api } from "#/index";

import { IndexRouteApiHandlers } from "./index-route";
import { layerAuthMiddleware } from "./middleware/auth";
import { NumbersApiHandlers } from "./numbers";

export const layer = HttpApiBuilder.layer(Api).pipe(
  Layer.provide([IndexRouteApiHandlers, NumbersApiHandlers]),
  Layer.provide(layerAuthMiddleware),
);
