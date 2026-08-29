import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export const AuthOutput = Schema.Struct({
  googleEmulate: Schema.Boolean,
});

export class ConfigApi extends HttpApiGroup.make("config")
  .add(HttpApiEndpoint.get("auth", "/auth", { success: AuthOutput }))
  .prefix("/config") {}
