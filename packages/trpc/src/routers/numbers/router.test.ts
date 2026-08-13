import { beforeEach, describe, expect, it, mock } from "bun:test";

import { Result } from "better-result";

import type { Context } from "#context";
import type { numberRepo } from "#routers/numbers/repo";
import { UserNotFound } from "#routers/users/errors";
import type { userRepo } from "#routers/users/repo";
import type { IdBranded } from "@reactlith-template/db/id-branded";

const numberRepoMock = {
  addNew: mock<typeof numberRepo.addNew>(),
  deleteAll: mock<typeof numberRepo.deleteAll>(),
  deleteById: mock<typeof numberRepo.deleteById>(),
  getAll: mock<typeof numberRepo.getAll>(),
  getById: mock<typeof numberRepo.getById>(),
  getCount: mock<typeof numberRepo.getCount>(),
  getCountAbove: mock<typeof numberRepo.getCountAbove>(),
  update: mock<typeof numberRepo.update>(),
};
const userRepoMock = {
  getUserLock: mock<typeof userRepo.getUserLock>(),
};

await mock.module("./repo", () => ({ numberRepo: numberRepoMock }));
await mock.module("#routers/users/repo", () => ({ userRepo: userRepoMock }));

import { ProtectedProcedureUnauthorized } from "#procedures/protected-procedure";

import { MaxCountReached } from "./errors";
import { numbersRouter } from "./router";

const numberId = "00000000-0000-7000-8000-000000000001" as IdBranded<"number">;
const userId = "00000000-0000-7000-8000-000000000002" as IdBranded<"user">;
const number = { id: numberId, number: 42 };
const numberFull = {
  ...number,
  createdAt: new Date(1_000),
  updatedAt: new Date(2_000),
};
const numberFullOutput = {
  ...number,
  createdAt: 1_000,
  updatedAt: 2_000,
};

function createCaller({ authenticated = true } = {}) {
  const getSession = mock<() => Promise<{ user: { id: typeof userId } } | null>>(async () =>
    authenticated ? { user: { id: userId } } : null,
  );
  const transaction = mock<(callback: (tx: unknown) => Promise<unknown>) => Promise<unknown>>(
    async (callback) => callback({}),
  );
  const caller = numbersRouter.createCaller({
    auth: { getSession },
    db: { transaction },
    request: { headers: {} },
  } as unknown as Context);

  return { caller, getSession, transaction };
}

beforeEach(() => {
  mock.clearAllMocks();
});

describe("numbersRouter", () => {
  it("publicly gets the count of numbers above 50", async () => {
    numberRepoMock.getCountAbove.mockResolvedValue(3);
    const { caller, getSession } = createCaller({ authenticated: false });

    const result = await caller.getCountAbove50();

    expect(result).toEqual({ count: 3 });
    expect(numberRepoMock.getCountAbove).toHaveBeenCalledWith(50);
    expect(getSession).not.toHaveBeenCalled();
  });

  it("requires authentication", async () => {
    const { caller } = createCaller({ authenticated: false });

    const result = caller.getAll();

    await expect(result).rejects.toMatchObject({
      cause: expect.any(ProtectedProcedureUnauthorized),
    });
    expect(numberRepoMock.getAll).not.toHaveBeenCalled();
  });

  it("gets all numbers from the repository", async () => {
    numberRepoMock.getAll.mockResolvedValue([number]);
    const { caller } = createCaller();

    const result = await caller.getAll();

    expect(result).toEqual({ numbers: [number] });
    expect(numberRepoMock.getAll).toHaveBeenCalledTimes(1);
  });

  it("gets a number by id", async () => {
    numberRepoMock.getById.mockResolvedValue(Result.ok(numberFull));
    const { caller } = createCaller();

    const result = await caller.getById({ id: numberId });

    expect(result).toEqual(numberFullOutput);
    expect(numberRepoMock.getById).toHaveBeenCalledWith(numberId);
  });

  it("adds a number within a locked transaction", async () => {
    numberRepoMock.getCount.mockResolvedValue(9);
    numberRepoMock.addNew.mockResolvedValue(number);
    userRepoMock.getUserLock.mockResolvedValue(Result.ok({ id: userId }));
    const { caller, transaction } = createCaller();

    const result = await caller.addNew({ number: 42 });

    expect(result).toEqual(number);
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(userRepoMock.getUserLock).toHaveBeenCalledTimes(1);
    expect(numberRepoMock.getCount).toHaveBeenCalledTimes(1);
    expect(numberRepoMock.addNew).toHaveBeenCalledWith(42);
  });

  it("rejects adding more than ten numbers", async () => {
    numberRepoMock.getCount.mockResolvedValue(10);
    userRepoMock.getUserLock.mockResolvedValue(Result.ok({ id: userId }));
    const { caller } = createCaller();

    const result = caller.addNew({ number: 42 });

    await expect(result).rejects.toMatchObject({ cause: expect.any(MaxCountReached) });
    expect(userRepoMock.getUserLock).toHaveBeenCalledTimes(1);
    expect(numberRepoMock.addNew).not.toHaveBeenCalled();
  });

  it("rejects adding a number when the current user is missing", async () => {
    userRepoMock.getUserLock.mockResolvedValue(Result.err(new UserNotFound({ userId })));
    const { caller } = createCaller();

    const result = caller.addNew({ number: 42 });

    await expect(result).rejects.toMatchObject({ cause: expect.any(UserNotFound) });
    expect(numberRepoMock.getCount).not.toHaveBeenCalled();
    expect(numberRepoMock.addNew).not.toHaveBeenCalled();
  });

  it("updates a number", async () => {
    numberRepoMock.update.mockResolvedValue(Result.ok(numberFull));
    const { caller } = createCaller();

    const result = await caller.update({ id: numberId, data: { number: 42 } });

    expect(result).toEqual(numberFullOutput);
    expect(numberRepoMock.update).toHaveBeenCalledWith(numberId, { number: 42 });
  });

  it("deletes a number", async () => {
    numberRepoMock.deleteById.mockResolvedValue(Result.ok({ id: numberId }));
    const { caller } = createCaller();

    const result = await caller.delete({ id: numberId });

    expect(result).toEqual({ id: numberId });
    expect(numberRepoMock.deleteById).toHaveBeenCalledWith(numberId);
  });

  it("deletes all numbers", async () => {
    numberRepoMock.deleteAll.mockResolvedValue();
    const { caller } = createCaller();

    const result = await caller.deleteAll();

    expect(result).toBeNull();
    expect(numberRepoMock.deleteAll).toHaveBeenCalledTimes(1);
  });
});
