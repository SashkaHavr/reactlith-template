import { eq } from "drizzle-orm";
import { Context, Effect, Layer } from "effect";

import { CurrentUser } from "#context";
import { DrizzlePostgresClient, schema } from "@reactlith-template/db";

import { UserNotFound } from "./schema";

export class UserRepo extends Context.Service<UserRepo>()("rpc/UserRepo", {
  make: Effect.gen(function* () {
    const db = yield* DrizzlePostgresClient;

    return {
      getUserLock: Effect.gen(function* () {
        const { userId } = yield* CurrentUser;
        const [user] = yield* Effect.promise(() =>
          db
            .select({ id: schema.user.id })
            .from(schema.user)
            .where(eq(schema.user.id, userId))
            .for("update"),
        );
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
