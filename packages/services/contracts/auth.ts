import type { Effect } from "effect";
import { Context } from "effect";

import type { AuthType } from "@reactlith-template/auth";

export class Auth extends Context.Service<
  Auth,
  {
    getSession: (
      request: Request,
    ) => Effect.Effect<Awaited<ReturnType<AuthType["api"]["getSession"]>>>;
  }
>()("services/Auth") {}
