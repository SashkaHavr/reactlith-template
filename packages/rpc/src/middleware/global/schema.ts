import * as RpcMiddleware from "effect/unstable/rpc/RpcMiddleware";

export class GlobalMiddleware extends RpcMiddleware.Service<GlobalMiddleware>()(
  "rpc/GlobalMiddleware",
) {}
