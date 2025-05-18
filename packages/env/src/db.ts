import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod/v4';

export const dbConfig = {
  DATABASE_URL: z.string(),
  DATABASE_SSL: z.stringbool().default(false),
};

export const envDB = createEnv({
  server: { ...dbConfig },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
