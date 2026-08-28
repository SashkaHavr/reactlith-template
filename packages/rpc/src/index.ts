import { Layer } from "effect";
import * as RpcGroup from "effect/unstable/rpc/RpcGroup";

import { ConfigRpcsLive } from "#features/config/layer";
import { ConfigRpcs } from "#features/config/schema";
import { NumbersRpcsLive } from "#features/numbers/layer";
import { NumberRepo } from "#features/numbers/repo";
import { NumbersRpcs } from "#features/numbers/schema";
import { UserRepo } from "#features/users/repo";
import { AuthenticationMiddlewareLive } from "#middleware/authentication/layer";
import { GlobalMiddlewareLive } from "#middleware/global/layer";
import { GlobalMiddleware } from "#middleware/global/schema";
import { DrizzlePostgresClient } from "@reactlith-template/db";

export const AppRpcs = RpcGroup.make().merge(ConfigRpcs, NumbersRpcs).middleware(GlobalMiddleware);

export const AppRpcsLive = Layer.mergeAll(
  ConfigRpcsLive,
  NumbersRpcsLive,
  AuthenticationMiddlewareLive,
  GlobalMiddlewareLive,
).pipe(
  Layer.provideMerge(NumberRepo.layer),
  Layer.provideMerge(UserRepo.layer),
  Layer.provideMerge(DrizzlePostgresClient.layer),
);

export { CurrentUser, RpcLogger } from "#context";
