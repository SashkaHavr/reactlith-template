import { and, eq } from "drizzle-orm";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api } from "#index.ts";
import { CurrentUserId } from "#middleware/auth.ts";
import { NumberNotFound } from "#numbers.ts";
import { number as numberTable } from "@reactlith-template/db/schema";
import { DB } from "@reactlith-template/services/db";

export const NumbersApiHandlers = HttpApiBuilder.group(Api, "numbers", (handlers) =>
  Effect.gen(function* () {
    const db = yield* DB;

    return handlers
      .handle("getAll", () =>
        Effect.gen(function* () {
          const userId = yield* CurrentUserId;
          return yield* db.query.number
            .findMany({
              columns: { id: true, number: true },
              where: { userId: { eq: userId } },
            })
            .pipe(Effect.orDie);
        }),
      )
      .handle("get", ({ params }) =>
        Effect.gen(function* () {
          const userId = yield* CurrentUserId;
          const item = yield* db.query.number
            .findFirst({
              columns: { id: true, number: true },
              where: { id: { eq: params.id }, userId: { eq: userId } },
            })
            .pipe(Effect.orDie);

          if (!item) {
            return yield* new NumberNotFound();
          }
          return item;
        }),
      )
      .handle("add", ({ payload }) =>
        Effect.gen(function* () {
          const userId = yield* CurrentUserId;
          const [item] = yield* db
            .insert(numberTable)
            .values({ number: payload.number, userId })
            .returning({ id: numberTable.id, number: numberTable.number })
            .pipe(Effect.orDie);
          return item!;
        }),
      )
      .handle("update", ({ params, payload }) =>
        Effect.gen(function* () {
          const userId = yield* CurrentUserId;
          const [item] = yield* db
            .update(numberTable)
            .set({ number: payload.number })
            .where(and(eq(numberTable.id, params.id), eq(numberTable.userId, userId)))
            .returning({ id: numberTable.id, number: numberTable.number })
            .pipe(Effect.orDie);

          if (!item) {
            return yield* new NumberNotFound();
          }
          return item;
        }),
      )
      .handle("deleteAll", () =>
        Effect.gen(function* () {
          const userId = yield* CurrentUserId;
          yield* db.delete(numberTable).where(eq(numberTable.userId, userId)).pipe(Effect.orDie);
        }),
      );
  }),
);
