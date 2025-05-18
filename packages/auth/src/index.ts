import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';

import { db } from '@reactlith-template/db';
import { envServer } from '@reactlith-template/env/server';

const devMagicLink = envServer.AUTH_DEV_MAGIC_LINK
  ? [
      magicLink({
        sendMagicLink: ({ url }) => {
          console.log(url);
        },
      }),
    ]
  : [];

export const auth = betterAuth({
  basePath: '/auth',
  trustedOrigins: envServer.CORS_ORIGINS,
  advanced: {
    crossSubDomainCookies: {
      enabled: envServer.AUTH_BASE_URL != undefined,
      baseUrl: envServer.AUTH_BASE_URL,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  plugins: [...devMagicLink],
});
