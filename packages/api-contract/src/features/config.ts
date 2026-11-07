import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";

export const AuthOutput = Schema.Struct({
  googleEmulate: Schema.Boolean,
});

export class NotReady extends Schema.TaggedError<NotReady>()("NotReady", {}) {}

export class ConfigApi extends RpcGroup.make(Rpc.make("auth", { success: AuthOutput })).prefix(
  "config.",
) {}
