import { Layer } from "effect";

import { ConfigRpcsLive } from "#features/config/layer";
import { NumbersRpcsLiveWithServices } from "#features/numbers/layer";
import { AuthenticationMiddlewareLive } from "#middleware/authentication/layer";
import { GlobalMiddlewareLive } from "#middleware/global/layer";

export const AppRpcsLive = Layer.mergeAll(
  ConfigRpcsLive,
  NumbersRpcsLiveWithServices,
  AuthenticationMiddlewareLive,
  GlobalMiddlewareLive,
);

export { CurrentUser, RpcLogger } from "#context";
