import { Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/unstable/http";

import { AuthMiddleware, Unauthorized } from "#/middleware/auth";
import type { IdBranded } from "@reactlith-template/db/utils";
import { Auth, CurrentUser, CurrentUserId } from "@reactlith-template/services/auth";
import { DB } from "@reactlith-template/services/db";
import { NumberRepoForUser } from "@reactlith-template/services/repositories/numbers";

export const layerAuthMiddleware = Layer.effect(
  AuthMiddleware,
  Effect.gen(function* () {
    const auth = yield* Auth;
    const db = yield* DB;

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

        const currentUserId = session.user.id as IdBranded<"user">;

        return yield* httpEffect.pipe(
          Effect.provide(NumberRepoForUser.layer),
          Effect.provideService(CurrentUser, session.user),
          Effect.provideService(CurrentUserId, currentUserId),
          Effect.provideService(DB, db),
        );
      });
  }),
);
