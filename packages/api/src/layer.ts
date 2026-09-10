import { Layer } from "effect";

import { ConfigApiLive } from "#features/config/layer";
import { NumbersApiLiveWithServices } from "#features/numbers/layer";
import { AuthenticationMiddlewareLive } from "#middleware/authentication/layer";
import { GlobalMiddlewareLive } from "#middleware/global/layer";
import { AuthorizationMiddlewareLive } from "#middleware/permission/layer";

export const ApiLive = Layer.mergeAll(ConfigApiLive, NumbersApiLiveWithServices).pipe(
  Layer.provideMerge(AuthenticationMiddlewareLive),
  Layer.provideMerge(AuthorizationMiddlewareLive),
  Layer.provideMerge(GlobalMiddlewareLive),
);
