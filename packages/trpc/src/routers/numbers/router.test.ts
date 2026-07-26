import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Context } from "#/context";
import type { IdBranded } from "@reactlith-template/db/id-branded";

const repos = vi.hoisted(() => ({
  number: {
    addNew: vi.fn(),
    deleteAll: vi.fn(),
    deleteById: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
    getCount: vi.fn(),
    update: vi.fn(),
  },
  user: {
    getUserLock: vi.fn(),
  },
}));

vi.mock("./repo", () => ({ numberRepo: repos.number }));
vi.mock("#/routers/users/repo", () => ({ userRepo: repos.user }));

import { numbersRouter } from "./router";

const numberId = "00000000-0000-7000-8000-000000000001" as IdBranded<"number">;
const userId = "00000000-0000-7000-8000-000000000002" as IdBranded<"user">;
const number = { id: numberId, number: 42 };

function createCaller({ authenticated = true }: { authenticated?: boolean } = {}) {
  const getSession = vi.fn(async () => (authenticated ? { user: { id: userId } } : null));
  const transaction = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback({}));
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
    expect(repos.number.getAll).not.toHaveBeenCalled();
  });

  it("gets all numbers from the repository", async () => {
    repos.number.getAll.mockResolvedValue([number]);

    await expect(createCaller().caller.getAll()).resolves.toEqual({ numbers: [number] });
    expect(repos.number.getAll).toHaveBeenCalledOnce();
  });

  it("gets a number by id", async () => {
    repos.number.getById.mockResolvedValue(number);

    await expect(createCaller().caller.getById({ id: numberId })).resolves.toEqual(number);
    expect(repos.number.getById).toHaveBeenCalledWith(numberId);
  });

  it("adds a number within a locked transaction", async () => {
    repos.number.getCount.mockResolvedValue(9);
    repos.number.addNew.mockResolvedValue(number);
    const { caller, transaction } = createCaller();

    await expect(caller.addNew({ number: 42 })).resolves.toEqual(number);
    expect(transaction).toHaveBeenCalledOnce();
    expect(repos.user.getUserLock).toHaveBeenCalledOnce();
    expect(repos.number.getCount).toHaveBeenCalledOnce();
    expect(repos.number.addNew).toHaveBeenCalledWith(42);
  });

  it("rejects adding more than ten numbers", async () => {
    repos.number.getCount.mockResolvedValue(10);

    await expect(createCaller().caller.addNew({ number: 42 })).rejects.toThrow(
      "Max numbers count is 10",
    );
    expect(repos.user.getUserLock).toHaveBeenCalledOnce();
    expect(repos.number.addNew).not.toHaveBeenCalled();
  });

  it("updates a number", async () => {
    repos.number.update.mockResolvedValue(number);

    await expect(
      createCaller().caller.update({ id: numberId, data: { number: 42 } }),
    ).resolves.toEqual(number);
    expect(repos.number.update).toHaveBeenCalledWith(numberId, { number: 42 });
  });

  it("deletes a number", async () => {
    repos.number.deleteById.mockResolvedValue({ id: numberId });

    await expect(createCaller().caller.delete({ id: numberId })).resolves.toEqual({ id: numberId });
    expect(repos.number.deleteById).toHaveBeenCalledWith(numberId);
  });

  it("deletes all numbers", async () => {
    repos.number.deleteAll.mockResolvedValue(undefined);

    await expect(createCaller().caller.deleteAll()).resolves.toBeUndefined();
    expect(repos.number.deleteAll).toHaveBeenCalledOnce();
  });
});
