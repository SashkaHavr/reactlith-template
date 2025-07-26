import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const authConfig = {
  AUTH_DEV_MAGIC_LINK: z.stringbool().default(false),

  AUTH_GITHUB_CLIENT_ID: z.string().optional(),
  AUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
};

export const envAuth = createEnv({
  server: { ...authConfig },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
