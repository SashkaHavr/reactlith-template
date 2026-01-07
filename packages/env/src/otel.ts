import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const envOtel = createEnv({
  server: {
    OTEL_ENABLED: z.stringbool().default(false),

    SERVICE_NAME: z.string().default("reactlith-template"),
    SERVICE_NAMESPACE: z.string().optional(),
    SERVICE_INSTANCE_ID: z.string().optional(),

    SERVER_ADDRESS: z.string().optional(),

    DEPLOYMENT_ENVIRONMENT_NAME: z.string().optional(),

    CLOUD_REGION: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
