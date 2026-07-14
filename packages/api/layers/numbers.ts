import { and, eq } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api } from "#index.ts";
import { CurrentUserId, NumberNotFound, NumbersAuthorization, Unauthorized } from "#numbers.ts";
import { number as numberTable } from "@reactlith-template/db/schema";
import { Auth } from "@reactlith-template/services/auth";
import { DB } from "@reactlith-template/services/db";
import { WebRequest } from "@reactlith-template/services/web-request";

const NumbersAuthorizationLayer = Layer.effect(
  NumbersAuthorization,
  Effect.gen(function* () {
    const auth = yield* Auth;

    return (httpEffect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest;
        const webRequest = yield* HttpServerRequest.toWeb(request).pipe(Effect.orDie);
        const session = yield* auth
          .getSession()
          .pipe(Effect.provideService(WebRequest, webRequest));

        if (!session) {
          return yield* new Unauthorized();
        }

        return yield* httpEffect.pipe(Effect.provideService(CurrentUserId, session.user.id));
      });
  }),
);

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
              where: { userId },
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
              where: { id: params.id, userId },
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
).pipe(Layer.provide(NumbersAuthorizationLayer));
