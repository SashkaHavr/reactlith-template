import { Effect, Layer } from "effect";

import { CurrentUser } from "#context";
import { Auth } from "@reactlith-template/auth/service";
import { IdBranded } from "@reactlith-template/db/id-branded";
import { StructuredLogger } from "@reactlith-template/services/structured-logger";

import { AuthenticationMiddleware, NotAuthenticated } from "./schema";

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

        yield* log.set({ user: { id: session.user.id, role: session.user.role } });
        return yield* Effect.provideService(effect, CurrentUser, {
          session,
          userId: UserId.make(session.user.id),
        });
      }),
    );
  }),
);
