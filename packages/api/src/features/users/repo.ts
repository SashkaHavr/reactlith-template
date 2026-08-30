import { eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";

import { CurrentUser } from "#context";
import { Database, schema } from "@reactlith-template/db";

import { UserNotFound } from "./schema";

export class UserRepo extends Context.Service<UserRepo>()("api/UserRepo", {
  make: Effect.gen(function* () {
    const db = yield* Database;

    return {
      getUserLock: Effect.fnUntraced(function* () {
        const { userId } = yield* CurrentUser;
        const [user] = yield* db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(schema.user.id, userId))
          .for("update")
          .pipe(Effect.orDie);
        if (!user) {
          return yield* new UserNotFound({ userId });
        }
        return user;
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
