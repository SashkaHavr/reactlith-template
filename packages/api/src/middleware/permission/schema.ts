import { Context, Schema } from "effect";
import { HttpApiMiddleware } from "effect/unstable/httpapi";

import type { CurrentUser } from "#context";
import type { AuthPermissions } from "@reactlith-template/auth";

export const RequiredPermissions = Context.Reference<AuthPermissions>(
  "api/AuthorizationMiddleware /RequiredPermissions",
  { defaultValue: () => ({}) },
);

export class InsufficientPermissions extends Schema.TaggedError<InsufficientPermissions>()(
  "InsufficientPermissions",
  {},
  { httpApiStatus: 403 },
) {}

export class AuthorizationMiddleware extends HttpApiMiddleware.Service<
  AuthorizationMiddleware,
  { requires: CurrentUser }
>()("api/AuthorizationMiddleware ", {
  error: InsufficientPermissions,
}) {}
