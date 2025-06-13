import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod/v4';

export const authConfig = {
  AUTH_TRUSTED_ORIGINS: z
    .string()
    .optional()
    .transform((s) =>
      s == undefined
        ? ['http://localhost:5173', 'http://localhost:4173']
        : s.split(' '),
    )
    .refine((a) => z.array(z.url()).safeParse(a)),
  AUTH_DEV_OTP: z.stringbool().default(false),
};

export const envAuth = createEnv({
  server: { ...authConfig },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
