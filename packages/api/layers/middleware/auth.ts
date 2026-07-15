import { Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/unstable/http";

import { AuthMiddleware, CurrentUser, CurrentUserId, Unauthorized } from "#middleware/auth.ts";
import { Auth } from "@reactlith-template/services/auth";

export const layerAuthMiddleware = Layer.effect(
  AuthMiddleware,
  Effect.gen(function* () {
    const auth = yield* Auth;

    return (httpEffect) =>
      Effect.gen(function* () {
        const request = yield* HttpServerRequest.HttpServerRequest.pipe(
          Effect.flatMap((r) => HttpServerRequest.toWeb(r)),
          Effect.orDie,
        );
        const session = yield* auth.getSession(request);

        if (!session) {
          return yield* new Unauthorized();
        }

        return yield* httpEffect.pipe(
          Effect.provideService(CurrentUser, session.user),
          Effect.provideService(CurrentUserId, session.user.id),
        );
      });
  }),
);
