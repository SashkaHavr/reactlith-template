import { layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { expect } from "vitest";

import { layerCurrentUser, seedUsers, testId } from "#test-utils";
import { Database, schema } from "@reactlith-template/db";
import { DatabaseTest } from "@reactlith-template/db/test-db";

import { UserRepo } from "./repo";
import { UserNotFound } from "./schema";

layer(
  UserRepo.layer.pipe(Layer.provideMerge(DatabaseTest), Layer.provideMerge(layerCurrentUser())),
)((it) => {
  it.effect(
    "locks and returns the current user",
    Effect.fn(function* () {
      yield* seedUsers;
      const repo = yield* UserRepo;

      const result = yield* repo.getUserLock();

      expect(result).toEqual({ id: testId("user", 0) });
    }),
  );

  it.effect(
    "rejects a missing current user",
    Effect.fn(function* () {
      yield* seedUsers;
      const db = yield* Database;
      yield* db.delete(schema.user);
      const repo = yield* UserRepo;

      const error = yield* repo.getUserLock().pipe(Effect.flip);

      expect(error).toBeInstanceOf(UserNotFound);
    }),
  );
});
