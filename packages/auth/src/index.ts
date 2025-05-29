import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, emailOTP } from 'better-auth/plugins';

import { db } from '@reactlith-template/db';
import { envServer } from '@reactlith-template/env/server';

const devMagicLink = envServer.AUTH_DEV_OTP
  ? [
      emailOTP({
        sendVerificationOTP: async ({ email, otp }) => {
          await Promise.resolve();
          console.log(`${email} - ${otp}`);
        },
      }),
    ]
  : [];

export const auth = betterAuth({
  basePath: '/auth',
  trustedOrigins: [...envServer.CORS_ORIGINS, 'reactlith://', 'reactlith://*'],
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
  plugins: [...devMagicLink, expo(), admin()],
});
