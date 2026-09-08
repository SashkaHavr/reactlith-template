import { layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { expect } from "vitest";

import { CurrentUser } from "#context";
import { layerCurrentUser, seedUsers, testId } from "#test-utils";
import { Database, schema } from "@reactlith-template/db";
import { DatabaseTest } from "@reactlith-template/db/test-db";

import { NumberRepo } from "./repo";
import { NumberNotFound } from "./schema";

const insertNumber = Effect.fn(function* (number: number, createdAt?: Date) {
  const db = yield* Database;
  const user = yield* CurrentUser;
  const [row] = yield* db
    .insert(schema.number)
    .values({ userId: user.userId, number, createdAt })
    .returning({ id: schema.number.id, number: schema.number.number });
  if (!row) return yield* Effect.die("Failed to seed number");
  return row;
});

layer(NumberRepo.layer.pipe(Layer.provideMerge(DatabaseTest)))((it) => {
  it.effect(
    "counts public numbers above",
    Effect.fn(function* () {
      yield* seedUsers;
      yield* insertNumber(1).pipe(Effect.provide(layerCurrentUser(0)));
      yield* insertNumber(50).pipe(Effect.provide(layerCurrentUser(0)));
      yield* insertNumber(51).pipe(Effect.provide(layerCurrentUser(0)));
      yield* insertNumber(2).pipe(Effect.provide(layerCurrentUser(1)));
      yield* insertNumber(52).pipe(Effect.provide(layerCurrentUser(1)));
      yield* insertNumber(100).pipe(Effect.provide(layerCurrentUser(1)));
      const repo = yield* NumberRepo;

      const result = yield* repo.getCountAbove(50);

      expect(result).toBe(3);
    }),
  );
});

layer(
  NumberRepo.layer.pipe(Layer.provideMerge(DatabaseTest), Layer.provideMerge(layerCurrentUser())),
)((it) => {
  it.effect(
    "gets numbers for the current user",
    Effect.fn(function* () {
      yield* seedUsers;
      yield* insertNumber(1);
      yield* insertNumber(2);
      yield* insertNumber(3).pipe(Effect.provide(layerCurrentUser(1)));
      const repo = yield* NumberRepo;

      const result = yield* repo.getAll();

      expect(result.map(({ number }) => number)).toEqual([1, 2]);
    }),
  );

  it.effect(
    "gets numbers sorted by createdAt",
    Effect.fn(function* () {
      yield* seedUsers;
      yield* insertNumber(2, new Date(1));
      yield* insertNumber(1, new Date(0));
      const repo = yield* NumberRepo;

      const result = yield* repo.getAll();

      expect(result.map(({ number }) => number)).toEqual([1, 2]);
    }),
  );

  it.effect(
    "counts owned numbers",
    Effect.fn(function* () {
      yield* seedUsers;
      yield* insertNumber(1);
      yield* insertNumber(2);
      yield* insertNumber(3).pipe(Effect.provide(layerCurrentUser(1)));
      const repo = yield* NumberRepo;

      const result = yield* repo.getCount();

      expect(result).toBe(2);
    }),
  );

  it.effect(
    "gets an owned number",
    Effect.fn(function* () {
      yield* seedUsers;
      const owned = yield* insertNumber(1);
      const repo = yield* NumberRepo;

      const result = yield* repo.get(owned.id);

      expect(result).toMatchObject(owned);
    }),
  );

  it.effect(
    "rejects getting a missing number",
    Effect.fn(function* () {
      yield* seedUsers;
      const repo = yield* NumberRepo;

      const error = yield* repo.get(testId("number", 0)).pipe(Effect.flip);

      expect(error).toBeInstanceOf(NumberNotFound);
    }),
  );

  it.effect(
    "rejects getting another user's number",
    Effect.fn(function* () {
      yield* seedUsers;
      const other = yield* insertNumber(2).pipe(Effect.provide(layerCurrentUser(1)));
      const repo = yield* NumberRepo;

      const error = yield* repo.get(other.id).pipe(Effect.flip);

      expect(error).toBeInstanceOf(NumberNotFound);
    }),
  );

  it.effect(
    "updates only the targeted number",
    Effect.fn(function* () {
      yield* seedUsers;
      const target = yield* insertNumber(1);
      const sibling = yield* insertNumber(2);
      const repo = yield* NumberRepo;

      const result = yield* repo.update(target.id, { number: 10 });
      const siblingResult = yield* repo.get(sibling.id);

      expect(result).toMatchObject({ id: target.id, number: 10 });
      expect(siblingResult).toMatchObject(sibling);
    }),
  );

  it.effect(
    "rejects updating a missing number",
    Effect.fn(function* () {
      yield* seedUsers;
      const repo = yield* NumberRepo;

      const error = yield* repo.update(testId("number", 0), { number: 10 }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(NumberNotFound);
    }),
  );

  it.effect(
    "rejects updating another user's number",
    Effect.fn(function* () {
      yield* seedUsers;
      const other = yield* insertNumber(2).pipe(Effect.provide(layerCurrentUser(1)));
      const repo = yield* NumberRepo;

      const error = yield* repo.update(other.id, { number: 10 }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(NumberNotFound);
    }),
  );

  it.effect(
    "deletes only the targeted number",
    Effect.fn(function* () {
      yield* seedUsers;
      const target = yield* insertNumber(1);
      const sibling = yield* insertNumber(2);
      const repo = yield* NumberRepo;

      const result = yield* repo.delete(target.id);
      const targetError = yield* repo.get(target.id).pipe(Effect.flip);
      const siblingResult = yield* repo.get(sibling.id);

      expect(result).toEqual({ id: target.id });
      expect(targetError).toBeInstanceOf(NumberNotFound);
      expect(siblingResult).toMatchObject(sibling);
    }),
  );

  it.effect(
    "rejects deleting a missing number",
    Effect.fn(function* () {
      yield* seedUsers;
      const repo = yield* NumberRepo;

      const error = yield* repo.delete(testId("number", 0)).pipe(Effect.flip);

      expect(error).toBeInstanceOf(NumberNotFound);
    }),
  );

  it.effect(
    "rejects deleting another user's number",
    Effect.fn(function* () {
      yield* seedUsers;
      const other = yield* insertNumber(2).pipe(Effect.provide(layerCurrentUser(1)));
      const repo = yield* NumberRepo;

      const error = yield* repo.delete(other.id).pipe(Effect.flip);

      expect(error).toBeInstanceOf(NumberNotFound);
    }),
  );

  it.effect(
    "deletes only numbers owned by the current user",
    Effect.fn(function* () {
      yield* seedUsers;
      yield* insertNumber(1);
      const other = yield* insertNumber(2).pipe(Effect.provide(layerCurrentUser(1)));
      const repo = yield* NumberRepo;

      yield* repo.deleteAll();
      const getAllResult = yield* repo.getAll();
      const otherUserGetAllResult = yield* repo.getAll().pipe(Effect.provide(layerCurrentUser(1)));

      expect(getAllResult).toEqual([]);
      expect(otherUserGetAllResult).toEqual([other]);
    }),
  );
});
