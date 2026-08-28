import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Context, Effect, Layer, Redacted } from "effect";

import { DBConfig } from "@reactlith-template/services/db-config";

import { relations, schema } from "./relations";

export class DrizzlePostgresClient extends Context.Service<DrizzlePostgresClient>()(
  "db/DrizzlePostgresClient",
  {
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
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(Layer.provide(DBConfig.layer));
  static readonly layerWithoutDependencies = Layer.effect(this, this.make);
}

export type DBType = Effect.Success<typeof DrizzlePostgresClient.make>;

export async function checkDbReady(db: DBType) {
  await db.execute(sql`select 1`);
}

export { relations, schema };
