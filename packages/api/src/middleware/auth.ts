import { Schema } from "effect";
import { HttpApiMiddleware } from "effect/unstable/httpapi";

import type { NumberRepoForUser } from "@reactlith-template/repositories/numbers";
import type { CurrentUser, CurrentUserId } from "@reactlith-template/services/auth";

export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  {},
  { httpApiStatus: 401 },
) {}

export class AuthMiddleware extends HttpApiMiddleware.Service<
  AuthMiddleware,
  { provides: CurrentUser | CurrentUserId | NumberRepoForUser }
>()("api/AuthMiddleware", { error: Unauthorized }) {}
