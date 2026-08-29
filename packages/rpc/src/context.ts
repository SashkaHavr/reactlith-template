import { Context, Effect, Option } from "effect";

import type { AuthType } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import type { LogType } from "@reactlith-template/utils/log";

export class RpcLogger extends Context.Service<RpcLogger, LogType>()("rpc/RpcLogger") {
  static readonly get = Effect.serviceOption(RpcLogger).pipe(Effect.map(Option.getOrUndefined));
}

export class CurrentUser extends Context.Service<
  CurrentUser,
  {
    readonly session: AuthType["$Infer"]["Session"];
    readonly userId: IdBranded<"user">;
  }
>()("rpc/CurrentUser") {}
