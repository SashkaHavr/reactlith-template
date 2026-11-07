import { Effect, Option } from "effect";
import { HttpApiBuilder } from "effect/http-api";

import { Api } from "@reactlith-template/api-contract";
import { AuthConfig } from "@reactlith-template/config/auth";

export const ConfigApiLive = HttpApiBuilder.group(
  Api,
  "config",
  Effect.fn(function* (handlers) {
    const config = yield* AuthConfig;

    return handlers.handleAll({
      auth: Effect.fnUntraced(function* () {
        return yield* Effect.succeed({
          googleEmulate: Option.isSome(config.googleEmulateUrl),
        });
      }),
    });
  }),
);
