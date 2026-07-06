import type { Effect } from "effect";
import { Context } from "effect";

import type { WebRequest } from "#web-request.ts";
import type { AuthType } from "@reactlith-template/auth";

export class Auth extends Context.Service<
  Auth,
  {
    getSession: () => Effect.Effect<
      Awaited<ReturnType<AuthType["api"]["getSession"]>>,
      never,
      WebRequest
    >;
  }
>()("@reactlith-template/auth") {}
