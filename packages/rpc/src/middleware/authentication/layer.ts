import { Effect, Layer } from "effect";

import { CurrentUser, RpcLogger } from "#context";
import { BetterAuthServerClient } from "@reactlith-template/auth";
import type { IdBranded } from "@reactlith-template/db/id-branded";
import { identifyUser } from "@reactlith-template/utils/log";

import { AuthenticationMiddleware, Unauthorized } from "./schema";

export const AuthenticationMiddlewareLive = Layer.effect(
  AuthenticationMiddleware,
  Effect.gen(function* () {
    const auth = yield* BetterAuthServerClient;

    return AuthenticationMiddleware.of((effect, options) =>
      Effect.gen(function* () {
        const log = yield* RpcLogger;
        const session = yield* Effect.promise(async () =>
          auth.api.getSession({ headers: new Headers(options.headers) }),
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
