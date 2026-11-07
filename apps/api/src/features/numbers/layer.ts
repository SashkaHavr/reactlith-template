import { Effect, Layer } from "effect";

import { MaxCountReached, NumbersApi } from "@reactlith-template/api-contract/features/numbers";
import { Database } from "@reactlith-template/db";

import { UserRepo } from "../users/repo";
import { NumberRepo } from "./repo";

export const NumbersApiLive = NumbersApi.toLayer(
  Effect.gen(function* () {
    const db = yield* Database;
    const numberRepo = yield* NumberRepo;
    const userRepo = yield* UserRepo;

    return {
      "numbers.getCountAbove50": Effect.fnUntraced(function* () {
        return { count: yield* numberRepo.getCountAbove(50) };
      }),
      "numbers.getAll": Effect.fnUntraced(function* () {
        return { numbers: yield* numberRepo.getAll() };
      }),
      "numbers.get": Effect.fnUntraced(function* ({ id }) {
        return yield* numberRepo.get(id);
      }),
      "numbers.create": Effect.fnUntraced(function* (payload) {
        return yield* db
          .transaction(
            Effect.fn(function* () {
              yield* userRepo.getUserLock();
              if ((yield* numberRepo.getCount()) >= 10) {
                return yield* MaxCountReached.make({ maxCount: 10 });
              }
              return yield* numberRepo.create(payload.number);
            }),
          )
          .pipe(Effect.catchTag("SqlError", Effect.die));
      }),
      "numbers.update": Effect.fnUntraced(function* ({ id, ...payload }) {
        return yield* numberRepo.update(id, payload);
      }),
      "numbers.delete": Effect.fnUntraced(function* ({ id }) {
        return yield* numberRepo.delete(id);
      }),
      "numbers.deleteAll": Effect.fnUntraced(function* () {
        yield* numberRepo.deleteAll();
        return null;
      }),
    };
  }),
);

export const NumbersApiLiveWithServices = NumbersApiLive.pipe(
  Layer.provideMerge(NumberRepo.layer),
  Layer.provideMerge(UserRepo.layer),
);
