import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Context } from "#/context";
import type { numberRepo } from "#/routers/numbers/repo";
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

import { numbersRouter } from "./router";

const numberId = "00000000-0000-7000-8000-000000000001" as IdBranded<"number">;
const userId = "00000000-0000-7000-8000-000000000002" as IdBranded<"user">;
const number = { id: numberId, number: 42 };

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
    request: new Request("http://localhost/trpc"),
  } as unknown as Context);

  return { caller, getSession, transaction };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("numbersRouter", () => {
  it("requires authentication", async () => {
    const { caller } = createCaller({ authenticated: false });

    await expect(caller.getAll()).rejects.toThrow("You must authenticate to use this endpoint");
    expect(numberRepoMock.getAll).not.toHaveBeenCalled();
  });

  it("gets all numbers from the repository", async () => {
    numberRepoMock.getAll.mockResolvedValue([number]);

    await expect(createCaller().caller.getAll()).resolves.toEqual({ numbers: [number] });
    expect(numberRepoMock.getAll).toHaveBeenCalledOnce();
  });

  it("gets a number by id", async () => {
    numberRepoMock.getById.mockResolvedValue(number);

    await expect(createCaller().caller.getById({ id: numberId })).resolves.toEqual(number);
    expect(numberRepoMock.getById).toHaveBeenCalledWith(numberId);
  });

  it("adds a number within a locked transaction", async () => {
    numberRepoMock.getCount.mockResolvedValue(9);
    numberRepoMock.addNew.mockResolvedValue(number);
    const { caller, transaction } = createCaller();

    await expect(caller.addNew({ number: 42 })).resolves.toEqual(number);
    expect(transaction).toHaveBeenCalledOnce();
    expect(userRepoMock.getUserLock).toHaveBeenCalledOnce();
    expect(numberRepoMock.getCount).toHaveBeenCalledOnce();
    expect(numberRepoMock.addNew).toHaveBeenCalledWith(42);
  });

  it("rejects adding more than ten numbers", async () => {
    numberRepoMock.getCount.mockResolvedValue(10);

    await expect(createCaller().caller.addNew({ number: 42 })).rejects.toThrow(
      "Max numbers count is 10",
    );
    expect(userRepoMock.getUserLock).toHaveBeenCalledOnce();
    expect(numberRepoMock.addNew).not.toHaveBeenCalled();
  });

  it("updates a number", async () => {
    numberRepoMock.update.mockResolvedValue(number);

    await expect(
      createCaller().caller.update({ id: numberId, data: { number: 42 } }),
    ).resolves.toEqual(number);
    expect(numberRepoMock.update).toHaveBeenCalledWith(numberId, { number: 42 });
  });

  it("deletes a number", async () => {
    numberRepoMock.deleteById.mockResolvedValue({ id: numberId });

    await expect(createCaller().caller.delete({ id: numberId })).resolves.toEqual({ id: numberId });
    expect(numberRepoMock.deleteById).toHaveBeenCalledWith(numberId);
  });

  it("deletes all numbers", async () => {
    numberRepoMock.deleteAll.mockResolvedValue(undefined);

    await expect(createCaller().caller.deleteAll()).resolves.toBeUndefined();
    expect(numberRepoMock.deleteAll).toHaveBeenCalledOnce();
  });
});
