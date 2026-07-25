import z from "zod";

import { publicProcedure, router } from "#/init";
import { getEnvAuth } from "@reactlith-template/env";

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
          google: !!getEnvAuth().GOOGLE_CLIENT_ID && !!getEnvAuth().GOOGLE_CLIENT_SECRET,
          googleEmulate: !!getEnvAuth().GOOGLE_EMULATE_URL,
        },
      };
    }),
});
