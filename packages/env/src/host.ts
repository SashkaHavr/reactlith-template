import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const hostConfig = {
  PUBLIC_DOMAIN: z.string().optional(),
  PROJECT_NAME: z.string().optional(),
  PROJECT_ID: z.string().optional(),
  ENVIRONMENT_NAME: z.string().optional(),
  ENVIRONMENT_ID: z.string().optional(),
  SERVICE_NAME: z.string().default("reactlith-template"),
  SERVICE_ID: z.string().optional(),
  REPLICA_ID: z.string().optional(),
  REPLICA_REGION: z.string().optional(),
  DEPLOYMENT_ID: z.string().optional(),
};

export const envHost = createEnv({
  server: { ...hostConfig },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
