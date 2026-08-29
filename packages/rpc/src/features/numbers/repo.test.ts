import { layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { expect } from "vitest";

import { layerCurrentUser, otherUserId, seedUsers, userId } from "#test-utils/repo";
import { Database, schema } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";

import { NumberRepo } from "./repo";
import { NumberNotFound } from "./schema";

function insertNumber(id: IdBranded<"user">, value: number, createdAt?: Date) {
  return Effect.gen(function* () {
    const db = yield* Database;
    const [row] = yield* db
      .insert(schema.number)
      .values({ userId: id, number: value, createdAt })
      .returning({ id: schema.number.id, number: schema.number.number });
    if (!row) throw new Error("Failed to seed number");
    return row;
  });
}

layer(NumberRepo.layer.pipe(Layer.provideMerge(Database.layerTest)))("NumberRepo", (it) => {
  it.layer(layerCurrentUser())((it) => {
    it.effect("gets numbers for the current user in creation order", () =>
      Effect.gen(function* () {
        yield* seedUsers;
        yield* insertNumber(userId, 2, new Date("2025-01-02"));
        yield* insertNumber(userId, 1, new Date("2025-01-01"));
        yield* insertNumber(otherUserId, 3, new Date("2025-01-01"));
        const repo = yield* NumberRepo;
        expect((yield* repo.getAll()).map(({ number }) => number)).toEqual([1, 2]);
      }),
    );
  });

  it.layer(layerCurrentUser())((it) => {
    it.effect("counts owned numbers and public numbers above a value", () =>
      Effect.gen(function* () {
        yield* seedUsers;
        yield* insertNumber(userId, 50);
        yield* insertNumber(userId, 51);
        yield* insertNumber(otherUserId, 100);
        const repo = yield* NumberRepo;
        expect(yield* repo.getCount()).toBe(2);
        expect(yield* repo.getCountAbove(50)).toBe(2);
      }),
    );
  });

  it.layer(layerCurrentUser())((it) => {
    it.effect("gets an owned number and rejects another user's number", () =>
      Effect.gen(function* () {
        yield* seedUsers;
        const owned = yield* insertNumber(userId, 1);
        const other = yield* insertNumber(otherUserId, 2);
        const repo = yield* NumberRepo;
        expect(yield* repo.getById(owned.id)).toMatchObject(owned);
        expect(yield* Effect.flip(repo.getById(other.id))).toBeInstanceOf(NumberNotFound);
      }),
    );
  });

  it.layer(layerCurrentUser())((it) => {
    it.effect("adds, updates, and deletes owned numbers", () =>
      Effect.gen(function* () {
        yield* seedUsers;
        const repo = yield* NumberRepo;
        const added = yield* repo.addNew(42);
        expect(added.number).toBe(42);
        const updated = yield* repo.update(added.id, { number: 10 });
        expect(updated.number).toBe(10);
        expect(yield* repo.deleteById(added.id)).toEqual({ id: added.id });
        expect(yield* repo.getAll()).toEqual([]);
      }),
    );
  });

  it.layer(layerCurrentUser())((it) => {
    it.effect("deletes only numbers owned by the current user", () =>
      Effect.gen(function* () {
        yield* seedUsers;
        yield* insertNumber(userId, 1);
        const other = yield* insertNumber(otherUserId, 2);
        const repo = yield* NumberRepo;
        yield* repo.deleteAll();
        expect(yield* repo.getAll()).toEqual([]);

        const otherNumbers = yield* repo
          .getAll()
          .pipe(Effect.provide(layerCurrentUser(otherUserId)));
        expect(otherNumbers).toEqual([other]);
      }),
    );
  });
});
