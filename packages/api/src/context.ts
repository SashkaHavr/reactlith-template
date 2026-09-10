import { Context } from "effect";

import type { BetterAuth } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/id-branded";

export class CurrentUser extends Context.Service<
  CurrentUser,
  {
    readonly session: BetterAuth["Service"]["$Infer"]["Session"];
    readonly userId: IdBranded<"user">;
  }
>()("api/CurrentUser") {}
