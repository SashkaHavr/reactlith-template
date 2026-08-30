import { Effect, Layer } from "effect";

import { ApiLogger, CurrentUser } from "#context";
import { Auth } from "@reactlith-template/auth/service";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { identifyUser } from "@reactlith-template/utils/log";

import { AuthenticationMiddleware, Unauthorized } from "./schema";

export const AuthenticationMiddlewareLive = Layer.effect(
  AuthenticationMiddleware,
  Effect.gen(function* () {
    const auth = yield* Auth;

    return AuthenticationMiddleware.of((effect) =>
      Effect.gen(function* () {
        const log = yield* ApiLogger.get;
        const session = yield* auth.getSession();
        if (!session) {
          return yield* new Unauthorized();
        }

        identifyUser(log, session);
        return yield* Effect.provideService(effect, CurrentUser, {
          session,
          userId: session.user.id as IdBranded<"user">,
        });
      }),
    );
  }),
);
