import { and, eq, gt } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";

import { CurrentUser } from "#context";
import { Database, schema } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";

import { NumberNotFound } from "./schema";

export type NumberRow = { readonly id: IdBranded<"number">; readonly number: number };
export type NumberFullRow = NumberRow & {
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export class NumberRepo extends Context.Service<NumberRepo>()("api/NumberRepo", {
  make: Effect.gen(function* () {
    const db = yield* Database;

    return {
      getCountAbove: Effect.fnUntraced(function* (value: number) {
        return yield* db.$count(schema.number, gt(schema.number.number, value)).pipe(Effect.orDie);
      }),
      getAll: Effect.fnUntraced(function* () {
        const { userId } = yield* CurrentUser;
        return yield* db.query.number
          .findMany({
            columns: { id: true, number: true },
            where: { userId: { eq: userId } },
            orderBy: { createdAt: "asc" },
          })
          .pipe(Effect.orDie);
      }),
      getCount: Effect.fnUntraced(function* () {
        const { userId } = yield* CurrentUser;
        return yield* db.$count(schema.number, eq(schema.number.userId, userId)).pipe(Effect.orDie);
      }),
      get: Effect.fnUntraced(function* (id: IdBranded<"number">) {
        const { userId } = yield* CurrentUser;
        const number = yield* db.query.number
          .findFirst({
            columns: { id: true, number: true, createdAt: true, updatedAt: true },
            where: { id: { eq: id }, userId: { eq: userId } },
          })
          .pipe(Effect.orDie);
        if (!number) {
          return yield* new NumberNotFound({ numberId: id });
        }
        return number;
      }),
      create: Effect.fnUntraced(function* (value: number) {
        const { userId } = yield* CurrentUser;
        const [number] = yield* db
          .insert(schema.number)
          .values({ userId, number: value })
          .returning({ id: schema.number.id, number: schema.number.number })
          .pipe(Effect.orDie);
        if (!number) {
          return yield* Effect.die("Failed to add number");
        }
        return number;
      }),
      update: Effect.fnUntraced(function* (
        id: IdBranded<"number">,
        data: { readonly number?: number },
      ) {
        const { userId } = yield* CurrentUser;
        const [number] = yield* db
          .update(schema.number)
          .set(data)
          .where(and(eq(schema.number.id, id), eq(schema.number.userId, userId)))
          .returning({
            id: schema.number.id,
            number: schema.number.number,
            createdAt: schema.number.createdAt,
            updatedAt: schema.number.updatedAt,
          })
          .pipe(Effect.orDie);
        if (!number) {
          return yield* new NumberNotFound({ numberId: id });
        }
        return number;
      }),
      delete: Effect.fnUntraced(function* (id: IdBranded<"number">) {
        const { userId } = yield* CurrentUser;
        const [number] = yield* db
          .delete(schema.number)
          .where(and(eq(schema.number.id, id), eq(schema.number.userId, userId)))
          .returning({ id: schema.number.id })
          .pipe(Effect.orDie);
        if (!number) {
          return yield* new NumberNotFound({ numberId: id });
        }
        return number;
      }),
      deleteAll: Effect.fnUntraced(function* () {
        const { userId } = yield* CurrentUser;
        yield* db.delete(schema.number).where(eq(schema.number.userId, userId)).pipe(Effect.orDie);
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
