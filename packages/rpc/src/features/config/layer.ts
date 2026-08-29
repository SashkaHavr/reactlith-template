import { Effect, Option } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { AppApi } from "#client";
import { AuthConfig } from "@reactlith-template/config/auth-config";

export const ConfigApiLive = HttpApiBuilder.group(
  AppApi,
  "config",
  Effect.fn(function* (handlers) {
    const config = yield* AuthConfig;

    return handlers.handleAll({
      auth: () =>
        Effect.succeed({
          googleEmulate: Option.isSome(config.googleEmulateUrl),
        }),
    });
  }),
);
