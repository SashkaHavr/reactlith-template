import { Effect, Layer } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AppApi } from "#client";
import { Database } from "@reactlith-template/db";

import { UserRepo } from "../users/repo";
import { NumberRepo } from "./repo";
import { MaxCountReached } from "./schema";

export const NumbersApiLive = HttpApiBuilder.group(
  AppApi,
  "numbers",
  Effect.fn(function* (handlers) {
    const db = yield* Database;
    const numberRepo = yield* NumberRepo;
    const userRepo = yield* UserRepo;

    return handlers.handleAll({
      getCountAbove50: () =>
        Effect.gen(function* () {
          return { count: yield* numberRepo.getCountAbove(50) };
        }),
      getAll: () =>
        Effect.gen(function* () {
          return { numbers: yield* numberRepo.getAll() };
        }),
      getById: ({ params }) => numberRepo.getById(params.id),
      addNew: ({ payload }) =>
        Effect.gen(function* () {
          return yield* db
            .transaction(() =>
              Effect.gen(function* () {
                yield* userRepo.getUserLock();
                if ((yield* numberRepo.getCount()) >= 10) {
                  return yield* new MaxCountReached({ maxCount: 10 });
                }
                return yield* numberRepo.addNew(payload.number);
              }),
            )
            .pipe(Effect.catchTag("SqlError", Effect.die));
        }),
      update: ({ params, payload }) => numberRepo.update(params.id, payload),
      delete: ({ params }) => numberRepo.deleteById(params.id),
      deleteAll: () =>
        Effect.gen(function* () {
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
