import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '@reactlith-template/db';
import { envServer } from '@reactlith-template/env/server';

export const auth = betterAuth({
  basePath: '/auth',
  trustedOrigins: envServer.CORS_ORIGINS,
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
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
});
