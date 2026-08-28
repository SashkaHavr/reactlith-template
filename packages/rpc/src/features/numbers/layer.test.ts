/* oxlint-disable vitest/no-standalone-expect -- Effect's it.effect wrapper is not recognized. */
import { describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as RpcTest from "effect/unstable/rpc/RpcTest";
import { expect } from "vitest";

import { RpcLogger } from "#context";
import { AuthenticationMiddlewareLive } from "#middleware/authentication/layer";
import { Unauthorized } from "#middleware/authentication/schema";
import { BetterAuthServerClient } from "@reactlith-template/auth";
import type { AuthType } from "@reactlith-template/auth";
import { Database } from "@reactlith-template/db";
import type { DatabaseType } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";

import { UserRepo } from "../users/repo";
import { NumbersRpcsLive } from "./layer";
import { NumberRepo } from "./repo";
import { MaxCountReached, NumbersRpcs } from "./schema";

const numberId = "00000000-0000-7000-8000-000000000001" as IdBranded<"number">;
const userId = "00000000-0000-7000-8000-000000000002" as IdBranded<"user">;
const number = { id: numberId, number: 42 };
const numberFull = {
  ...number,
  createdAt: new Date(1_000),
  updatedAt: new Date(2_000),
};

function makeContext(authenticated: boolean): {
  readonly auth: AuthType;
  readonly db: DatabaseType;
} {
  return {
    auth: {
      api: {
        getSession: async () =>
          authenticated ? { user: { id: userId, role: "user" }, session: {} } : null,
      },
    } as AuthType,
    db: {
      transaction: (callback: () => Effect.Effect<unknown>) => callback(),
    } as unknown as DatabaseType,
  };
}

function makeClient(options: {
  readonly authenticated?: boolean;
  readonly numberRepo: Effect.Success<typeof NumberRepo.make>;
  readonly userRepo?: Effect.Success<typeof UserRepo.make>;
}) {
  const userRepo: Effect.Success<typeof UserRepo.make> =
    options.userRepo ??
    ({
      getUserLock: Effect.succeed({ id: userId }),
    } satisfies Effect.Success<typeof UserRepo.make>);
  const dependencies = Layer.mergeAll(
    Layer.succeed(NumberRepo)(options.numberRepo),
    Layer.succeed(UserRepo)(userRepo),
    Layer.succeed(BetterAuthServerClient)(makeContext(options.authenticated ?? true).auth),
    Layer.succeed(Database)(makeContext(options.authenticated ?? true).db),
    Layer.succeed(RpcLogger)(undefined),
  );
  const handlers = Layer.mergeAll(NumbersRpcsLive, AuthenticationMiddlewareLive).pipe(
    Layer.provide(dependencies),
  );

  return RpcTest.makeClient(NumbersRpcs).pipe(Effect.provide(handlers));
}

const unusedRepo: Effect.Success<typeof NumberRepo.make> = {
  getCountAbove: () => Effect.die("unexpected getCountAbove"),
  getAll: Effect.die("unexpected getAll"),
  getCount: Effect.die("unexpected getCount"),
  getById: () => Effect.die("unexpected getById"),
  addNew: () => Effect.die("unexpected addNew"),
  update: () => Effect.die("unexpected update"),
  deleteById: () => Effect.die("unexpected deleteById"),
  deleteAll: Effect.die("unexpected deleteAll"),
};

describe("NumbersRpcs", () => {
  it.effect("publicly gets the count of numbers above 50", () =>
    Effect.gen(function* () {
      let threshold: number | undefined;
      const client = yield* makeClient({
        authenticated: false,
        numberRepo: {
          ...unusedRepo,
          getCountAbove: (value) => Effect.sync(() => ((threshold = value), 3)),
        },
      });

      const result = yield* client["numbers.getCountAbove50"]();
      expect(result).toEqual({ count: 3 });
      expect(threshold).toBe(50);
    }),
  );

  it.effect("requires authentication", () =>
    Effect.gen(function* () {
      const client = yield* makeClient({ authenticated: false, numberRepo: unusedRepo });
      const error = yield* Effect.flip(client["numbers.getAll"]());
      expect(error).toBeInstanceOf(Unauthorized);
    }),
  );

  it.effect("gets all numbers from the repository", () =>
    Effect.gen(function* () {
      const client = yield* makeClient({
        numberRepo: { ...unusedRepo, getAll: Effect.succeed([number]) },
      });
      expect(yield* client["numbers.getAll"]()).toEqual({ numbers: [number] });
    }),
  );

  it.effect("gets a number by id", () =>
    Effect.gen(function* () {
      const client = yield* makeClient({
        numberRepo: { ...unusedRepo, getById: () => Effect.succeed(numberFull) },
      });
      expect(yield* client["numbers.getById"]({ id: numberId })).toEqual(numberFull);
    }),
  );

  it.effect("adds a number within a locked transaction", () =>
    Effect.gen(function* () {
      let locked = false;
      const client = yield* makeClient({
        numberRepo: {
          ...unusedRepo,
          getCount: Effect.succeed(9),
          addNew: () => Effect.succeed(number),
        },
        userRepo: {
          getUserLock: Effect.sync(() => ((locked = true), { id: userId })),
        },
      });
      expect(yield* client["numbers.addNew"]({ number: 42 })).toEqual(number);
      expect(locked).toBe(true);
    }),
  );

  it.effect("rejects adding more than ten numbers", () =>
    Effect.gen(function* () {
      const client = yield* makeClient({
        numberRepo: { ...unusedRepo, getCount: Effect.succeed(10) },
      });
      const error = yield* Effect.flip(client["numbers.addNew"]({ number: 42 }));
      expect(error).toBeInstanceOf(MaxCountReached);
    }),
  );

  it.effect("updates, deletes, and clears numbers", () =>
    Effect.gen(function* () {
      let cleared = false;
      const client = yield* makeClient({
        numberRepo: {
          ...unusedRepo,
          update: () => Effect.succeed(numberFull),
          deleteById: () => Effect.succeed({ id: numberId }),
          deleteAll: Effect.sync(() => void (cleared = true)),
        },
      });
      expect(yield* client["numbers.update"]({ id: numberId, data: { number: 42 } })).toEqual(
        numberFull,
      );
      expect(yield* client["numbers.delete"]({ id: numberId })).toEqual({ id: numberId });
      expect(yield* client["numbers.deleteAll"]()).toBeNull();
      expect(cleared).toBe(true);
    }),
  );
});
