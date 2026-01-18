import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const envAuth = createEnv({
  server: {
    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().nonempty(),

    TEST_AUTH: z.stringbool().default(false),

    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
