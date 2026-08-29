import { Layer } from "effect";
import * as RpcGroup from "effect/unstable/rpc/RpcGroup";

import { ConfigRpcsLive } from "#features/config/layer";
import { ConfigRpcs } from "#features/config/schema";
import { NumbersRpcsLiveWithServices } from "#features/numbers/layer";
import { NumbersRpcs } from "#features/numbers/schema";
import { AuthenticationMiddlewareLive } from "#middleware/authentication/layer";
import { GlobalMiddlewareLive } from "#middleware/global/layer";
import { GlobalMiddleware } from "#middleware/global/schema";

export const AppRpcs = RpcGroup.make().merge(ConfigRpcs, NumbersRpcs).middleware(GlobalMiddleware);

export const AppRpcsLive = Layer.mergeAll(
  ConfigRpcsLive,
  NumbersRpcsLiveWithServices,
  AuthenticationMiddlewareLive,
  GlobalMiddlewareLive,
);

export { CurrentUser, RpcLogger } from "#context";
