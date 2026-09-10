import { Context, Effect, Layer } from "effect";

import { Auth } from "@reactlith-template/auth/service";
import { StructuredLogger } from "@reactlith-template/services/structured-logger";

import { InsufficientPermissions, AuthorizationMiddleware, RequiredPermissions } from "./schema";

export const AuthorizationMiddlewareLive = Layer.effect(
  AuthorizationMiddleware,
  Effect.gen(function* () {
    const auth = yield* Auth;
    const log = yield* StructuredLogger;

    return AuthorizationMiddleware.of((effect, { endpoint }) =>
      Effect.gen(function* () {
        const permissions = Context.get(endpoint.annotations, RequiredPermissions);
        const permissionsRequested = Object.entries(permissions).flatMap(
          ([resource, actions]) => actions?.map((action) => `${resource}.${action}`) ?? [],
        );

        yield* log.set({ admin: { permissionsRequested } });

        if (permissionsRequested.length === 0) {
          return yield* Effect.die("No permissions specified for AuthorizationMiddleware ");
        }

        const hasPermission = yield* auth.userHasPermission(permissions);
        if (!hasPermission.success) {
          return yield* InsufficientPermissions.make();
        }

        return yield* effect;
      }),
    );
  }),
);
