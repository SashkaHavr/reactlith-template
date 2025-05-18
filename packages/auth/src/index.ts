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

console.log(envServer.CORS_ORIGINS);

export const auth = betterAuth({
  basePath: '/auth',
  trustedOrigins: envServer.CORS_ORIGINS,
  baseURL: envServer.AUTH_BASE_URL,
  advanced: {
    crossSubDomainCookies: {
      enabled: envServer.AUTH_BASE_URL != undefined,
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
