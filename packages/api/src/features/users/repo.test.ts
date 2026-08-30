import { layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { expect } from "vitest";

import { seedUsers, userId, layerCurrentUser } from "#test-utils/repo";
import { Database, schema } from "@reactlith-template/db";
import { DatabaseTest } from "@reactlith-template/db/test-db";

import { UserRepo } from "./repo";
import { UserNotFound } from "./schema";

layer(UserRepo.layer.pipe(Layer.provideMerge(DatabaseTest)))("UserRepo", (it) => {
  it.layer(layerCurrentUser())((it) => {
    it.effect("locks and returns the current user", () =>
      Effect.gen(function* () {
        yield* seedUsers;
        const repo = yield* UserRepo;
        expect(yield* repo.getUserLock()).toEqual({ id: userId });
      }),
    );
  });

  it.layer(layerCurrentUser())((it) => {
    it.effect("rejects a missing current user", () =>
      Effect.gen(function* () {
        yield* seedUsers;
        const db = yield* Database;
        yield* db.delete(schema.user);
        const repo = yield* UserRepo;
        const error = yield* Effect.flip(repo.getUserLock());
        expect(error).toBeInstanceOf(UserNotFound);
      }),
    );
  });
});
