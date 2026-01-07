import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const envNode = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
