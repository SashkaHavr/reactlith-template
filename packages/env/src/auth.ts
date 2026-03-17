import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { envNode } from "#node.ts";

const nonemptyStringToArray = z
  .string()
  .nonempty()
  .transform((v) => [v]);

const allowedHosts = z.union([
  z
    .string()
    .transform((v, ctx) => {
      try {
        return JSON.parse(v) as unknown;
      } catch {
        ctx.issues.push({ code: "custom", message: "Not a JSON", input: v });
      }
    })
    .pipe(z.union([nonemptyStringToArray, z.array(z.string()).nonempty()])),
  nonemptyStringToArray,
]);

const secret = z.string().nonempty();

export const envAuth = createEnv({
  server: {
    BETTER_AUTH_ALLOWED_HOSTS:
      envNode.NODE_ENV === "development" ? allowedHosts.default(["localhost:*"]) : allowedHosts,
    BETTER_AUTH_SECRET: envNode.NODE_ENV === "development" ? secret.optional() : secret,

    TEST_AUTH: z.stringbool().default(false),

    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
