import { publicProcedure, router } from "#init";
import { getEnvAuth } from "@reactlith-template/env";

import { authOutput } from "./schema";

export const configRouter = router({
  auth: publicProcedure.output(authOutput).query(() => {
    return {
      google: !!getEnvAuth().GOOGLE_CLIENT_ID && !!getEnvAuth().GOOGLE_CLIENT_SECRET,
      googleEmulate: !!getEnvAuth().GOOGLE_EMULATE_URL,
    };
  }),
});
