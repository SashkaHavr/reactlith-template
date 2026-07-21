import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export class DatabaseConnectionError extends Schema.TaggedErrorClass<DatabaseConnectionError>()(
  "DatabaseConnectionError",
  {},
  { httpApiStatus: 400 },
) {}

export class IndexRouteGroup extends HttpApiGroup.make("indexRoute")
  .add(
    HttpApiEndpoint.get("health", "/health", {
      error: DatabaseConnectionError,
      success: Schema.Literal("healthy"),
    }),
  )
  .add(
    HttpApiEndpoint.get("configGeneral", "/config/general", {
      success: Schema.Struct({
        auth: Schema.Struct({
          google: Schema.Boolean,
          googleEmulate: Schema.Boolean,
        }),
      }),
    }),
  ) {}
