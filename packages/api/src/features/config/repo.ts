import { sql } from "drizzle-orm";
import { Context, Effect, Exit, Layer } from "effect";

import { Database } from "@reactlith-template/db";

export class ConfigRepo extends Context.Service<ConfigRepo>()("api/ConfigRepo", {
  make: Effect.gen(function* () {
    const db = yield* Database;

    return {
      healthcheck: Effect.fnUntraced(function* () {
        const result = yield* db.execute(sql`select 1`).pipe(Effect.exit);
        return Exit.isSuccess(result);
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
