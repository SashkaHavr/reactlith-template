import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import { AuthMiddleware } from "#middleware/auth.ts";

export const NumberItem = Schema.Struct({
  id: Schema.String.check(Schema.isUUID()),
  number: Schema.Int,
});

export class NumberNotFound extends Schema.TaggedErrorClass<NumberNotFound>()(
  "NumberNotFound",
  {},
  { httpApiStatus: 404 },
) {}

const IdParams = {
  id: Schema.String.check(Schema.isUUID()),
};
const NumberPayload = Schema.Struct({ number: Schema.Int });

export class NumbersApi extends HttpApiGroup.make("numbers")
  .add(
    HttpApiEndpoint.get("getAll", "/", {
      success: Schema.Array(NumberItem),
    }),
    HttpApiEndpoint.get("get", "/:id", {
      params: IdParams,
      success: NumberItem,
      error: NumberNotFound,
    }),
    HttpApiEndpoint.post("add", "/", {
      payload: NumberPayload,
      success: NumberItem,
    }),
    HttpApiEndpoint.put("update", "/:id", {
      params: IdParams,
      payload: NumberPayload,
      success: NumberItem,
      error: NumberNotFound,
    }),
    HttpApiEndpoint.delete("deleteAll", "/"),
  )
  .prefix("/numbers")
  .middleware(AuthMiddleware) {}
