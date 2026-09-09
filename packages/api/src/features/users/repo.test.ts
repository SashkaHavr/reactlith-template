import { layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { expect } from "vitest";

import { layerCurrentUser, seedUsers, testId } from "#test-utils";
import { DatabaseTest } from "@reactlith-template/db/test-db";

import { UserRepo } from "./repo";

layer(
  UserRepo.layer.pipe(Layer.provideMerge(DatabaseTest), Layer.provideMerge(layerCurrentUser())),
)((it) => {
  it.effect(
    "locks and returns the current user",
    Effect.fn(function* () {
      yield* seedUsers;
      const repo = yield* UserRepo;

      const result = yield* repo.getUserLock();

      expect(result).toEqual({ id: testId("user", 0) });
    }),
  );
});
