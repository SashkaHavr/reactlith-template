import {
  emailOTPClient,
  inferAdditionalFields,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '@reactlith-template/auth';

const authPath = '/auth';

export const authClient = createAuthClient({
  baseURL:
    import.meta.env.VITE_API_REVERSE_PROXY_PATH == undefined
      ? import.meta.env.VITE_API_URL
      : undefined,
  basePath:
    import.meta.env.VITE_API_REVERSE_PROXY_PATH == undefined
      ? authPath
      : import.meta.env.VITE_API_REVERSE_PROXY_PATH + authPath,
  plugins: [inferAdditionalFields<typeof auth>(), emailOTPClient()],
});
