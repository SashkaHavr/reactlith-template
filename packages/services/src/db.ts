import type { EffectPgDatabase } from "drizzle-orm/effect-postgres";
import { Context } from "effect";

import type { relations } from "@reactlith-template/db";

export class DB extends Context.Service<DB, EffectPgDatabase<typeof relations>>()(
  "@reactlith-template/db",
) {}
