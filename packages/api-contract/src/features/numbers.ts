import { Schema } from "effect";
import { Rpc, RpcGroup } from "effect/rpc";

import { AuthenticationMiddleware } from "#/middleware/authentication";
import { IdBranded } from "@reactlith-template/db/id-branded";

export class NumberNotFound extends Schema.TaggedError<NumberNotFound>()("NumberNotFound", {
  numberId: Schema.String,
}) {}

export class MaxCountReached extends Schema.TaggedError<MaxCountReached>()("MaxCountReached", {
  maxCount: Schema.Finite,
}) {}

export const NumberValue = Schema.Int.check(Schema.isBetween({ minimum: 0, maximum: 100 }));
export const NumbersGetOutput = Schema.Struct({
  id: IdBranded("number"),
  number: NumberValue,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
});

export const NumbersGetAllOutput = Schema.Struct({ numbers: Schema.Array(NumbersGetOutput) });
export const NumbersGetCountAbove50Output = Schema.Struct({ count: Schema.Natural });

export class NumbersApi extends RpcGroup.make(
  Rpc.make("getAll", {
    success: NumbersGetAllOutput,
  }),
  Rpc.make("get", {
    payload: { id: IdBranded("number") },
    success: NumbersGetOutput,
    error: NumberNotFound,
  }),
  Rpc.make("create", {
    payload: Schema.Struct({ number: NumberValue }),
    success: NumbersGetOutput,
    error: MaxCountReached,
  }),
  Rpc.make("update", {
    payload: { id: IdBranded("number"), number: NumberValue },
    success: NumbersGetOutput,
    error: NumberNotFound,
  }),
  Rpc.make("delete", {
    payload: { id: IdBranded("number") },
    success: Schema.Struct({ id: IdBranded("number") }),
    error: NumberNotFound,
  }),
  Rpc.make("deleteAll", {
    success: Schema.Null,
  }),
)
  .middleware(AuthenticationMiddleware)
  .add(
    Rpc.make("getCountAbove50", {
      success: NumbersGetCountAbove50Output,
    }),
  )
  .prefix("numbers.") {}
