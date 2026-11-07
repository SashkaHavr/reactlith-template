import type { Rpc, RpcClient, RpcClientError } from "effect/rpc";
import { RpcGroup } from "effect/rpc";

import { ConfigApi } from "#/features/config";
import { NumbersApi } from "#/features/numbers";
import { GlobalMiddleware } from "#/middleware/global";

export class Api extends RpcGroup.make()
  .merge(ConfigApi, NumbersApi)
  .middleware(GlobalMiddleware) {}

type ApiRpc = RpcGroup.Rpcs<typeof Api>;
export type ApiClient = RpcClient.RpcClient<ApiRpc, RpcClientError.RpcClientError>;

type ApiGroup = ApiRpc["_tag"] extends `${infer Group}.${string}` ? Group : never;
type ApiGroupRpc<Group extends ApiGroup> = Extract<ApiRpc, { readonly _tag: `${Group}.${string}` }>;

export type ApiInput = {
  [Group in ApiGroup]: {
    [
      Procedure in ApiGroupRpc<Group> as Procedure["_tag"] extends `${Group}.${infer Method}`
        ? Method
        : never
    ]: Rpc.PayloadConstructor<Procedure>;
  };
};
