import { PgClient } from "@effect/sql-pg";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Effect, Layer } from "effect";

import { relations } from "@reactlith-template/db";
import { DB, Drizzle } from "@reactlith-template/services/db";

export const pgClient = PgClient.layerFrom(
  Effect.gen(function* () {
    const drizzle = yield* Drizzle;
    return yield* PgClient.fromPool({ acquire: Effect.succeed(drizzle.$client) });
  }),
);

export const layer = Layer.effect(DB, PgDrizzle.make({ relations }));

export const layerWithDefaults = layer.pipe(
  Layer.provide(PgDrizzle.DefaultServices),
  Layer.provide(pgClient),
);

export const DefaultServices = PgDrizzle.DefaultServices;
