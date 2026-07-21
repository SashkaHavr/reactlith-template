import { HttpApi } from "effect/unstable/httpapi";

import { IndexRouteGroup } from "./index-route";
import { NumbersGroup } from "./numbers";

export class Api extends HttpApi.make("api")
  .add(IndexRouteGroup)
  .add(NumbersGroup)
  .prefix("/api") {}
