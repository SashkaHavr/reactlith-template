import { Effect } from "effect";

import { BetterAuthServerClient } from "#/index";

export const auth = await Effect.runPromise(
  BetterAuthServerClient.pipe(Effect.provide(BetterAuthServerClient.layer)),
);
