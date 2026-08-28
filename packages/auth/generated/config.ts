import { Effect } from "effect";

import { BetterAuthServerClient } from "#/index";

export const auth = Effect.runSync(
  BetterAuthServerClient.pipe(Effect.provide(BetterAuthServerClient.layer)),
);
