import { and, eq } from "drizzle-orm";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api } from "#/index";
import { CurrentUserId } from "#/middleware/auth";
import { NumberNotFound } from "#/numbers";
import { schema } from "@reactlith-template/db";
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
            .insert(schema.number)
            .values({ number: payload.number, userId })
            .returning({ id: schema.number.id, number: schema.number.number })
            .pipe(Effect.orDie);
          return item!;
        }),
      )
      .handle("update", ({ params, payload }) =>
        Effect.gen(function* () {
          const userId = yield* CurrentUserId;
          const [item] = yield* db
            .update(schema.number)
            .set({ number: payload.number })
            .where(and(eq(schema.number.id, params.id), eq(schema.number.userId, userId)))
            .returning({ id: schema.number.id, number: schema.number.number })
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
          yield* db
            .delete(schema.number)
            .where(eq(schema.number.userId, userId))
            .pipe(Effect.orDie);
        }),
      );
  }),
);
