import { Context, Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/unstable/http";

import type { createAuthClient } from "#client";

export class Auth extends Context.Service<Auth>()("auth/Auth", {
  make: Effect.gen(function* () {
    const auth = yield* BetterAuthClient;

    return {
      getSession: Effect.fn("Auth.getSession")(function* () {
        const request = yield* HttpServerRequest.toWeb(
          yield* HttpServerRequest.HttpServerRequest,
        ).pipe(Effect.orDie);
        return yield* Effect.promise(async () =>
          auth.getSession({ fetchOptions: { headers: request.headers } }),
        );
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}

export class BetterAuthClient extends Context.Service<
  BetterAuthClient,
  ReturnType<typeof createAuthClient>
>()("auth/BetterAuthClient") {}
