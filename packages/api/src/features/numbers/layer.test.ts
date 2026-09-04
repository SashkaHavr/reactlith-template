import { layer } from "@effect/vitest";
import { Context, Effect, FileSystem, Layer, Path } from "effect";
import { Etag, HttpPlatform } from "effect/unstable/http";
import { HttpApiTest } from "effect/unstable/httpapi";
import { expect, vi } from "vitest";

import { Api } from "#client";
import type { ApiClient } from "#client";
import { AuthenticationMiddlewareLive } from "#middleware/authentication/layer";
import { Unauthorized } from "#middleware/authentication/schema";
import { GlobalMiddlewareLive } from "#middleware/global/layer";
import { Auth } from "@reactlith-template/auth/service";
import { Database } from "@reactlith-template/db";
import type { DatabaseType } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";

import { UserRepo } from "../users/repo";
import { NumbersApiLive } from "./layer";
import { NumberRepo } from "./repo";
import { MaxCountReached } from "./schema";

const numberId = "00000000-0000-7000-8000-000000000001" as IdBranded<"number">;
const userId = "00000000-0000-7000-8000-000000000002" as IdBranded<"user">;
const number = { id: numberId, number: 42 };
const numberFull = {
  ...number,
  createdAt: new Date(1_000),
  updatedAt: new Date(2_000),
};

const TestServices = Layer.mergeAll(Path.layer, Etag.layerWeak, HttpPlatform.layer).pipe(
  Layer.provideMerge(FileSystem.layerNoop({})),
);

class NumbersClient extends Context.Service<NumbersClient, ApiClient>()("api/test/NumbersClient") {
  static readonly layerTest = Layer.effect(
    NumbersClient,
    HttpApiTest.groups(Api, ["numbers"]),
  ).pipe(
    Layer.provide(
      NumbersApiLive.pipe(
        Layer.provideMerge(AuthenticationMiddlewareLive),
        Layer.provideMerge(GlobalMiddlewareLive),
      ),
    ),
    Layer.provide(TestServices),
    Layer.provideMerge(
      Layer.mergeAll(
        Layer.succeed(UserRepo)({
          getUserLock: () => Effect.succeed({ id: userId }),
        }),
        Layer.succeed(Database)({
          transaction: vi.fn<typeof Database.Service.transaction>((f) => f(undefined!)),
        } as unknown as DatabaseType),
      ),
    ),
  );
}

const unusedRepo: Effect.Success<typeof NumberRepo.make> = {
  getCountAbove: () => Effect.die("unexpected getCountAbove"),
  getAll: () => Effect.die("unexpected getAll"),
  getCount: () => Effect.die("unexpected getCount"),
  getById: () => Effect.die("unexpected getById"),
  addNew: () => Effect.die("unexpected addNew"),
  update: () => Effect.die("unexpected update"),
  deleteById: () => Effect.die("unexpected deleteById"),
  deleteAll: () => Effect.die("unexpected deleteAll"),
};

layer(
  Layer.succeed(Auth)({
    getSession: () => Effect.succeed(null),
  }),
)("unauthenticated", (it) => {
  it.layer(
    NumbersClient.layerTest.pipe(
      Layer.provideMerge(
        Layer.succeed(NumberRepo)({
          ...unusedRepo,
          getCountAbove: vi.fn<typeof NumberRepo.Service.getCountAbove>(() => Effect.succeed(3)),
        }),
      ),
    ),
  )((it) => {
    it.effect("publicly gets the count of numbers above 50", () =>
      Effect.gen(function* () {
        const client = yield* NumbersClient;
        const repo = yield* NumberRepo;
        const result = yield* client.numbers.getCountAbove50();
        expect(result).toEqual({ count: 3 });
        expect(repo.getCountAbove).toHaveBeenCalledWith(50);
      }),
    );
  });

  it.layer(NumbersClient.layerTest.pipe(Layer.provide(Layer.succeed(NumberRepo)(unusedRepo))))(
    (it) => {
      it.effect("requires authentication", () =>
        Effect.gen(function* () {
          const client = yield* NumbersClient;
          const error = yield* Effect.flip(client.numbers.getAll());
          expect(error).toBeInstanceOf(Unauthorized);
        }),
      );
    },
  );
});

