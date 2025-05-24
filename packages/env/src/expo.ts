import { createEnv } from '@t3-oss/env-core';
import z from 'zod/v4';

export const envExpo = createEnv({
  client: {
    EXPO_PUBLIC_API_URL: z.url().default('http://10.0.2.2:3000'),
  },
  clientPrefix: 'EXPO_PUBLIC',
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
