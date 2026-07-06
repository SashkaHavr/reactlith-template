import { Context, Effect, Layer } from "effect";

import type { AuthType } from "@reactlith-template/auth";
import { Auth } from "@reactlith-template/services/auth";
import { WebRequest } from "@reactlith-template/services/web-request";

export class BetterAuth extends Context.Service<BetterAuth, AuthType["api"]>()(
  "@reactlith-template/better-auth",
) {}

export const layer = Layer.effect(
  Auth,
  Effect.gen(function* () {
    const betterAuth = yield* BetterAuth;

    const getSession = Effect.fn("Auth.getSession")(function* () {
      const request = yield* WebRequest;
      return yield* Effect.promise(async () => betterAuth.getSession({ headers: request.headers }));
    });

    return Auth.of({
      getSession,
    });
  }),
);
