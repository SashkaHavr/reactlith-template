import { Schema } from "effect";
import * as Rpc from "effect/unstable/rpc/Rpc";
import * as RpcGroup from "effect/unstable/rpc/RpcGroup";

import { AuthenticationMiddleware } from "#middleware/authentication/schema";
import { IdBranded } from "@reactlith-template/db/id-branded";

import { UserNotFound } from "../users/schema";

export class NumberNotFound extends Schema.TaggedError<NumberNotFound>()("NumberNotFound", {
  numberId: Schema.String,
}) {}

export class MaxCountReached extends Schema.TaggedError<MaxCountReached>()("MaxCountReached", {
  maxCount: Schema.Number,
}) {}

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

const PublicRpcs = RpcGroup.make(
  Rpc.make("getCountAbove50", {
    success: Schema.Struct({ count: Schema.Natural }),
  }),
);

const AuthenticatedRpcs = RpcGroup.make(
  Rpc.make("getAll", {
    success: Schema.Struct({ numbers: Schema.Array(numberOutput) }),
  }),
  Rpc.make("getById", {
    payload: numberIdInput,
    success: numberFullOutput,
    error: NumberNotFound,
  }),
  Rpc.make("addNew", {
    payload: numberInput,
    success: numberOutput,
    error: Schema.Union([MaxCountReached, UserNotFound]),
  }),
  Rpc.make("update", {
    payload: Schema.Struct({ id: IdBranded("number"), data: numberUpdateInput }),
    success: numberFullOutput,
    error: NumberNotFound,
  }),
  Rpc.make("delete", {
    payload: numberIdInput,
    success: numberIdInput,
    error: NumberNotFound,
  }),
  Rpc.make("deleteAll", { success: Schema.Null }),
).middleware(AuthenticationMiddleware);

export const NumbersRpcs = RpcGroup.make().merge(PublicRpcs, AuthenticatedRpcs).prefix("numbers.");
