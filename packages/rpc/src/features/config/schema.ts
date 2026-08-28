import { Schema } from "effect";
import * as Rpc from "effect/unstable/rpc/Rpc";
import * as RpcGroup from "effect/unstable/rpc/RpcGroup";

export const authOutput = Schema.Struct({
  google: Schema.Boolean,
  googleEmulate: Schema.Boolean,
});

export const ConfigRpcs = RpcGroup.make(Rpc.make("auth", { success: authOutput })).prefix(
  "config.",
);
