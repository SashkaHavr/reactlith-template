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
      envNode.NODE_ENV === "development"
        ? allowedHosts.default(["localhost:*", "127.0.0.1:*"])
        : allowedHosts,
    BETTER_AUTH_SECRET: envNode.NODE_ENV === "development" ? secret.optional() : secret,

    TEST_AUTH: z.stringbool().default(false),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