layer(
  Layer.succeed(Auth)({
    getSession: () => Effect.succeed({ user: { id: userId, role: "user" }, session: {} } as never),
  }),
)("authenticated", (it) => {
  it.layer(
    NumbersClient.layerTest.pipe(
      Layer.provide(
        Layer.succeed(NumberRepo)({ ...unusedRepo, getAll: () => Effect.succeed([number]) }),
      ),
    ),
  )((it) => {
    it.effect("gets all numbers from the repository", () =>
      Effect.gen(function* () {
        const client = yield* NumbersClient;
        expect(yield* client.numbers.getAll()).toEqual({ numbers: [number] });
      }),
    );
  });

  it.layer(
    NumbersClient.layerTest.pipe(
      Layer.provideMerge(
        Layer.succeed(NumberRepo)({
          ...unusedRepo,
          getById: vi.fn<typeof NumberRepo.Service.getById>(() => Effect.succeed(numberFull)),
        }),
      ),
    ),
  )((it) => {
    it.effect("gets a number by id", () =>
      Effect.gen(function* () {
        const client = yield* NumbersClient;
        const repo = yield* NumberRepo;
        expect(yield* client.numbers.getById({ params: { id: numberId } })).toEqual(numberFull);
        expect(repo.getById).toHaveBeenCalledWith(numberId);
      }),
    );
  });

  it.layer(
    NumbersClient.layerTest.pipe(
      Layer.provideMerge(
        Layer.mergeAll(
          Layer.succeed(NumberRepo)({
            ...unusedRepo,
            getCount: () => Effect.succeed(9),
            addNew: vi.fn<typeof NumberRepo.Service.addNew>(() => Effect.succeed(number)),
          }),
          Layer.succeed(UserRepo)({
            getUserLock: () => Effect.succeed({ id: userId }),
          }),
        ),
      ),
    ),
  )((it) => {
    it.effect("adds a number within a locked transaction", () =>
      Effect.gen(function* () {
        const client = yield* NumbersClient;
        const db = yield* Database;
        const repo = yield* NumberRepo;
        expect(yield* client.numbers.addNew({ payload: { number: 42 } })).toEqual(number);
        // oxlint-disable-next-line typescript/unbound-method
        expect(db.transaction).toHaveBeenCalledOnce();
        expect(repo.addNew).toHaveBeenCalledWith(42);
      }),
    );
  });

  it.layer(
    NumbersClient.layerTest.pipe(
      Layer.provide(
        Layer.succeed(NumberRepo)({ ...unusedRepo, getCount: () => Effect.succeed(10) }),
      ),
    ),
  )((it) => {
    it.effect("rejects adding more than ten numbers", () =>
      Effect.gen(function* () {
        const client = yield* NumbersClient;
        const error = yield* Effect.flip(client.numbers.addNew({ payload: { number: 42 } }));
        expect(error).toBeInstanceOf(MaxCountReached);
      }),
    );
  });

  it.layer(
    NumbersClient.layerTest.pipe(
      Layer.provideMerge(
        Layer.succeed(NumberRepo)({
          ...unusedRepo,
          update: vi.fn<typeof NumberRepo.Service.update>(() => Effect.succeed(numberFull)),
          deleteById: vi.fn<typeof NumberRepo.Service.deleteById>(() =>
            Effect.succeed({ id: numberId }),
          ),
          deleteAll: () => Effect.succeed(undefined),
        }),
      ),
    ),
  )((it) => {
    it.effect("updates, deletes, and clears numbers", () =>
      Effect.gen(function* () {
        const client = yield* NumbersClient;
        const repo = yield* NumberRepo;
        expect(
          yield* client.numbers.update({
            params: { id: numberId },
            payload: { number: 42 },
          }),
        ).toEqual(numberFull);
        expect(yield* client.numbers.delete({ params: { id: numberId } })).toEqual({
          id: numberId,
        });
        expect(yield* client.numbers.deleteAll()).toBeNull();
        expect(repo.update).toHaveBeenCalledWith(numberId, { number: 42 });
        expect(repo.deleteById).toHaveBeenCalledWith(numberId);
      }),
    );
  });
});
