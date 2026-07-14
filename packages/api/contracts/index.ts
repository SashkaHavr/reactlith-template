import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

export class DatabaseConnectionError extends Schema.TaggedErrorClass<DatabaseConnectionError>()(
  "DatabaseConnectionError",
  {},
  { httpApiStatus: 400 },
) {}

export class IndexApi extends HttpApiGroup.make("index").add(
  HttpApiEndpoint.get("health", "/health", {
    error: DatabaseConnectionError,
    success: Schema.Literal("healthy"),
  }),
) {}

export class Api extends HttpApi.make("api").add(IndexApi).prefix("/api") {}
