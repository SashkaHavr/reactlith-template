import { sql } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api, DatabaseConnectionError } from "#index.ts";
import { DB } from "@reactlith-template/services/db";

import { layerAuthMiddleware } from "./middleware/auth";
import { NumbersApiHandlers } from "./numbers";

const IndexApiHandlers = HttpApiBuilder.group(Api, "index", (handlers) =>
  Effect.gen(function* () {
    const db = yield* DB;

    return handlers.handle("health", () =>
      Effect.gen(function* () {
        yield* db.execute(sql`select 1`).pipe(
          Effect.asVoid,
          Effect.mapError(() => new DatabaseConnectionError()),
        );
        return "healthy" as const;
      }),
    );
  }),
);

export const layer = HttpApiBuilder.layer(Api).pipe(
  Layer.provide([IndexApiHandlers, NumbersApiHandlers]),
  Layer.provide(layerAuthMiddleware),
);
