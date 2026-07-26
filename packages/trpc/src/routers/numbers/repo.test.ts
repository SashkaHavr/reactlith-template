import { describe, expect, it } from "vitest";

import { schema } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";

import { setupRepoTest } from "../../test-utils/repo";
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

    await expect(
      testContext.inUserContext(testContext.userId, numberRepo.getAll),
    ).resolves.toMatchObject([{ number: 1 }, { number: 2 }]);
  });

  it("counts only numbers owned by the current user", async () => {
    await insertNumber(testContext.userId, 1);
    await insertNumber(testContext.userId, 2);
    await insertNumber(testContext.otherUserId, 3);

    await expect(testContext.inUserContext(testContext.userId, numberRepo.getCount)).resolves.toBe(
      2,
    );
  });

  it("gets an owned number by id and rejects another user's number", async () => {
    const owned = await insertNumber(testContext.userId, 1);
    const other = await insertNumber(testContext.otherUserId, 2);

    await expect(
      testContext.inUserContext(testContext.userId, async () => numberRepo.getById(owned.id)),
    ).resolves.toEqual(owned);
    await expect(
      testContext.inUserContext(testContext.userId, async () => numberRepo.getById(other.id)),
    ).rejects.toThrow("Number not found");
  });

  it("adds a number for the current user", async () => {
    const added = await testContext.inUserContext(testContext.userId, async () =>
      numberRepo.addNew(42),
    );

    expect(added.number).toBe(42);
    await expect(testContext.inUserContext(testContext.userId, numberRepo.getAll)).resolves.toEqual(
      [added],
    );
    await expect(
      testContext.inUserContext(testContext.otherUserId, numberRepo.getAll),
    ).resolves.toEqual([]);
  });

  it("updates an owned number and rejects another user's number", async () => {
    const owned = await insertNumber(testContext.userId, 1);
    const other = await insertNumber(testContext.otherUserId, 2);

    await expect(
      testContext.inUserContext(testContext.userId, async () =>
        numberRepo.update(owned.id, { number: 10 }),
      ),
    ).resolves.toEqual({ id: owned.id, number: 10 });
    await expect(
      testContext.inUserContext(testContext.userId, async () =>
        numberRepo.update(other.id, { number: 20 }),
      ),
    ).rejects.toThrow("Number not found");
  });

  it("deletes an owned number by id and rejects another user's number", async () => {
    const owned = await insertNumber(testContext.userId, 1);
    const other = await insertNumber(testContext.otherUserId, 2);

    await expect(
      testContext.inUserContext(testContext.userId, async () => numberRepo.deleteById(owned.id)),
    ).resolves.toEqual({ id: owned.id });
    await expect(
      testContext.inUserContext(testContext.userId, async () => numberRepo.deleteById(other.id)),
    ).rejects.toThrow("Number not found");
  });

  it("deletes all numbers owned by the current user", async () => {
    await insertNumber(testContext.userId, 1);
    const other = await insertNumber(testContext.otherUserId, 2);

    await expect(
      testContext.inUserContext(testContext.userId, numberRepo.deleteAll),
    ).resolves.toBeUndefined();
    await expect(testContext.inUserContext(testContext.userId, numberRepo.getAll)).resolves.toEqual(
      [],
    );
    await expect(
      testContext.inUserContext(testContext.otherUserId, numberRepo.getAll),
    ).resolves.toEqual([other]);
  });
});
