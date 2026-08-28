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

export class NumberRepo extends Context.Service<NumberRepo>()("rpc/NumberRepo", {
  make: Effect.gen(function* () {
    const db = yield* Database;

    return {
      getCountAbove: (value: number) =>
        Effect.gen(function* () {
          return yield* db
            .$count(schema.number, gt(schema.number.number, value))
            .pipe(Effect.orDie);
        }),
      getAll: Effect.gen(function* () {
        const { userId } = yield* CurrentUser;
        return yield* db.query.number
          .findMany({
            columns: { id: true, number: true },
            where: { userId: { eq: userId } },
            orderBy: { createdAt: "asc" },
          })
          .pipe(Effect.orDie);
      }),
      getCount: Effect.gen(function* () {
        const { userId } = yield* CurrentUser;
        return yield* db.$count(schema.number, eq(schema.number.userId, userId)).pipe(Effect.orDie);
      }),
      getById: (id: IdBranded<"number">) =>
        Effect.gen(function* () {
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
      addNew: (value: number) =>
        Effect.gen(function* () {
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
      update: (id: IdBranded<"number">, data: { readonly number?: number }) =>
        Effect.gen(function* () {
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
      deleteById: (id: IdBranded<"number">) =>
        Effect.gen(function* () {
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
      deleteAll: Effect.gen(function* () {
        const { userId } = yield* CurrentUser;
        yield* db.delete(schema.number).where(eq(schema.number.userId, userId)).pipe(Effect.orDie);
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
