import * as SecureStore from 'expo-secure-store';
import { expoClient } from '@better-auth/expo/client';
import {
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '@reactlith-template/auth';

import { env } from './env';

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_API_URL,
  basePath: '/auth',
  plugins: [
    inferAdditionalFields<typeof auth>(),
    emailOTPClient(),
    expoClient({
      scheme: 'reactlith',
      storagePrefix: 'reactlith',
      storage: SecureStore,
    }),
  ],
});
