import { envServer } from '@reactlith-template/env/server';

import { publicProcedure, router } from '#init.ts';

export const configRouter = router({
  authConfig: publicProcedure.query(() => {
    return {
      devOTP: envServer.AUTH_DEV_OTP,
    };
  }),
});
