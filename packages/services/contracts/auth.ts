import type { Effect } from "effect";
import { Context } from "effect";

import type { AuthType } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/utils";

export class Auth extends Context.Service<
  Auth,
  {
    getSession: (
      request: Request,
    ) => Effect.Effect<Awaited<ReturnType<AuthType["api"]["getSession"]>>>;
  }
>()("services/Auth") {}

export class CurrentUser extends Context.Service<
  CurrentUser,
  AuthType["$Infer"]["Session"]["user"]
>()("services/CurrentUser") {}

export class CurrentUserId extends Context.Service<CurrentUserId, IdBranded<"user">>()(
  "services/CurrentUserId",
) {}
