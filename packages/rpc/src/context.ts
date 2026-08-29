import { Context, Effect, Option } from "effect";

import type { AuthType } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import type { LogType } from "@reactlith-template/utils/log";

export class ApiLogger extends Context.Service<ApiLogger, LogType>()("api/ApiLogger") {
  static readonly get = Effect.serviceOption(ApiLogger).pipe(Effect.map(Option.getOrUndefined));
}

export class CurrentUser extends Context.Service<
  CurrentUser,
  {
    readonly session: AuthType["$Infer"]["Session"];
    readonly userId: IdBranded<"user">;
  }
>()("api/CurrentUser") {}
