import { Effect, Option } from "effect";

import { AuthConfig } from "@reactlith-template/config/auth-config";

import { ConfigRpcs } from "./schema";

export const ConfigRpcsLive = ConfigRpcs.toLayer(
  Effect.gen(function* () {
    const config = yield* AuthConfig;

    return ConfigRpcs.of({
      "config.auth": () =>
        Effect.sync(() => ({
          googleEmulate: Option.isSome(config.googleEmulateUrl),
        })),
    });
  }),
);
