import type * as RpcClient from "effect/unstable/rpc/RpcClient";
import type { RpcClientError } from "effect/unstable/rpc/RpcClientError";
import * as RpcGroup from "effect/unstable/rpc/RpcGroup";

import { ConfigRpcs } from "#features/config/schema";
import { NumbersRpcs } from "#features/numbers/schema";
import { GlobalMiddleware } from "#middleware/global/schema";

export const AppRpcs = RpcGroup.make().merge(ConfigRpcs, NumbersRpcs).middleware(GlobalMiddleware);

export type AppRpcClient = RpcClient.FromGroup<typeof AppRpcs, RpcClientError>;
