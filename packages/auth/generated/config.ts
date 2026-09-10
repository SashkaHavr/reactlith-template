import { Effect } from "effect";

import { BetterAuth } from "#/index";

export const auth = await Effect.runPromise(BetterAuth.pipe(Effect.provide(BetterAuth.layer)));
