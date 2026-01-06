import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { authConfig, authProdConfig } from "./auth";
import { dbConfig } from "./db";
import { hostConfig } from "#host.ts";
import { otelConfig } from "#otel.ts";

export const envServer = createEnv({
  server: {
    ...dbConfig,
    ...authConfig,
    ...authProdConfig,
    ...otelConfig,
    ...hostConfig,

    NODE_ENV: z.enum(["development", "production"]),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
