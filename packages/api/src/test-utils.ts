import { Effect, FileSystem, Layer, Path } from "effect";
import { Etag, HttpPlatform } from "effect/unstable/http";

import { CurrentUser } from "#context";
import { GlobalMiddleware } from "#middleware/global/schema";
import type { AuthType } from "@reactlith-template/auth";
import { Database, schema } from "@reactlith-template/db";
import type { IdBranded, SchemaIdBrands } from "@reactlith-template/db/id-branded";

export function testId<T extends SchemaIdBrands>(id: number) {
  const idString = id.toString();
  return ("00000000-0000-7000-8000-000000000000".slice(0, -idString.length) +
    idString) as IdBranded<T>;
}

export const seedUsers = Effect.gen(function* () {
  const db = yield* Database;
  yield* db.delete(schema.user);
  yield* db.insert(schema.user).values([
    { id: testId<"user">(0), name: "Test User", email: "test@example.com" },
    { id: testId<"user">(1), name: "Other User", email: "other@example.com" },
  ]);
});

export function layerCurrentUser(id?: number) {
  return Layer.succeed(CurrentUser, {
    userId: testId<"user">(id ?? 0),
    session: {} as AuthType["$Infer"]["Session"],
  });
}

export const ClientDependenciesLayerTest = Layer.empty.pipe(
  Layer.provideMerge(Path.layer),
  Layer.provideMerge(Etag.layerWeak),
  Layer.provideMerge(HttpPlatform.layer),
  Layer.provideMerge(FileSystem.layerNoop({})),
  Layer.provideMerge(Layer.succeed(GlobalMiddleware)(GlobalMiddleware.of((effect) => effect))),
);
