import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

let instance: ReturnType<typeof create> | undefined;
function create() {
  return createEnv({
    server: {
      DATABASE_URL: z.string(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  });
}

export function getEnvDB() {
  return instance ?? (instance = create());
}
