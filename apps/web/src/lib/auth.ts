import {
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '@reactlith-template/auth';

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  basePath: import.meta.env.VITE_API_REVERSE_PROXY_PATH + '/auth',
  plugins: [inferAdditionalFields<typeof auth>(), emailOTPClient()],
});
