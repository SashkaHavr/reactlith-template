import { Context, Effect, Layer } from "effect";
import type { Headers as EffectHeaders } from "effect/http";

import { BetterAuth } from "#/index";
import type { AuthPermissions } from "#/index";

export class Auth extends Context.Service<Auth>()("auth/Auth", {
  make: Effect.gen(function* () {
    const auth = yield* BetterAuth;
    return {
      getSession: Effect.fn("Auth.getSession")(function* (headers: EffectHeaders.Headers) {
        return yield* Effect.promise(async () =>
          auth.api.getSession({ headers: new Headers(headers) }),
        );
      }),
      userHasPermission: Effect.fn("Auth.userHasPermission")(function* (
        permissions: AuthPermissions,
        headers: EffectHeaders.Headers,
      ) {
        return yield* Effect.promise(async () =>
          auth.api.userHasPermission({
            headers: new Headers(headers),
            body: { permissions },
          }),
        );
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
