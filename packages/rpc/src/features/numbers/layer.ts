import { Effect, Layer } from "effect";

import { Database } from "@reactlith-template/db";

import { UserRepo } from "../users/repo";
import { NumberRepo } from "./repo";
import { MaxCountReached, NumbersRpcs } from "./schema";

export const NumbersRpcsLive = NumbersRpcs.toLayer(
  Effect.gen(function* () {
    const db = yield* Database;
    const numberRepo = yield* NumberRepo;
    const userRepo = yield* UserRepo;

    return NumbersRpcs.of({
      "numbers.getCountAbove50": () =>
        Effect.gen(function* () {
          return { count: yield* numberRepo.getCountAbove(50) };
        }),
      "numbers.getAll": () =>
        Effect.gen(function* () {
          return { numbers: yield* numberRepo.getAll() };
        }),
      "numbers.getById": ({ id }) => numberRepo.getById(id),
      "numbers.addNew": ({ number }) =>
        Effect.gen(function* () {
          return yield* db
            .transaction(() =>
              Effect.gen(function* () {
                yield* userRepo.getUserLock();
                if ((yield* numberRepo.getCount()) >= 10) {
                  return yield* new MaxCountReached({ maxCount: 10 });
                }
                return yield* numberRepo.addNew(number);
              }),
            )
            .pipe(Effect.catchTag("SqlError", Effect.die));
        }),
      "numbers.update": ({ id, data }) => numberRepo.update(id, data),
      "numbers.delete": ({ id }) => numberRepo.deleteById(id),
      "numbers.deleteAll": () =>
        Effect.gen(function* () {
          yield* numberRepo.deleteAll();
          return null;
        }),
    });
  }),
);

export const NumbersRpcsLiveWithServices = NumbersRpcsLive.pipe(
  Layer.provideMerge(NumberRepo.layer),
  Layer.provideMerge(UserRepo.layer),
);
