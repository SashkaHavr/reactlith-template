import z from "zod";

import { publicProcedure, router } from "#init.ts";
import { envAuth } from "@reactlith-template/env/auth";

export const configRouter = router({
  general: publicProcedure
    .output(
      z.object({
        auth: z.object({ google: z.boolean(), googleEmulate: z.boolean() }),
      }),
    )
    .query(() => {
      return {
        auth: {
          google: !!envAuth.GOOGLE_CLIENT_ID && !!envAuth.GOOGLE_CLIENT_SECRET,
          googleEmulate: !!envAuth.GOOGLE_AUTHORIZATION_ENDPOINT || !!envAuth.GOOGLE_TOKEN_ENDPOINT,
        },
      };
    }),
});
