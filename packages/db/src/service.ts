import { PgClient } from "@effect/sql-pg";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Context, Effect } from "effect";

import type { DBType } from "#index.ts";
import { relations } from "#relations.ts";

export class Drizzle extends Context.Service<Drizzle, DBType>()("@reactlith-template/drizzle") {}

export const PgClientLive = PgClient.layerFrom(
  Effect.gen(function* () {
    const drizzle = yield* Drizzle;
    return yield* PgClient.fromPool({ acquire: Effect.succeed(drizzle.$client) });
  }),
);

export const DB = PgDrizzle.make({ relations });

export const PgDrizzleDefaultServices = PgDrizzle.DefaultServices;
