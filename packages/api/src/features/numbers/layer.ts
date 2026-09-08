import { Effect, Layer } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api } from "#client";
import { Database } from "@reactlith-template/db";

import { UserRepo } from "../users/repo";
import { NumberRepo } from "./repo";
import { MaxCountReached } from "./schema";

export const NumbersApiLive = HttpApiBuilder.group(
  Api,
  "numbers",
  Effect.fn(function* (handlers) {
    const db = yield* Database;
    const numberRepo = yield* NumberRepo;
    const userRepo = yield* UserRepo;

    return handlers.handleAll({
      getCountAbove50: Effect.fnUntraced(function* () {
        return { count: yield* numberRepo.getCountAbove(50) };
      }),
      getAll: Effect.fnUntraced(function* () {
        return { numbers: yield* numberRepo.getAll() };
      }),
      get: Effect.fnUntraced(function* ({ params }) {
        return yield* numberRepo.get(params.id);
      }),
      create: Effect.fnUntraced(function* ({ payload }) {
        return yield* db
          .transaction(
            Effect.fn(function* () {
              yield* userRepo.getUserLock();
              if ((yield* numberRepo.getCount()) >= 10) {
                return yield* new MaxCountReached({ maxCount: 10 });
              }
              return yield* numberRepo.create(payload.number);
            }),
          )
          .pipe(Effect.catchTag("SqlError", Effect.die));
      }),
      update: Effect.fnUntraced(function* ({ params, payload }) {
        return yield* numberRepo.update(params.id, payload);
      }),
      delete: Effect.fnUntraced(function* ({ params }) {
        return yield* numberRepo.delete(params.id);
      }),
      deleteAll: Effect.fnUntraced(function* () {
        yield* numberRepo.deleteAll();
        return null;
      }),
    });
  }),
);

export const NumbersApiLiveWithServices = NumbersApiLive.pipe(
  Layer.provideMerge(NumberRepo.layer),
  Layer.provideMerge(UserRepo.layer),
);
