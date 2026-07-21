import { and, eq } from "drizzle-orm";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Context, Effect, Layer, Schema } from "effect";

import { DB } from "#/db";
import type { IdBranded } from "@reactlith-template/db";
import { schema } from "@reactlith-template/db";

import { CurrentUserId } from "../contracts/auth";

type NumberItem = Pick<typeof schema.number.$inferSelect, "id" | "number">;

export class NumberNotFound extends Schema.TaggedErrorClass<NumberNotFound>()(
  "NumberNotFound",
  {},
  { httpApiStatus: 404 },
) {}

export class NumberRepoForUser extends Context.Service<
  NumberRepoForUser,
  {
    readonly getAll: () => Effect.Effect<ReadonlyArray<NumberItem>>;
    readonly get: (input: { id: IdBranded<"number"> }) => Effect.Effect<NumberItem, NumberNotFound>;
    readonly add: (
      input: Pick<typeof schema.number.$inferInsert, "number">,
    ) => Effect.Effect<NumberItem>;
    readonly update: (input: {
      id: IdBranded<"number">;
      data: Pick<typeof schema.number.$inferInsert, "number">;
    }) => Effect.Effect<NumberItem, NumberNotFound>;
    readonly delete: (input: { id: IdBranded<"number"> }) => Effect.Effect<void, NumberNotFound>;
    readonly deleteAll: () => Effect.Effect<void>;
  }
>()("db/repositories/NumberRepoForUser") {
  static readonly layer = Layer.effect(
    NumberRepoForUser,
    Effect.gen(function* () {
      const db = yield* DB;
      const userId = yield* CurrentUserId;

      return NumberRepoForUser.of({
        getAll: Effect.fn("NumberRepoForUser.getAll")(function* () {
          return yield* db.query.number
            .findMany({
              columns: { id: true, number: true },
              where: { userId: { eq: userId } },
            })
            .pipe(Effect.orDie);
        }),
        get: Effect.fn("NumberRepoForUser.get")(function* ({ id }) {
          const item = yield* db.query.number
            .findFirst({
              columns: { id: true, number: true },
              where: { id: { eq: id }, userId: { eq: userId } },
            })
            .pipe(Effect.orDie);
          if (!item) {
            return yield* new NumberNotFound();
          }
          return item;
        }),
        add: Effect.fn("NumberRepoForUser.add")(function* ({ number }) {
          const item = (yield* db
            .insert(schema.number)
            .values({ number, userId })
            .returning({ id: schema.number.id, number: schema.number.number })
            .pipe(Effect.orDie)).at(0);
          if (!item) {
            return yield* Effect.die("Insert returned empty list");
          }
          return item;
        }),
        update: Effect.fn("NumberRepoForUser.update")(function* ({ id, data }) {
          const item = (yield* db
            .update(schema.number)
            .set(data)
            .where(and(eq(schema.number.id, id), eq(schema.number.userId, userId)))
            .returning({ id: schema.number.id, number: schema.number.number })
            .pipe(Effect.orDie)).at(0);
          if (!item) {
            return yield* new NumberNotFound();
          }
          return item;
        }),
        delete: Effect.fn("NumberRepoForUser.delete")(function* ({ id }) {
          const item = (yield* db
            .delete(schema.number)
            .where(and(eq(schema.number.id, id), eq(schema.number.userId, userId)))
            .returning({ id: schema.number.id })
            .pipe(Effect.orDie)).at(0);
          if (!item) {
            return yield* new NumberNotFound();
          }
        }),
        deleteAll: Effect.fn("NumberRepoForUser.deleteAll")(function* () {
          yield* db
            .delete(schema.number)
            .where(eq(schema.number.userId, userId))
            .pipe(Effect.orDie);
        }),
      });
    }),
  ).pipe(Layer.provide(PgDrizzle.DefaultServices));
}
