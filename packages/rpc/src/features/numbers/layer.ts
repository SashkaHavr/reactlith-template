import { Effect } from "effect";

import type { CurrentUser } from "#context";
import { DrizzlePostgresClient } from "@reactlith-template/db";

import { UserRepo } from "../users/repo";
import { NumberRepo } from "./repo";
import { MaxCountReached, NumbersRpcs } from "./schema";

export const NumbersRpcsLive = NumbersRpcs.toLayer(
  Effect.gen(function* () {
    const db = yield* DrizzlePostgresClient;
    const numberRepo = yield* NumberRepo;
    const userRepo = yield* UserRepo;

    return NumbersRpcs.of({
      "numbers.getCountAbove50": () =>
        Effect.gen(function* () {
          return { count: yield* numberRepo.getCountAbove(50) };
        }),
      "numbers.getAll": () =>
        Effect.gen(function* () {
          return { numbers: yield* numberRepo.getAll };
        }),
      "numbers.getById": ({ id }) => numberRepo.getById(id),
      "numbers.addNew": ({ number }) =>
        Effect.gen(function* () {
          const context = yield* Effect.context<CurrentUser>();
          const result = yield* Effect.promise(async () =>
            db.transaction(async () =>
              Effect.runPromiseExitWith(context)(
                Effect.gen(function* () {
                  yield* userRepo.getUserLock;
                  if ((yield* numberRepo.getCount) >= 10) {
                    return yield* new MaxCountReached({ maxCount: 10 });
                  }
                  return yield* numberRepo.addNew(number);
                }),
              ),
            ),
          );
          return yield* result;
        }),
      "numbers.update": ({ id, data }) => numberRepo.update(id, data),
      "numbers.delete": ({ id }) => numberRepo.deleteById(id),
      "numbers.deleteAll": () =>
        Effect.gen(function* () {
          yield* numberRepo.deleteAll;
          return null;
        }),
    });
  }),
);
