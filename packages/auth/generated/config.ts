import { Effect } from "effect";

import { createAuth } from "#/index";
import { DrizzlePostgresClient } from "@reactlith-template/db";

const db = Effect.runSync(DrizzlePostgresClient.pipe(Effect.provide(DrizzlePostgresClient.layer)));

export const auth = createAuth(db);
