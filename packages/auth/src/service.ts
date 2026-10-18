import { Context, Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/http";

import { BetterAuth } from "#index";
import type { AuthPermissions } from "#index";

const getHeaders = Effect.fnUntraced(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;
  return new Headers(request.headers);
});

// @effect-expect-leaking HttpServerRequest
export class Auth extends Context.Service<Auth>()("auth/Auth", {
  make: Effect.gen(function* () {
    const auth = yield* BetterAuth;
    return {
      getSession: Effect.fn("Auth.getSession")(function* () {
        const headers = yield* getHeaders();
        return yield* Effect.promise(async () => auth.api.getSession({ headers }));
      }),
      userHasPermission: Effect.fn("Auth.userHasPermission")(function* (
        permissions: AuthPermissions,
      ) {
        const headers = yield* getHeaders();
        return yield* Effect.promise(async () =>
          auth.api.userHasPermission({ headers, body: { permissions } }),
        );
      }),
    };
  }),
}) {
  static readonly layer = Layer.effect(this, this.make);
}
