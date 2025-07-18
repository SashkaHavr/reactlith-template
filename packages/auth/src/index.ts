import { betterAuth, BetterAuthError } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, magicLink } from 'better-auth/plugins';

import { db } from '@reactlith-template/db';
import { envAuth } from '@reactlith-template/env/auth';
import { isLocale, localeHeader } from '@reactlith-template/intl';

import { permissions } from '#permissions.ts';

export const auth = betterAuth({
  basePath: '/auth',
  trustedOrigins: envAuth.AUTH_TRUSTED_ORIGINS,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  rateLimit: {
    customRules: {
      '/sign-in/magic-link': {
        window: 60,
        max: 1,
      },
    },
  },
  socialProviders: {
    github:
      envAuth.AUTH_GITHUB_CLIENT_ID && envAuth.AUTH_GITHUB_CLIENT_SECRET
        ? {
            clientId: envAuth.AUTH_GITHUB_CLIENT_ID,
            clientSecret: envAuth.AUTH_GITHUB_CLIENT_SECRET,
          }
        : undefined,
  },
  plugins: [
    magicLink({
      sendMagicLink: ({ url, email }, request) => {
        if (envAuth.AUTH_DEV_MAGIC_LINK && /^\S+@example\.com$/.test(email)) {
          console.log(`${email} - ${url}`);
          return;
        }

        if (!request) {
          throw new BetterAuthError('sendMagicLink: Request is not defined');
        }
        const locale = request.headers.get(localeHeader);
        if (!isLocale(locale)) {
          throw new BetterAuthError(
            "sendMagicLink: provided locale doesn't exist",
          );
        }
      },
    }),
    admin({
      ...permissions,
    }),
  ],
});
