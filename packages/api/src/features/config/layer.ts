import { Effect, Layer, Option } from "effect";
import { HttpApiBuilder } from "effect/unstable/httpapi";

import { Api } from "#client";
import { AuthConfig } from "@reactlith-template/config/auth";

import { ConfigRepo } from "./repo";
import { NotReady } from "./schema";

export const ConfigApiLive = HttpApiBuilder.group(
  Api,
  "config",
  Effect.fn(function* (handlers) {
    const config = yield* AuthConfig;
    const repo = yield* ConfigRepo;

    return handlers.handleAll({
      auth: Effect.fnUntraced(function* () {
        return yield* Effect.succeed({
          googleEmulate: Option.isSome(config.googleEmulateUrl),
        });
      }),
      healthLive: Effect.fnUntraced(function* () {
        return yield* Effect.succeed(null);
      }),
      healthReady: Effect.fnUntraced(function* () {
        if (!(yield* repo.healthcheck())) {
          return yield* NotReady.make();
        }
        return null;
      }),
    });
  }),
);

export const ConfigApiLiveWithServices = ConfigApiLive.pipe(Layer.provideMerge(ConfigRepo.layer));
