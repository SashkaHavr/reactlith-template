import { Effect, Option } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api } from "#client";
import { AuthConfig } from "@reactlith-template/config/auth";

export const ConfigApiLive = HttpApiBuilder.group(
  Api,
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
