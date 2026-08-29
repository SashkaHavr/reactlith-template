import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import { AuthenticationMiddleware } from "#middleware/authentication/schema";
import { IdBranded } from "@reactlith-template/db/id-branded";

import { UserNotFound } from "../users/schema";

export class NumberNotFound extends Schema.TaggedError<NumberNotFound>()(
  "NumberNotFound",
  { numberId: Schema.String },
  { httpApiStatus: 404 },
) {}

export class MaxCountReached extends Schema.TaggedError<MaxCountReached>()(
  "MaxCountReached",
  { maxCount: Schema.Number },
  { httpApiStatus: 400 },
) {}

export const numberValue = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 100 }));
export const numberInput = Schema.Struct({ number: numberValue });
export const numberUpdateInput = Schema.Struct({ number: Schema.optionalKey(numberValue) }).check(
  Schema.makeFilter((data) => Object.keys(data).length > 0),
);
export const numberOutput = Schema.Struct({ id: IdBranded("number"), number: numberValue });
export const numberIdInput = Schema.Struct({ id: IdBranded("number") });
export const numberFullOutput = Schema.Struct({
  ...numberOutput.fields,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
});

export class NumbersApi extends HttpApiGroup.make("numbers")
  .add(
    HttpApiEndpoint.get("getAll", "/", {
      success: Schema.Struct({ numbers: Schema.Array(numberOutput) }),
    }),
    HttpApiEndpoint.get("getById", "/:id", {
      params: numberIdInput,
      success: numberFullOutput,
      error: NumberNotFound,
    }),
    HttpApiEndpoint.post("addNew", "/", {
      payload: numberInput,
      success: numberOutput,
      error: [MaxCountReached, UserNotFound],
    }),
    HttpApiEndpoint.patch("update", "/:id", {
      params: numberIdInput,
      payload: numberUpdateInput,
      success: numberFullOutput,
      error: NumberNotFound,
    }),
    HttpApiEndpoint.delete("delete", "/:id", {
      params: numberIdInput,
      success: numberIdInput,
      error: NumberNotFound,
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
