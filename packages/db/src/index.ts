import { PgClient } from "@effect/sql-pg";
import { sql } from "drizzle-orm";
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

export const PgClientLive = PgClient.layerFrom(
  Effect.gen(function* () {
    const db = yield* DrizzlePostgres;
    return yield* PgClient.fromPool({ acquire: Effect.succeed(db.$client) });
  }),
);

export class Database extends Context.Service<Database>()("db/Database", {
  make: PgDrizzle.makeWithDefaults({ relations }),
}) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(PgClientLive),
    Layer.provide(DrizzlePostgres.layer),
  );
  static readonly layerWithoutDependencies = Layer.effect(this, this.make);
}

export async function healthcheckDB(db: DrizzlePostgres["Service"]) {
  await db.execute(sql`select 1`);
}

export { relations, schema };
