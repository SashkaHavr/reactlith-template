import { afterAll, beforeAll, beforeEach } from "@effect/vitest";
import { Effect } from "effect";

import { CurrentUser } from "#context";
import type { AuthType } from "@reactlith-template/auth";
import { DrizzlePostgresClient, schema } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { createTestDB } from "@reactlith-template/db/test-db";

export function setupRepoTest() {
  let db: Awaited<ReturnType<typeof createTestDB>>;
  let userId: IdBranded<"user">;
  let otherUserId: IdBranded<"user">;

  beforeAll(async () => {
    db = await createTestDB();
  });

  beforeEach(async () => {
    await db.delete(schema.user);
    const users = await db
      .insert(schema.user)
      .values([
        { name: "Test User", email: "test@example.com" },
        { name: "Other User", email: "other@example.com" },
      ])
      .returning({ id: schema.user.id });
    if (!users[0] || !users[1]) {
      throw new Error("Failed to seed users");
    }
    userId = users[0].id;
    otherUserId = users[1].id;
  });

  afterAll(async () => {
    await db.$client.close();
  });

  return {
    get db() {
      return db;
    },
    get userId() {
      return userId;
    },
    get otherUserId() {
      return otherUserId;
    },
    provideUser<A, E, R>(id: IdBranded<"user">, effect: Effect.Effect<A, E, R>) {
      return effect.pipe(
        Effect.provideService(CurrentUser, {
          userId: id,
          session: {} as AuthType["$Infer"]["Session"],
        }),
        Effect.provideService(DrizzlePostgresClient, db),
      );
    },
  };
}
