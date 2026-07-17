import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import { NumbersApi } from "#/numbers";

export class DatabaseConnectionError extends Schema.TaggedErrorClass<DatabaseConnectionError>()(
  "DatabaseConnectionError",
  {},
  { httpApiStatus: 400 },
) {}

export class IndexApi extends HttpApiGroup.make("index")
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

export class Api extends HttpApi.make("api").add(IndexApi).add(NumbersApi).prefix("/api") {}
