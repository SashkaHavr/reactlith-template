import { Effect, Layer } from "effect";
import { HttpServerRequest } from "effect/unstable/http";

import { ApiLogger, CurrentUser } from "#context";
import { BetterAuthServerClient } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { identifyUser } from "@reactlith-template/utils/log";

import { AuthenticationMiddleware, Unauthorized } from "./schema";

export const AuthenticationMiddlewareLive = Layer.effect(
  AuthenticationMiddleware,
  Effect.gen(function* () {
    const auth = yield* BetterAuthServerClient;

    return AuthenticationMiddleware.of((effect) =>
      Effect.gen(function* () {
        const log = yield* ApiLogger.get;
        const request = yield* HttpServerRequest.HttpServerRequest;
        const session = yield* Effect.promise(async () =>
          auth.api.getSession({ headers: new Headers(request.headers) }),
        );
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
