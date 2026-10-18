import { Context } from "effect";

import type { SessionType } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/id-branded";

export class CurrentUser extends Context.Service<
  CurrentUser,
  {
    readonly session: SessionType;
    readonly userId: IdBranded<"user">;
  }
>()("api/CurrentUser") {}
