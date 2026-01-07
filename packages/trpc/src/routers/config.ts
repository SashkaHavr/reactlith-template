import z from "zod";

import { publicProcedure, router } from "#init.ts";
import { envAuth } from "@reactlith-template/env/auth";

export const configRouter = router({
  general: publicProcedure
    .output(
      z.object({
        auth: z.object({ testAuth: z.boolean(), githubOAuth: z.boolean() }),
      }),
    )
    .query(() => {
      return {
        auth: {
          testAuth: envAuth.TEST_AUTH,
          githubOAuth: !!envAuth.GITHUB_CLIENT_ID && !!envAuth.GITHUB_CLIENT_SECRET,
        },
      };
    }),
});
