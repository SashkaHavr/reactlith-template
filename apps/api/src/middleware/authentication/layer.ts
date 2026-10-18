import { Effect, Layer } from "effect";

import { CurrentUser } from "@reactlith-template/api-contract/context";
import {
  AuthenticationMiddleware,
  NotAuthenticated,
} from "@reactlith-template/api-contract/middleware/authentication";
import { Auth } from "@reactlith-template/auth/service";
import { IdBranded } from "@reactlith-template/db/id-branded";
import { StructuredLogger } from "@reactlith-template/services/structured-logger";

const UserId = IdBranded("user");

export const AuthenticationMiddlewareLive = Layer.effect(
  AuthenticationMiddleware,
  Effect.gen(function* () {
    const auth = yield* Auth;
    const log = yield* StructuredLogger;

    return AuthenticationMiddleware.of((effect) =>
      Effect.gen(function* () {
        const session = yield* auth.getSession();
        if (!session) {
          return yield* NotAuthenticated.make();
        }

        yield* log.set({ user: { id: session.user.id, roles: session.user.role } });
        return yield* Effect.provideService(effect, CurrentUser, {
          session,
          userId: UserId.make(session.user.id),
        });
      }),
    );
  }),
);
