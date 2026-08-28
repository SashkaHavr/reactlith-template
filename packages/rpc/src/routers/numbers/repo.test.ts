import { describe, expect, it } from "vitest";

import { setupRepoTest } from "#test-utils/repo";
import { schema } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";

import { NumberNotFound } from "./errors";
import { numberRepo } from "./repo";

const testContext = setupRepoTest();

async function insertNumber(id: IdBranded<"user">, value: number, createdAt?: Date) {
  const [row] = await testContext.db
    .insert(schema.number)
    .values({ userId: id, number: value, createdAt })
    .returning({ id: schema.number.id, number: schema.number.number });

  if (!row) {
    throw new Error("Failed to seed number");
  }

  return row;
}

describe("numberRepo", () => {
  it("gets all numbers for the current user in creation order", async () => {
    await insertNumber(testContext.userId, 2, new Date("2025-01-02"));
    await insertNumber(testContext.userId, 1, new Date("2025-01-01"));
    await insertNumber(testContext.otherUserId, 3, new Date("2025-01-01"));

    const result = await testContext.inUserContext(testContext.userId, numberRepo.getAll);

    expect(result).toMatchObject([{ number: 1 }, { number: 2 }]);
  });

  it("counts only numbers owned by the current user", async () => {
    await insertNumber(testContext.userId, 1);
    await insertNumber(testContext.userId, 2);
    await insertNumber(testContext.otherUserId, 3);

    const result = await testContext.inUserContext(testContext.userId, numberRepo.getCount);

    expect(result).toBe(2);
  });

  it("counts numbers above a value across all users", async () => {
    await insertNumber(testContext.userId, 50);
    await insertNumber(testContext.userId, 51);
    await insertNumber(testContext.otherUserId, 100);

    const result = await testContext.inUserContext(testContext.userId, async () =>
      numberRepo.getCountAbove(50),
    );

    expect(result).toBe(2);
  });

  it("gets an owned number by id and rejects another user's number", async () => {
    const owned = await insertNumber(testContext.userId, 1);
    const other = await insertNumber(testContext.otherUserId, 2);

    const result = await testContext.inUserContext(testContext.userId, async () =>
      numberRepo.getById(owned.id),
    );
    const otherResult = await testContext.inUserContext(testContext.userId, async () =>
      numberRepo.getById(other.id),
    );

    expect(result.unwrap()).toMatchObject(owned);
    expect(otherResult).toMatchObject({ error: expect.any(NumberNotFound) });
  });

  it("adds a number for the current user", async () => {
    const { userId, otherUserId } = testContext;

    const added = await testContext.inUserContext(testContext.userId, async () =>
      numberRepo.addNew(42),
    );
    const userNumbers = await testContext.inUserContext(userId, numberRepo.getAll);
    const otherUserNumbers = await testContext.inUserContext(otherUserId, numberRepo.getAll);

    expect(added).toMatchObject({ number: 42 });
    expect(userNumbers).toEqual([added]);
    expect(otherUserNumbers).toEqual([]);
  });

  it("updates an owned number and rejects another user's number", async () => {
    const owned = await insertNumber(testContext.userId, 1);
    const other = await insertNumber(testContext.otherUserId, 2);

    const result = await testContext.inUserContext(testContext.userId, async () =>
      numberRepo.update(owned.id, { number: 10 }),
    );
    const otherResult = testContext.inUserContext(testContext.userId, async () =>
      numberRepo.update(other.id, { number: 20 }),
    );

    expect(result.unwrap()).toMatchObject({ id: owned.id, number: 10 });
    await expect(otherResult).resolves.toMatchObject({ error: expect.any(NumberNotFound) });
  });

  it("deletes an owned number by id and rejects another user's number", async () => {
    const owned = await insertNumber(testContext.userId, 1);
    const other = await insertNumber(testContext.otherUserId, 2);

    const result = await testContext.inUserContext(testContext.userId, async () =>
      numberRepo.deleteById(owned.id),
    );
    const otherResult = testContext.inUserContext(testContext.userId, async () =>
      numberRepo.deleteById(other.id),
    );

    expect(result.unwrap()).toMatchObject({ id: owned.id });
    await expect(otherResult).resolves.toMatchObject({ error: expect.any(NumberNotFound) });
  });

  it("deletes all numbers owned by the current user", async () => {
    await insertNumber(testContext.userId, 1);
    const other = await insertNumber(testContext.otherUserId, 2);

    const result = await testContext.inUserContext(testContext.userId, numberRepo.deleteAll);
    const userNumbers = await testContext.inUserContext(testContext.userId, numberRepo.getAll);
    const otherUserNumbers = await testContext.inUserContext(
      testContext.otherUserId,
      numberRepo.getAll,
    );

    expect(result).toBeUndefined();
    expect(userNumbers).toEqual([]);
    expect(otherUserNumbers).toEqual([other]);
  });
});
