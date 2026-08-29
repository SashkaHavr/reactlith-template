import { Layer } from "effect";

import { ConfigApiLive } from "#features/config/layer";
import { NumbersApiLiveWithServices } from "#features/numbers/layer";
import { AuthenticationMiddlewareLive } from "#middleware/authentication/layer";
import { GlobalMiddlewareLive } from "#middleware/global/layer";

export const AppApiLive = Layer.mergeAll(ConfigApiLive, NumbersApiLiveWithServices).pipe(
  Layer.provideMerge(AuthenticationMiddlewareLive),
  Layer.provideMerge(GlobalMiddlewareLive),
);

export { ApiLogger, CurrentUser } from "#context";
