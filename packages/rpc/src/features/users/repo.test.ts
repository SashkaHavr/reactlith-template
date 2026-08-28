import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";

import { setupRepoTest } from "#test-utils/repo";
import { schema } from "@reactlith-template/db";

import { UserRepo } from "./repo";
import { UserNotFound } from "./schema";

const testContext = setupRepoTest();

function withRepo<A, E, R>(effect: Effect.Effect<A, E, R>) {
  return testContext.provideUser(testContext.userId, effect.pipe(Effect.provide(UserRepo.layer)));
}

describe("UserRepo", () => {
  it.effect("locks and returns the current user", () =>
    Effect.gen(function* () {
      const repo = yield* UserRepo;
      assert.deepStrictEqual(yield* repo.getUserLock, { id: testContext.userId });
    }).pipe(withRepo),
  );

  it.effect("rejects a missing current user", () =>
    Effect.gen(function* () {
      yield* Effect.promise(() => testContext.db.delete(schema.user));
      const repo = yield* UserRepo;
      const error = yield* Effect.flip(repo.getUserLock);
      assert.instanceOf(error, UserNotFound);
    }).pipe(withRepo),
  );
});
