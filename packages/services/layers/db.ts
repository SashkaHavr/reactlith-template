import { PgClient } from "@effect/sql-pg";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Effect, Layer } from "effect";

import { DB } from "#db.ts";
import { relations } from "@reactlith-template/db";
import type { DBType } from "@reactlith-template/db";

export function pgClientLayerFromDrizzle(drizzle: DBType) {
  return PgClient.layerFrom(
    Effect.gen(function* () {
      return yield* PgClient.fromPool({ acquire: Effect.succeed(drizzle.$client) });
    }),
  );
}

export const layer = Layer.effect(DB, PgDrizzle.make({ relations }));

export const layerWithDefaults = layer.pipe(Layer.provide(PgDrizzle.DefaultServices));
