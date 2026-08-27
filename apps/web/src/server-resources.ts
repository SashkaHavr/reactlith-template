import { Effect } from "effect";

import { createAuth } from "@reactlith-template/auth";
import { DrizzlePostgresClient } from "@reactlith-template/db";

const db = Effect.runSync(DrizzlePostgresClient.pipe(Effect.provide(DrizzlePostgresClient.layer)));
const auth = createAuth(db);

export async function dispose() {
  await db.$client.end();
}

export const resources = { db, auth };
