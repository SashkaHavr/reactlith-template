/* oxlint-disable vitest/no-standalone-expect -- Effect's it.effect wrapper is not recognized. */
import { layer } from "@effect/vitest";
import { Effect } from "effect";
import { expect } from "vitest";

import { seedUsers, userId, withUser } from "#test-utils/repo";
import { Database, schema } from "@reactlith-template/db";

import { UserRepo } from "./repo";
import { UserNotFound } from "./schema";

function withRepo<A, E, R>(effect: Effect.Effect<A, E, R>) {
  return effect.pipe(Effect.provide(UserRepo.layer), withUser());
}

layer(Database.layerTest)("UserRepo", (it) => {
  it.effect("locks and returns the current user", () =>
    Effect.gen(function* () {
      yield* seedUsers;
      const repo = yield* UserRepo;
      expect(yield* repo.getUserLock).toEqual({ id: userId });
    }).pipe(withRepo),
  );

  it.effect("rejects a missing current user", () =>
    Effect.gen(function* () {
      yield* seedUsers;
      const db = yield* Database;
      yield* db.delete(schema.user);
      const repo = yield* UserRepo;
      const error = yield* Effect.flip(repo.getUserLock);
      expect(error).toBeInstanceOf(UserNotFound);
    }).pipe(withRepo),
  );
});
