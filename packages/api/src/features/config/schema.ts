import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export const AuthOutput = Schema.Struct({
  googleEmulate: Schema.Boolean,
});

export class NotReady extends Schema.TaggedError<NotReady>()(
  "NotReady",
  {},
  { httpApiStatus: 400 },
) {}

export class ConfigApi extends HttpApiGroup.make("config")
  .add(HttpApiEndpoint.get("auth", "/auth", { success: AuthOutput }))
  .prefix("/config")
  .add(HttpApiEndpoint.get("healthLive", "/health/live", { success: Schema.Null }))
  .add(
    HttpApiEndpoint.get("healthReady", "/health/ready", {
      success: Schema.Null,
      error: [NotReady],
    }),
  ) {}
