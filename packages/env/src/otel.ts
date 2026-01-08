import { createEnv } from "@t3-oss/env-core";
import z from "zod";

const railwayDeployment = !!process.env.RAILWAY_SERVICE_NAME;
if (railwayDeployment) {
  const envRailway = createEnv({
    server: {
      RAILWAY_SERVICE_NAME: z.string(),
      RAILWAY_PROJECT_NAME: z.string(),
      RAILWAY_ENVIRONMENT_NAME: z.string(),
      RAILWAY_REPLICA_ID: z.string(),
      RAILWAY_PUBLIC_DOMAIN: z.string(),
      RAILWAY_REPLICA_REGION: z.string(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  });

  process.env.OTEL_ENABLED = "true";
  process.env.OTEL_SERVICE_NAME = envRailway.RAILWAY_SERVICE_NAME;
  process.env.OTEL_SERVICE_NAMESPACE = envRailway.RAILWAY_PROJECT_NAME;
  process.env.OTEL_SERVICE_INSTANCE_ID = envRailway.RAILWAY_REPLICA_ID;
  process.env.OTEL_SERVER_ADDRESS = envRailway.RAILWAY_PUBLIC_DOMAIN;
  process.env.OTEL_DEPLOYMENT_ENVIRONMENT_NAME = envRailway.RAILWAY_ENVIRONMENT_NAME;
  process.env.OTEL_CLOUD_REGION = envRailway.RAILWAY_REPLICA_REGION;
}

export const envOtel = createEnv({
  server: {
    OTEL_ENABLED: z.stringbool().default(false),

    OTEL_SERVICE_NAME: z.string().default("reactlith-template"),
    OTEL_SERVICE_NAMESPACE: z.string().optional(),
    OTEL_SERVICE_INSTANCE_ID: z.string().optional(),

    OTEL_SERVER_ADDRESS: z.string().optional(),

    OTEL_DEPLOYMENT_ENVIRONMENT_NAME: z.string().optional(),

    OTEL_CLOUD_REGION: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
