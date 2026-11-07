import { RpcMiddleware } from "effect/rpc";

export class GlobalMiddleware extends RpcMiddleware.Service<GlobalMiddleware>()(
  "api/GlobalMiddleware",
) {}
