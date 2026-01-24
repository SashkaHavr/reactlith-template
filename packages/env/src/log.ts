import { createEnv } from "@t3-oss/env-core";
import z from "zod";

import { envNode } from "#node.ts";

export const envLog = createEnv({
  server: {
    LOG_LEVEL: z
      .enum(["debug", "info", "warn", "error"])
      .default(envNode.NODE_ENV === "development" ? "debug" : "info"),
    LOG_SAMPLE: z.stringbool().default(true),
    LOG_SAMPLE_RATE: z
      .string()
      .transform((val) => parseFloat(val))
      .default(0.05)
      .pipe(z.number().min(0).max(1)),
    LOG_SAMPLE_TIME_MS: z
      .string()
      .transform((val) => parseInt(val, 10))
      .default(500)
      .pipe(z.number().min(0)),
    LOG_OK_RESPONSES: z.stringbool().default(envNode.NODE_ENV === "production"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
