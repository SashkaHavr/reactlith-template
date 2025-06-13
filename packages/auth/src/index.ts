import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, magicLink } from 'better-auth/plugins';

import { db } from '@reactlith-template/db';
import { envAuth } from '@reactlith-template/env/auth';

const devMagicLink = envAuth.AUTH_DEV_MAGIC_LINK
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
  trustedOrigins: envAuth.AUTH_TRUSTED_ORIGINS,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  socialProviders: {
    github:
      envAuth.AUTH_GITHUB_CLIENT_ID && envAuth.AUTH_GITHUB_CLIENT_SECRET
        ? {
            clientId: envAuth.AUTH_GITHUB_CLIENT_ID,
            clientSecret: envAuth.AUTH_GITHUB_CLIENT_SECRET,
          }
        : undefined,
  },
  plugins: [...devMagicLink, admin()],
});
