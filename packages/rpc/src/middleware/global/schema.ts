import * as RpcMiddleware from "effect/unstable/rpc/RpcMiddleware";

import type { RpcLogger } from "#context";

export class GlobalMiddleware extends RpcMiddleware.Service<
  GlobalMiddleware,
  { requires: RpcLogger }
>()("rpc/GlobalMiddleware") {}
