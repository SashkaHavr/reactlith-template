import { layer } from "@effect/vitest";
import { Context, Effect, Layer } from "effect";
import { HttpApi, HttpApiTest } from "effect/unstable/httpapi";
import { expect, vi } from "vitest";

import { AuthenticationMiddlewareLive } from "#middleware/authentication/layer";
import { Unauthorized } from "#middleware/authentication/schema";
import { ClientDependenciesLayerTest, testId } from "#test-utils";
import { Auth } from "@reactlith-template/auth/service";
import { Database } from "@reactlith-template/db";

import { UserRepo } from "../users/repo";
import { UserNotFound } from "../users/schema";
import { NumbersApiLive } from "./layer";
import { NumberRepo } from "./repo";
import { MaxCountReached, NumberNotFound, NumbersApi } from "./schema";

const userId = testId("user", 0);
const numberId = testId("number", 0);
const number = { id: numberId, number: 42 };
const numberFull = {
  ...number,
  createdAt: new Date(1_000),
  updatedAt: new Date(2_000),
};

const NumberRepoMock = {
  getCountAbove: vi.fn<typeof NumberRepo.Service.getCountAbove>(),
  getAll: vi.fn<typeof NumberRepo.Service.getAll>(),
  getCount: vi.fn<typeof NumberRepo.Service.getCount>(),
  get: vi.fn<typeof NumberRepo.Service.get>(),
  create: vi.fn<typeof NumberRepo.Service.create>(),
  update: vi.fn<typeof NumberRepo.Service.update>(),
  delete: vi.fn<typeof NumberRepo.Service.delete>(),
  deleteAll: vi.fn<typeof NumberRepo.Service.deleteAll>(),
} satisfies Effect.Success<typeof NumberRepo.make>;

const UserRepoMock = {
  getUserLock: vi.fn<typeof UserRepo.Service.getUserLock>(),
} satisfies Effect.Success<typeof UserRepo.make>;

const DatabaseMock = {
  transaction: vi.fn<(fn: () => Effect.Effect<void>) => Effect.Effect<void>>((f) => f()),
};

class TestApi extends HttpApi.make("api").add(NumbersApi).prefix("/api/rpc") {}

class TestClient extends Context.Service<TestClient>()("api/TestClient", {
  make: HttpApiTest.groups(TestApi, ["numbers"]),
}) {
  static readonly layerTest = Layer.effect(this, this.make).pipe(
    Layer.provide(NumbersApiLive),
    Layer.provide(ClientDependenciesLayerTest),
    Layer.provide(AuthenticationMiddlewareLive),
    Layer.provideMerge(Layer.succeed(NumberRepo)(NumberRepoMock)),
    Layer.provideMerge(Layer.succeed(UserRepo)(UserRepoMock)),
    Layer.provideMerge(Layer.succeed(Database)(DatabaseMock as never)),
  );
}

