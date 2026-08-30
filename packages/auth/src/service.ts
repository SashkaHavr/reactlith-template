import { Context, Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/unstable/http";

import { BetterAuthServerClient } from "#index";

export class Auth extends Context.Service<Auth>()("auth/Auth", {
  make: Effect.gen(function* () {
    const auth = yield* BetterAuthServerClient;

    return {
      getSession: Effect.fn("Auth.getSession")(function* () {
        const request = yield* HttpServerRequest.toWeb(
          yield* HttpServerRequest.HttpServerRequest,
        ).pipe(Effect.orDie);
        return yield* Effect.promise(async () => auth.api.getSession({ headers: request.headers }));
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
