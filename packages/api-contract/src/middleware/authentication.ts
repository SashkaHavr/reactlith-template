import { Schema } from "effect";
import { RpcMiddleware } from "effect/rpc";

import type { CurrentUser } from "#/context";

export class NotAuthenticated extends Schema.TaggedError<NotAuthenticated>()(
  "NotAuthenticated",
  {},
) {}

export class AuthenticationMiddleware extends RpcMiddleware.Service<
  AuthenticationMiddleware,
  { provides: CurrentUser }
>()("api/AuthenticationMiddleware", {
  error: NotAuthenticated,
}) {}
