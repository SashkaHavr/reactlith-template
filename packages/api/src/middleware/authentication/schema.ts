import { Schema } from "effect";
import { HttpApiMiddleware } from "effect/unstable/httpapi";

import type { CurrentUser } from "#context";

export class NotAuthenticated extends Schema.TaggedError<NotAuthenticated>()(
  "NotAuthenticated",
  {},
  { httpApiStatus: 401 },
) {}

export class AuthenticationMiddleware extends HttpApiMiddleware.Service<
  AuthenticationMiddleware,
  { provides: CurrentUser }
>()("api/AuthenticationMiddleware", {
  error: NotAuthenticated,
}) {}
