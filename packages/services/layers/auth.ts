import { Context, Effect, Layer } from "effect";

import { Auth } from "#auth.ts";
import { WebRequest } from "#web-request.ts";
import type { AuthType } from "@reactlith-template/auth";

export class BetterAuth extends Context.Service<BetterAuth, AuthType["api"]>()(
  "services/BetterAuth",
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
