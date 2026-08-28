import { Context } from "effect";

import type { AuthType } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import type { LogType } from "@reactlith-template/utils/log";

export class RpcLogger extends Context.Service<RpcLogger, LogType | undefined>()("rpc/RpcLogger") {}

export class CurrentUser extends Context.Service<
  CurrentUser,
  {
    readonly session: AuthType["$Infer"]["Session"];
    readonly userId: IdBranded<"user">;
  }
>()("rpc/CurrentUser") {}
