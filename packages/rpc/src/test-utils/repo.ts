import { Effect } from "effect";

import { CurrentUser } from "#context";
import type { AuthType } from "@reactlith-template/auth";
import { Database, schema } from "@reactlith-template/db";
import type { IdBranded } from "@reactlith-template/db/id-branded";

export const userId = "00000000-0000-7000-8000-000000000001" as IdBranded<"user">;
export const otherUserId = "00000000-0000-7000-8000-000000000002" as IdBranded<"user">;

export const seedUsers = Effect.gen(function* () {
  const db = yield* Database;
  yield* db.delete(schema.user);
  yield* db.insert(schema.user).values([
    { id: userId, name: "Test User", email: "test@example.com" },
    { id: otherUserId, name: "Other User", email: "other@example.com" },
  ]);
});

export function withUser(id: IdBranded<"user"> = userId) {
  return Effect.provideService(CurrentUser, {
    userId: id,
    session: {} as AuthType["$Infer"]["Session"],
  });
}
