import { Effect, Layer, Option } from "effect";

import { ConfigApi } from "@reactlith-template/api-contract/features/config";
import { AuthConfig } from "@reactlith-template/config/auth";

import { ConfigRepo } from "./repo";

export const ConfigApiLive = ConfigApi.toLayer(
  Effect.gen(function* () {
    const config = yield* AuthConfig;

    return {
      "config.auth": Effect.fnUntraced(function* () {
        return yield* Effect.succeed({
          googleEmulate: Option.isSome(config.googleEmulateUrl),
        });
      }),
    };
  }),
);

export const ConfigApiLiveWithServices = ConfigApiLive.pipe(Layer.provideMerge(ConfigRepo.layer));
