import { Context, Effect, Layer } from "effect";

import {
  InsufficientPermissions,
  AuthorizationMiddleware,
  RequiredPermissions,
} from "@reactlith-template/api-contract/middleware/permission";
import { Auth } from "@reactlith-template/auth/service";
import { StructuredLogger } from "@reactlith-template/services/structured-logger";

export const AuthorizationMiddlewareLive = Layer.effect(
  AuthorizationMiddleware,
  Effect.gen(function* () {
    const auth = yield* Auth;
    const log = yield* StructuredLogger;

    return AuthorizationMiddleware.of((effect, { rpc, headers }) =>
      Effect.gen(function* () {
        const permissions = Context.get(rpc.annotations, RequiredPermissions);
        const permissionsRequested = Object.entries(permissions).flatMap(
          ([resource, actions]) => actions?.map((action) => `${resource}.${action}`) ?? [],
        );

        yield* log.set({ authorizationMiddleware: { permissionsRequested } });

        if (permissionsRequested.length === 0) {
          return yield* Effect.die("No permissions specified for AuthorizationMiddleware ");
        }

        const hasPermission = yield* auth.userHasPermission(permissions, headers);
        if (!hasPermission.success) {
          return yield* InsufficientPermissions.make();
        }

        return yield* effect;
      }),
    );
  }),
);
