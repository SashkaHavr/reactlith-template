import { Context, Schema } from "effect";
import { RpcMiddleware } from "effect/rpc";

import type { CurrentUser } from "#/context";
import type { AuthPermissions } from "@reactlith-template/auth";

export const RequiredPermissions = Context.Reference<AuthPermissions>(
  "api/AuthorizationMiddleware /RequiredPermissions",
  { defaultValue: () => ({}) },
);

export class InsufficientPermissions extends Schema.TaggedError<InsufficientPermissions>()(
  "InsufficientPermissions",
  {},
) {}

export class AuthorizationMiddleware extends RpcMiddleware.Service<
  AuthorizationMiddleware,
  { requires: CurrentUser }
>()("api/AuthorizationMiddleware ", {
  error: InsufficientPermissions,
}) {}
