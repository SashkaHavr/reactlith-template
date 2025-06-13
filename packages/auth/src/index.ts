import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, emailOTP } from 'better-auth/plugins';

import { db } from '@reactlith-template/db';
import { envAuth } from '@reactlith-template/env/auth';

const devOTP = envAuth.AUTH_DEV_OTP
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
  plugins: [...devOTP, admin()],
});
