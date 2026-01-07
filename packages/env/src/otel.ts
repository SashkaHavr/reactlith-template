import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const envOtel = createEnv({
  server: {
    OTEL_ENABLED: z.stringbool().default(false),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