layer(
  TestClient.layerTest.pipe(
    Layer.provide(
      Layer.succeed(Auth)({
        getSession: () => Effect.succeed(null),
      }),
    ),
  ),
)((it) => {
  it.effect(
    "publicly gets the count of numbers above 50",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.getCountAbove.mockReturnValue(Effect.succeed(3));

      const result = yield* client.numbers.getCountAbove50();

      expect(result).toEqual({ count: 3 });
      expect(NumberRepoMock.getCountAbove).toHaveBeenCalledOnce();
    }),
  );

  it.effect(
    "requires authentication to get all numbers",
    Effect.fn(function* () {
      const client = yield* TestClient;

      const error = yield* client.numbers.getAll().pipe(Effect.flip);

      expect(error).toBeInstanceOf(Unauthorized);
    }),
  );

  it.effect(
    "requires authentication to get a number",
    Effect.fn(function* () {
      const client = yield* TestClient;

      const error = yield* client.numbers.get({ params: { id: numberId } }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(Unauthorized);
    }),
  );

  it.effect(
    "requires authentication to add a number",
    Effect.fn(function* () {
      const client = yield* TestClient;

      const error = yield* client.numbers.create({ payload: { number: 42 } }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(Unauthorized);
    }),
  );

  it.effect(
    "requires authentication to update a number",
    Effect.fn(function* () {
      const client = yield* TestClient;

      const error = yield* client.numbers
        .update({ params: { id: numberId }, payload: { number: 42 } })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(Unauthorized);
    }),
  );

  it.effect(
    "requires authentication to delete a number",
    Effect.fn(function* () {
      const client = yield* TestClient;

      const error = yield* client.numbers.delete({ params: { id: numberId } }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(Unauthorized);
    }),
  );

  it.effect(
    "requires authentication to delete all numbers",
    Effect.fn(function* () {
      const client = yield* TestClient;

      const error = yield* client.numbers.deleteAll().pipe(Effect.flip);

      expect(error).toBeInstanceOf(Unauthorized);
    }),
  );
});

layer(
  TestClient.layerTest.pipe(
    Layer.provide(
      Layer.succeed(Auth)({
        getSession: () =>
          Effect.succeed({ user: { id: userId, role: "user" }, session: {} } as never),
      }),
    ),
  ),
)((it) => {
  it.effect(
    "gets all numbers from the repository",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.getAll.mockReturnValue(Effect.succeed([number]));

      const result = yield* client.numbers.getAll();

      expect(result).toEqual({ numbers: [number] });
      expect(NumberRepoMock.getAll).toHaveBeenCalledOnce();
    }),
  );

  it.effect(
    "gets a number by id",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.get.mockReturnValue(Effect.succeed(numberFull));

      const result = yield* client.numbers.get({ params: { id: numberId } });

      expect(result).toEqual(numberFull);
      expect(NumberRepoMock.get).toHaveBeenCalledOnce();
    }),
  );

  it.effect(
    "returns a not found error when getting a number",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.get.mockReturnValue(Effect.fail(NumberNotFound.make({ numberId })));

      const error = yield* client.numbers.get({ params: { id: numberId } }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(NumberNotFound);
    }),
  );

  it.effect(
    "adds a number within a locked transaction",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.getCount.mockReturnValue(Effect.succeed(9));
      NumberRepoMock.create.mockReturnValue(Effect.succeed(number));
      UserRepoMock.getUserLock.mockReturnValue(Effect.succeed({ id: userId }));

      const result = yield* client.numbers.create({ payload: { number: 42 } });

      expect(result).toEqual(number);
      expect(DatabaseMock.transaction).toHaveBeenCalledOnce();
      expect(NumberRepoMock.create).toHaveBeenCalledOnce();
    }),
  );

  it.effect(
    "rejects adding more than ten numbers",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.getCount.mockReturnValue(Effect.succeed(10));
      UserRepoMock.getUserLock.mockReturnValue(Effect.succeed({ id: userId }));

      const error = yield* client.numbers.create({ payload: { number: 42 } }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(MaxCountReached);
      expect(DatabaseMock.transaction).toHaveBeenCalledOnce();
    }),
  );

  it.effect(
    "returns a user not found error when adding a number",
    Effect.fn(function* () {
      const client = yield* TestClient;
      UserRepoMock.getUserLock.mockReturnValue(Effect.fail(UserNotFound.make({ userId })));

      const error = yield* client.numbers.create({ payload: { number: 42 } }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(UserNotFound);
      expect(DatabaseMock.transaction).toHaveBeenCalledOnce();
    }),
  );

  it.effect(
    "updates a number",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.update.mockReturnValue(Effect.succeed(numberFull));

      const result = yield* client.numbers.update({
        params: { id: numberId },
        payload: { number: 42 },
      });

      expect(result).toEqual(numberFull);
      expect(NumberRepoMock.update).toHaveBeenCalledOnce();
    }),
  );

  it.effect(
    "returns a not found error when updating a number",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.update.mockReturnValue(Effect.fail(NumberNotFound.make({ numberId })));

      const error = yield* client.numbers
        .update({ params: { id: numberId }, payload: { number: 42 } })
        .pipe(Effect.flip);

      expect(error).toBeInstanceOf(NumberNotFound);
    }),
  );

  it.effect(
    "deletes a number",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.delete.mockReturnValue(Effect.succeed({ id: numberId }));

      const result = yield* client.numbers.delete({ params: { id: numberId } });

      expect(result).toEqual({ id: numberId });
      expect(NumberRepoMock.delete).toHaveBeenCalledOnce();
    }),
  );

  it.effect(
    "returns a not found error when deleting a number",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.delete.mockReturnValue(Effect.fail(NumberNotFound.make({ numberId })));

      const error = yield* client.numbers.delete({ params: { id: numberId } }).pipe(Effect.flip);

      expect(error).toBeInstanceOf(NumberNotFound);
    }),
  );

  it.effect(
    "deletes all numbers",
    Effect.fn(function* () {
      const client = yield* TestClient;
      NumberRepoMock.deleteAll.mockReturnValue(Effect.void);

      const result = yield* client.numbers.deleteAll();

      expect(result).toBeNull();
      expect(NumberRepoMock.deleteAll).toHaveBeenCalledOnce();
    }),
  );
});
