import { createEnv } from "@t3-oss/env-core";
import z from "zod";

let instance: ReturnType<typeof create> | undefined;
function create() {
  return createEnv({
    server: {
      NODE_ENV: z.enum(["development", "production", "test"]),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  });
}

export function getEnvNode() {
  return instance ?? (instance = create());
}
