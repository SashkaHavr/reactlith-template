import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod/v4';

import { authConfig } from './auth';
import { dbConfig } from './db';

export const envServer = createEnv({
  server: {
    ...dbConfig,
    ...authConfig,

    CORS_ORIGINS: z
      .string()
      .optional()
      .transform((s) =>
        s == undefined
          ? ['http://localhost:5173', 'http://localhost:4173']
          : s.split(' '),
      )
      .refine((a) => z.array(z.url()).safeParse(a)),
    NODE_ENV: z.enum(['development', 'production']),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
