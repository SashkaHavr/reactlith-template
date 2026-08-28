import { and, eq, gt } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";

import { CurrentUser } from "#context";
import { DrizzlePostgresClient, schema } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";

import { NumberNotFound } from "./schema";

export type NumberRow = { readonly id: IdBranded<"number">; readonly number: number };
export type NumberFullRow = NumberRow & {
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export class NumberRepo extends Context.Service<NumberRepo>()("rpc/NumberRepo", {
  make: Effect.gen(function* () {
    const db = yield* DrizzlePostgresClient;

    return {
      getCountAbove: (value: number) =>
        Effect.gen(function* () {
          return yield* Effect.promise(() =>
            db.$count(schema.number, gt(schema.number.number, value)),
          );
        }),
      getAll: Effect.gen(function* () {
        const { userId } = yield* CurrentUser;
        return yield* Effect.promise(() =>
          db.query.number.findMany({
            columns: { id: true, number: true },
            where: { userId: { eq: userId } },
            orderBy: { createdAt: "asc" },
          }),
        );
      }),
      getCount: Effect.gen(function* () {
        const { userId } = yield* CurrentUser;
        return yield* Effect.promise(() =>
          db.$count(schema.number, eq(schema.number.userId, userId)),
        );
      }),
      getById: (id: IdBranded<"number">) =>
        Effect.gen(function* () {
          const { userId } = yield* CurrentUser;
          const number = yield* Effect.promise(() =>
            db.query.number.findFirst({
              columns: { id: true, number: true, createdAt: true, updatedAt: true },
              where: { id: { eq: id }, userId: { eq: userId } },
            }),
          );
          if (!number) {
            return yield* new NumberNotFound({ numberId: id });
          }
          return number;
        }),
      addNew: (value: number) =>
        Effect.gen(function* () {
          const { userId } = yield* CurrentUser;
          const [number] = yield* Effect.promise(() =>
            db
              .insert(schema.number)
              .values({ userId, number: value })
              .returning({ id: schema.number.id, number: schema.number.number }),
          );
          if (!number) {
            return yield* Effect.die("Failed to add number");
          }
          return number;
        }),
      update: (id: IdBranded<"number">, data: { readonly number?: number }) =>
        Effect.gen(function* () {
          const { userId } = yield* CurrentUser;
          const [number] = yield* Effect.promise(() =>
            db
              .update(schema.number)
              .set(data)
              .where(and(eq(schema.number.id, id), eq(schema.number.userId, userId)))
              .returning({
                id: schema.number.id,
                number: schema.number.number,
                createdAt: schema.number.createdAt,
                updatedAt: schema.number.updatedAt,
              }),
          );
          if (!number) {
            return yield* new NumberNotFound({ numberId: id });
          }
          return number;
        }),
      deleteById: (id: IdBranded<"number">) =>
        Effect.gen(function* () {
          const { userId } = yield* CurrentUser;
          const [number] = yield* Effect.promise(() =>
            db
              .delete(schema.number)
              .where(and(eq(schema.number.id, id), eq(schema.number.userId, userId)))
              .returning({ id: schema.number.id }),
          );
          if (!number) {
            return yield* new NumberNotFound({ numberId: id });
          }
          return number;
        }),
      deleteAll: Effect.gen(function* () {
        const { userId } = yield* CurrentUser;
        yield* Effect.promise(() =>
          db.delete(schema.number).where(eq(schema.number.userId, userId)),
        );
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
