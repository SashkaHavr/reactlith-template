import { Effect, FileSystem, Layer, Path, References } from "effect";
import { Etag, HttpPlatform } from "effect/unstable/http";

import { CurrentUser } from "#context";
import { GlobalMiddleware } from "#middleware/global/schema";
import type { SessionType } from "@reactlith-template/auth";
import { Auth } from "@reactlith-template/auth/service";
import { Database, schema } from "@reactlith-template/db";
import { IdBranded } from "@reactlith-template/db/id-branded";
import type { SchemaIdBrands } from "@reactlith-template/db/id-branded";
import { StructuredLogger } from "@reactlith-template/services/structured-logger";

export function testId<T extends SchemaIdBrands>(schema: T, id: number) {
  const idString = id.toString();
  return IdBranded(schema).make(
    "00000000-0000-7000-8000-000000000000".slice(0, -idString.length) + idString,
  );
}

export const seedUsers = Effect.gen(function* () {
  const db = yield* Database;
  yield* db.delete(schema.user);
  yield* db.insert(schema.user).values([
    { id: testId("user", 0), name: "Test User", email: "test@example.com" },
    { id: testId("user", 1), name: "Other User", email: "other@example.com" },
  ]);
});

export function layerCurrentUser(id?: number) {
  return Layer.succeed(CurrentUser, {
    userId: testId("user", id ?? 0),
    session: {} as SessionType,
  });
}

export function layerAuth(id?: number) {
  return Layer.succeed(Auth)({
    getSession: () =>
      Effect.succeed(id !== undefined ? { user: { id: testId("user", id) } } : null),
  } as unknown as Auth["Service"]);
}

export const ClientDependenciesLayerTest = Layer.empty.pipe(
  Layer.provideMerge(Path.layer),
  Layer.provideMerge(Etag.layerWeak),
  Layer.provideMerge(HttpPlatform.layer),
  Layer.provideMerge(FileSystem.layerNoop({})),
  Layer.provideMerge(Layer.succeed(GlobalMiddleware)(GlobalMiddleware.of((effect) => effect))),
  Layer.provideMerge(StructuredLogger.layer),
  Layer.provide(Layer.succeed(References.MinimumLogLevel, "None")),
);
