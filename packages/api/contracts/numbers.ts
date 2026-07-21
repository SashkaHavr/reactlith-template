import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "effect/unstable/httpapi";

import { AuthMiddleware } from "#/middleware/auth";
import { idBranded } from "@reactlith-template/db";
import { NumberNotFound } from "@reactlith-template/services/repositories/numbers";

export const NumberItem = Schema.Struct({
  id: idBranded("number"),
  number: Schema.Int,
});

const NumberPayload = Schema.Struct({ number: Schema.Int });

export class NumbersApi extends HttpApiGroup.make("numbers")
  .add(
    HttpApiEndpoint.get("getAll", "/", {
      success: Schema.Array(NumberItem),
    }),
    HttpApiEndpoint.get("get", "/:id", {
      params: Schema.Struct({ id: idBranded("number") }),
      success: NumberItem,
      error: NumberNotFound,
    }),
    HttpApiEndpoint.post("add", "/", {
      payload: NumberPayload,
      success: NumberItem,
    }),
    HttpApiEndpoint.put("update", "/:id", {
      params: Schema.Struct({ id: idBranded("number") }),
      payload: NumberPayload,
      success: NumberItem,
      error: NumberNotFound,
    }),
    HttpApiEndpoint.delete("delete", "/:id", {
      params: Schema.Struct({ id: idBranded("number") }),
      error: NumberNotFound,
    }),
    HttpApiEndpoint.delete("deleteAll", "/"),
  )
  .prefix("/numbers")
  .middleware(AuthMiddleware) {}
