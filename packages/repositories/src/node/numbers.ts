import { and, eq } from "drizzle-orm";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Effect, Layer } from "effect";

import { schema } from "@reactlith-template/db";
import { NumberNotFound, NumberRepoForUser } from "@reactlith-template/repositories/numbers";
import { CurrentUserId } from "@reactlith-template/services/auth";
import { DB } from "@reactlith-template/services/db";

export const layer = Layer.effect(
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
            orderBy: { createdAt: "asc" },
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
        if (!item) return yield* new NumberNotFound();
        return item;
      }),
      add: Effect.fn("NumberRepoForUser.add")(function* ({ number }) {
        const item = (yield* db
          .insert(schema.number)
          .values({ number, userId })
          .returning({ id: schema.number.id, number: schema.number.number })
          .pipe(Effect.orDie)).at(0);
        if (!item) return yield* Effect.die("Insert returned empty list");
        return item;
      }),
      update: Effect.fn("NumberRepoForUser.update")(function* ({ id, data }) {
        const item = (yield* db
          .update(schema.number)
          .set(data)
          .where(and(eq(schema.number.id, id), eq(schema.number.userId, userId)))
          .returning({ id: schema.number.id, number: schema.number.number })
          .pipe(Effect.orDie)).at(0);
        if (!item) return yield* new NumberNotFound();
        return item;
      }),
      delete: Effect.fn("NumberRepoForUser.delete")(function* ({ id }) {
        const item = (yield* db
          .delete(schema.number)
          .where(and(eq(schema.number.id, id), eq(schema.number.userId, userId)))
          .returning({ id: schema.number.id })
          .pipe(Effect.orDie)).at(0);
        if (!item) return yield* new NumberNotFound();
        return item.id;
      }),
      deleteAll: Effect.fn("NumberRepoForUser.deleteAll")(function* () {
        const items = yield* db
          .delete(schema.number)
          .where(eq(schema.number.userId, userId))
          .returning({ id: schema.number.id })
          .pipe(Effect.orDie);
        return items.map((item) => item.id);
      }),
    });
  }),
).pipe(Layer.provide(PgDrizzle.DefaultServices));
