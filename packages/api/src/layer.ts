import { Layer } from "effect";

import { ConfigApiLiveWithServices } from "#features/config/layer";
import { AuthenticationMiddlewareLive } from "#middleware/authentication/layer";
import { GlobalMiddlewareLive } from "#middleware/global/layer";
import { AuthorizationMiddlewareLive } from "#middleware/permission/layer";

export const ApiLive = Layer.mergeAll(ConfigApiLiveWithServices).pipe(
  Layer.provideMerge(AuthorizationMiddlewareLive),
  Layer.provideMerge(AuthenticationMiddlewareLive),
  Layer.provideMerge(GlobalMiddlewareLive),
);
