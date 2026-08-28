import { Effect, Option, Redacted } from "effect";

import { publicProcedure, router } from "#init";
import { AuthConfig } from "@reactlith-template/config/auth-config";

import { authOutput } from "./schema";

export const configRouter = router({
  auth: publicProcedure.output(authOutput).query(() => {
    const config = Effect.runSync(AuthConfig.make);

    return {
      google: !!config.googleClientId && !!Redacted.value(config.googleClientSecret),
      googleEmulate: Option.isSome(config.googleEmulateUrl),
    };
  }),
});
