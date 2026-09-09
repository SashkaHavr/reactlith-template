import { Context } from "effect";

import type { AuthType } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/id-branded";

export class CurrentUser extends Context.Service<
  CurrentUser,
  {
    readonly session: AuthType["$Infer"]["Session"];
    readonly userId: IdBranded<"user">;
  }
>()("api/CurrentUser") {}
