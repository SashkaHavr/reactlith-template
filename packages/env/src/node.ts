import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const envNode = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    HEALTHCHECK_ON_SSR: z.stringbool().default(false),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
