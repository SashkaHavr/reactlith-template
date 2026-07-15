import type { Effect } from "effect";
import { Context, Schema } from "effect";
import { HttpApiMiddleware } from "effect/unstable/httpapi";

import type { Auth } from "@reactlith-template/services/auth";

export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  "Unauthorized",
  {},
  { httpApiStatus: 401 },
) {}

export class CurrentUser extends Context.Service<
  CurrentUser,
  NonNullable<Effect.Success<ReturnType<Auth["Service"]["getSession"]>>>["user"]
>()("api/CurrentUser") {}

export class CurrentUserId extends Context.Service<CurrentUserId, string>()("api/CurrentUserId") {}

export class AuthMiddleware extends HttpApiMiddleware.Service<
  AuthMiddleware,
  { provides: CurrentUser | CurrentUserId }
>()("api/AuthMiddleware", { error: Unauthorized }) {}
