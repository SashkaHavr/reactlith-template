import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import { AuthenticationMiddleware } from "#middleware/authentication/schema";
import { schemaCrudUpdate } from "#schema-utils";
import { IdBranded } from "@reactlith-template/db/id-branded";

export class NumberNotFound extends Schema.TaggedError<NumberNotFound>()(
  "NumberNotFound",
  { numberId: Schema.String },
  { httpApiStatus: 404 },
) {}

export class MaxCountReached extends Schema.TaggedError<MaxCountReached>()(
  "MaxCountReached",
  { maxCount: Schema.Finite },
  { httpApiStatus: 400 },
) {}

export const NumberValue = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 100 }));
export const NumberSchema = Schema.Struct({
  id: IdBranded("number"),
  number: NumberValue,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
});
const NumberIdInput = Schema.Struct({ id: IdBranded("number") });

export class NumbersApi extends HttpApiGroup.make("numbers")
  .add(
    HttpApiEndpoint.get("getAll", "/", {
      success: Schema.Struct({ numbers: Schema.Array(NumberSchema) }),
    }),
    HttpApiEndpoint.get("get", "/:id", {
      params: NumberIdInput,
      success: NumberSchema,
      error: [NumberNotFound],
    }),
    HttpApiEndpoint.post("create", "/", {
      payload: Schema.Struct({ number: NumberValue }),
      success: NumberSchema,
      error: [MaxCountReached],
    }),
    HttpApiEndpoint.patch("update", "/:id", {
      params: NumberIdInput,
      payload: Schema.Struct({ number: NumberValue }).pipe(schemaCrudUpdate),
      success: NumberSchema,
      error: [NumberNotFound],
    }),
    HttpApiEndpoint.delete("delete", "/:id", {
      params: NumberIdInput,
      success: NumberIdInput,
      error: [NumberNotFound],
    }),
    HttpApiEndpoint.delete("deleteAll", "/", {
      success: Schema.Null,
    }),
  )
  .middleware(AuthenticationMiddleware)
  .add(
    HttpApiEndpoint.get("getCountAbove50", "/count-above-50", {
      success: Schema.Struct({ count: Schema.Natural }),
    }),
  )
  .prefix("/numbers") {}
