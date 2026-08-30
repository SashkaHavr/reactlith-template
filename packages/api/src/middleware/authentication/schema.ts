import { Schema } from "effect";
import { HttpApiMiddleware } from "effect/unstable/httpapi";

import type { CurrentUser } from "#context";

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  "Unauthorized",
  {},
  { httpApiStatus: 401 },
) {}

export class AuthenticationMiddleware extends HttpApiMiddleware.Service<
  AuthenticationMiddleware,
  { provides: CurrentUser }
>()("api/AuthenticationMiddleware", {
  error: Unauthorized,
}) {}
