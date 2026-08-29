import type { HttpApiClient } from "effect/unstable/httpapi";
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
