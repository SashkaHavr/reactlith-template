import { sql } from "drizzle-orm";
import { Effect, Exit, Option } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api } from "#client";
import { AuthConfig } from "@reactlith-template/config/auth";
import { Database } from "@reactlith-template/db";

import { NotReady } from "./schema";

export const ConfigApiLive = HttpApiBuilder.group(
  Api,
  "config",
  Effect.fn(function* (handlers) {
    const config = yield* AuthConfig;
    const db = yield* Database;

    return handlers.handleAll({
      auth: Effect.fnUntraced(function* () {
        return yield* Effect.succeed({
          googleEmulate: Option.isSome(config.googleEmulateUrl),
        });
      }),
      healthLive: Effect.fnUntraced(function* () {
        return yield* Effect.succeed(null);
      }),
      healthReady: Effect.fnUntraced(function* () {
        const dbReady = yield* db.execute(sql`select 1`).pipe(Effect.exit);
        if (Exit.isFailure(dbReady)) {
          return yield* new NotReady();
        }
        return null;
      }),
    });
  }),
);
