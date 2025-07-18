import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

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

  AUTH_DEV_MAGIC_LINK: z.stringbool().default(false),

  AUTH_GITHUB_CLIENT_ID: z.string().optional(),
  AUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
};

export const envAuth = createEnv({
  server: { ...authConfig },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
