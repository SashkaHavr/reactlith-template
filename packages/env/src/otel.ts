import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const otelConfig = {
  OTEL_ENABLED: z.stringbool().default(false),
};

export const envOtel = createEnv({
  server: { ...otelConfig },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
