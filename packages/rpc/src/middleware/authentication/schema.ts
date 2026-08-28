import { Schema } from "effect";
import * as RpcMiddleware from "effect/unstable/rpc/RpcMiddleware";

import type { CurrentUser, RpcLogger } from "#context";

export class Unauthorized extends Schema.TaggedError<Unauthorized>()("Unauthorized", {}) {}

export class AuthenticationMiddleware extends RpcMiddleware.Service<
  AuthenticationMiddleware,
  { provides: CurrentUser; requires: RpcLogger }
>()("rpc/AuthenticationMiddleware", { error: Unauthorized }) {}
