import { Context, Effect, Layer } from "effect";

import type { createAuthClient } from "#client";

export class Auth extends Context.Service<Auth>()("auth/Auth", {
  make: (auth: ReturnType<typeof createAuthClient>) =>
    Effect.succeed({
      getSession: Effect.fn("Auth.getSession")(function* () {
        return yield* Effect.promise(async () => auth.getSession());
      }),
    }),
}) {
  static readonly layer = (auth: ReturnType<typeof createAuthClient>) =>
    Layer.effect(this, this.make(auth));
}
