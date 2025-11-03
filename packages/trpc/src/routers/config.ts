import z from 'zod';

import { envServer } from '@reactlith-template/env/server';

import { publicProcedure, router } from '#init.ts';

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
          testAuth: envServer.TEST_AUTH,
          githubOAuth:
            !!envServer.GITHUB_CLIENT_ID && !!envServer.GITHUB_CLIENT_SECRET,
        },
      };
    }),
});
