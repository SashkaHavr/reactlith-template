import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/http-api";

import { AuthenticationMiddleware } from "#/middleware/authentication";
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
export const NumbersGetOutput = Schema.Struct({
  id: IdBranded("number"),
  number: NumberValue,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
});

export const NumbersGetAllOutput = Schema.Struct({ numbers: Schema.Array(NumbersGetOutput) });
export const NumbersGetCountAbove50Output = Schema.Struct({ count: Schema.Natural });

export class NumbersApi extends HttpApiGroup.make("numbers")
  .add(
    HttpApiEndpoint.get("getAll", "/", {
      success: NumbersGetAllOutput,
    }),
    HttpApiEndpoint.get("get", "/:id", {
      params: Schema.Struct({ id: IdBranded("number") }),
      success: NumbersGetOutput,
      error: [NumberNotFound],
    }),
    HttpApiEndpoint.post("create", "/", {
      payload: Schema.Struct({ number: NumberValue }),
      success: NumbersGetOutput,
      error: [MaxCountReached],
    }),
    HttpApiEndpoint.patch("update", "/:id", {
      params: Schema.Struct({ id: IdBranded("number") }),
      payload: Schema.Struct({ number: NumberValue }),
      success: NumbersGetOutput,
      error: [NumberNotFound],
    }),
    HttpApiEndpoint.delete("delete", "/:id", {
      params: Schema.Struct({ id: IdBranded("number") }),
      success: Schema.Struct({ id: IdBranded("number") }),
      error: [NumberNotFound],
    }),
    HttpApiEndpoint.delete("deleteAll", "/", {
      success: Schema.Null,
    }),
  )
  .middleware(AuthenticationMiddleware)
  .add(
    HttpApiEndpoint.get("getCountAbove50", "/count-above-50", {
      success: NumbersGetCountAbove50Output,
    }),
  )
  .prefix("/numbers") {}
