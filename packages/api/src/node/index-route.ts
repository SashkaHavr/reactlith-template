import { sql } from "drizzle-orm";
import { Effect } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api } from "#/index";
import { DatabaseConnectionError } from "#/index-route";
import { GoogleAuthConfig } from "@reactlith-template/services/config";
import { DB } from "@reactlith-template/services/db";

export const IndexRouteApiHandlers = HttpApiBuilder.group(Api, "indexRoute", (handlers) =>
  Effect.gen(function* () {
    const db = yield* DB;
    const googleAuthConfig = yield* GoogleAuthConfig;

    return handlers
      .handle("health", () =>
        Effect.gen(function* () {
          yield* db.execute(sql`select 1`).pipe(
            Effect.asVoid,
            Effect.mapError(() => new DatabaseConnectionError()),
          );
          return "healthy" as const;
        }),
      )
      .handle("configGeneral", () =>
        Effect.succeed({
          auth: {
            google: true,
            googleEmulate: !!googleAuthConfig.EMULATE_URL,
          },
        }),
      );
  }),
);
