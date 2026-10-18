import { Schema, Struct } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/http-api";

import { AuthenticationMiddleware } from "#middleware/authentication";
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
export const NumberOutput = Schema.Struct({
  id: IdBranded("number"),
  number: NumberValue,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
});

export class NumbersApi extends HttpApiGroup.make("numbers")
  .add(
    HttpApiEndpoint.get("getAll", "/", {
      success: Schema.Struct({
        numbers: Schema.Array(NumberOutput.mapFields(Struct.pick(["id", "number"]))),
      }),
    }),
    HttpApiEndpoint.get("get", "/:id", {
      params: Schema.Struct({ id: IdBranded("number") }),
      success: NumberOutput,
      error: [NumberNotFound],
    }),
    HttpApiEndpoint.post("create", "/", {
      payload: Schema.Struct({ number: NumberValue }),
      success: NumberOutput,
      error: [MaxCountReached],
    }),
    HttpApiEndpoint.patch("update", "/:id", {
      params: Schema.Struct({ id: IdBranded("number") }),
      payload: Schema.Struct({ number: Schema.optionalKey(NumberValue) }).check(
        Schema.isMinProperties(1),
      ),
      success: NumberOutput,
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
      success: Schema.Struct({ count: Schema.Natural }),
    }),
  )
  .prefix("/numbers") {}
