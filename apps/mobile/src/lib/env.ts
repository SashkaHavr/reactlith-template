import { createEnv } from '@t3-oss/env-core';
import z from 'zod/v4';

export const env = createEnv({
  client: {
    EXPO_PUBLIC_API_URL: z.url().default('http://10.0.2.2:3000'),
  },
  clientPrefix: 'EXPO_PUBLIC',
  emptyStringAsUndefined: true,
  runtimeEnvStrict: {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_URL,
  },
});
