import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";

import { setupRepoTest } from "#test-utils/repo";
import { schema } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";

import { NumberRepo } from "./repo";
import { NumberNotFound } from "./schema";

const testContext = setupRepoTest();

function insertNumber(id: IdBranded<"user">, value: number, createdAt?: Date) {
  return Effect.promise(async () => {
    const [row] = await testContext.db
      .insert(schema.number)
      .values({ userId: id, number: value, createdAt })
      .returning({ id: schema.number.id, number: schema.number.number });
    if (!row) throw new Error("Failed to seed number");
    return row;
  });
}

function withRepo<A, E, R>(effect: Effect.Effect<A, E, R>, userId = testContext.userId) {
  return testContext.provideUser(userId, effect.pipe(Effect.provide(NumberRepo.layer)));
}

describe("NumberRepo", () => {
  it.effect("gets numbers for the current user in creation order", () =>
    Effect.gen(function* () {
      yield* insertNumber(testContext.userId, 2, new Date("2025-01-02"));
      yield* insertNumber(testContext.userId, 1, new Date("2025-01-01"));
      yield* insertNumber(testContext.otherUserId, 3, new Date("2025-01-01"));
      const repo = yield* NumberRepo;
      assert.deepStrictEqual(
        (yield* repo.getAll).map(({ number }) => number),
        [1, 2],
      );
    }).pipe(withRepo),
  );

  it.effect("counts owned numbers and public numbers above a value", () =>
    Effect.gen(function* () {
      yield* insertNumber(testContext.userId, 50);
      yield* insertNumber(testContext.userId, 51);
      yield* insertNumber(testContext.otherUserId, 100);
      const repo = yield* NumberRepo;
      assert.strictEqual(yield* repo.getCount, 2);
      assert.strictEqual(yield* repo.getCountAbove(50), 2);
    }).pipe(withRepo),
  );

  it.effect("gets an owned number and rejects another user's number", () =>
    Effect.gen(function* () {
      const owned = yield* insertNumber(testContext.userId, 1);
      const other = yield* insertNumber(testContext.otherUserId, 2);
      const repo = yield* NumberRepo;
      assert.deepNestedInclude(yield* repo.getById(owned.id), owned);
      assert.instanceOf(yield* Effect.flip(repo.getById(other.id)), NumberNotFound);
    }).pipe(withRepo),
  );

  it.effect("adds, updates, and deletes owned numbers", () =>
    Effect.gen(function* () {
      const repo = yield* NumberRepo;
      const added = yield* repo.addNew(42);
      assert.strictEqual(added.number, 42);
      const updated = yield* repo.update(added.id, { number: 10 });
      assert.strictEqual(updated.number, 10);
      assert.deepStrictEqual(yield* repo.deleteById(added.id), { id: added.id });
      assert.deepStrictEqual(yield* repo.getAll, []);
    }).pipe(withRepo),
  );

  it.effect("deletes only numbers owned by the current user", () =>
    Effect.gen(function* () {
      yield* insertNumber(testContext.userId, 1);
      const other = yield* insertNumber(testContext.otherUserId, 2);
      const repo = yield* NumberRepo;
      yield* repo.deleteAll;
      assert.deepStrictEqual(yield* repo.getAll, []);

      const otherNumbers = yield* withRepo(
        Effect.gen(function* () {
          return yield* (yield* NumberRepo).getAll;
        }),
        testContext.otherUserId,
      );
      assert.deepStrictEqual(otherNumbers, [other]);
    }).pipe(withRepo),
  );
});
