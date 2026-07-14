import { PgClient } from "@effect/sql-pg";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Context, Effect, Layer } from "effect";

import { DB } from "#db.ts";
import { relations } from "@reactlith-template/db";
import type { DBType } from "@reactlith-template/db";

export class Drizzle extends Context.Service<Drizzle, DBType>()("@reactlith-template/drizzle") {}

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
