import { layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { expect } from "vitest";

import { DatabaseTest } from "@reactlith-template/db/test-db";

import { ConfigRepo } from "./repo";

layer(ConfigRepo.layer.pipe(Layer.provideMerge(DatabaseTest)))("ConfigRepo", (it) => {
  it.effect(
    "checks the database health",
    Effect.fn(function* () {
      const repo = yield* ConfigRepo;

      const result = yield* repo.healthcheck();

      expect(result).toBe(true);
    }),
  );
});
