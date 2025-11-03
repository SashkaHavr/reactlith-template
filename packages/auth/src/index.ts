import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin } from 'better-auth/plugins';

import { db } from '@reactlith-template/db';
import { envAuth } from '@reactlith-template/env/auth';

import { permissions } from '#permissions.ts';

export const auth = betterAuth({
  basePath: '/auth',
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  socialProviders: {
    github:
      envAuth.GITHUB_CLIENT_ID && envAuth.GITHUB_CLIENT_SECRET
        ? {
            clientId: envAuth.GITHUB_CLIENT_ID,
            clientSecret: envAuth.GITHUB_CLIENT_SECRET,
          }
        : undefined,
  },
  plugins: [
    admin({
      ...permissions,
    }),
  ],
  emailAndPassword: {
    enabled: envAuth.TEST_AUTH,
    disableSignUp: true,
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
});
