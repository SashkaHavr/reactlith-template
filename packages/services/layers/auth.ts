import { Effect, Layer } from "effect";

import { Auth } from "#auth.ts";
import type { AuthType } from "@reactlith-template/auth";

export function layerFromBetterAuth(betterAuth: AuthType["api"]) {
  return Layer.effect(
    Auth,
    Effect.gen(function* () {
      const getSession = Effect.fn("Auth.getSession")(function* (request: Request) {
        return yield* Effect.promise(async () =>
          betterAuth.getSession({ headers: request.headers }),
        );
      });

      return Auth.of({
        getSession,
      });
    }),
  );
}
