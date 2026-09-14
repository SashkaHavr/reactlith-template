import { PgClient } from "@effect/sql-pg";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { drizzle } from "drizzle-orm/node-postgres";
import { Context, Effect, Layer, Redacted } from "effect";

import { DBConfig } from "@reactlith-template/config/db";

import { relations, schema } from "./relations";

export class DrizzlePostgres extends Context.Service<DrizzlePostgres>()("db/DrizzlePostgres", {
  make: Effect.gen(function* () {
    const config = yield* DBConfig;

    return yield* Effect.acquireRelease(
      Effect.sync(() =>
        drizzle({
          connection: Redacted.value(config.databaseUrl),
          relations: relations,
        }),
      ),
      (db) => Effect.promise(() => db.$client.end()),
    );
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(DBConfig.layer));
  static readonly layerWithoutDependencies = Layer.effect(this, this.make);
}

export class Database extends Context.Service<Database>()("db/Database", {
  make: Effect.gen(function* () {
    const config = yield* DBConfig;
    const pgClient = yield* PgClient.layer({ url: config.databaseUrl }).pipe(Layer.build);
    return yield* PgDrizzle.makeWithDefaults({ relations }).pipe(Effect.provide(pgClient));
  }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(DBConfig.layer));
  static readonly layerWithoutDependencies = Layer.effect(this, this.make);
}

export { relations, schema };
