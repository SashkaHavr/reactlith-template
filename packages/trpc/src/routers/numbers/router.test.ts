import { Result } from "better-result";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Context } from "#/context";
import type { numberRepo } from "#/routers/numbers/repo";
import { UserNotFound } from "#/routers/users/errors";
import type { userRepo } from "#/routers/users/repo";
import type { IdBranded } from "@reactlith-template/db/id-branded";

const numberRepoMock = vi.hoisted(() => ({
  addNew: vi.fn<typeof numberRepo.addNew>(),
  deleteAll: vi.fn<typeof numberRepo.deleteAll>(),
  deleteById: vi.fn<typeof numberRepo.deleteById>(),
  getAll: vi.fn<typeof numberRepo.getAll>(),
  getById: vi.fn<typeof numberRepo.getById>(),
  getCount: vi.fn<typeof numberRepo.getCount>(),
  update: vi.fn<typeof numberRepo.update>(),
}));
const userRepoMock = vi.hoisted(() => ({
  getUserLock: vi.fn<typeof userRepo.getUserLock>(),
}));

vi.mock("./repo", () => ({ numberRepo: numberRepoMock }));
vi.mock("#/routers/users/repo", () => ({ userRepo: userRepoMock }));

import { ProtectedProcedureUnauthorized } from "../../procedures/protected-procedure";
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
  const getSession = vi.fn<() => Promise<{ user: { id: typeof userId } } | null>>(async () =>
    authenticated ? { user: { id: userId } } : null,
  );
  const transaction = vi.fn<(callback: (tx: unknown) => Promise<unknown>) => Promise<unknown>>(
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
  vi.resetAllMocks();
});

describe("numbersRouter", () => {
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
    expect(numberRepoMock.getAll).toHaveBeenCalledOnce();
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
    expect(transaction).toHaveBeenCalledOnce();
    expect(userRepoMock.getUserLock).toHaveBeenCalledOnce();
    expect(numberRepoMock.getCount).toHaveBeenCalledOnce();
    expect(numberRepoMock.addNew).toHaveBeenCalledWith(42);
  });

  it("rejects adding more than ten numbers", async () => {
    numberRepoMock.getCount.mockResolvedValue(10);
    userRepoMock.getUserLock.mockResolvedValue(Result.ok({ id: userId }));
    const { caller } = createCaller();

    const result = caller.addNew({ number: 42 });

    await expect(result).rejects.toMatchObject({ cause: expect.any(MaxCountReached) });
    expect(userRepoMock.getUserLock).toHaveBeenCalledOnce();
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
    expect(numberRepoMock.deleteAll).toHaveBeenCalledOnce();
  });
});
