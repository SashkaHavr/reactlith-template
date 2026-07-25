import { TRPCError } from "@trpc/server";
import { getStatusKeyFromCode } from "@trpc/server/unstable-core-do-not-import";
import type { EvlogError } from "evlog";

export class TRPCEvlogError extends TRPCError {
  constructor(evlogError: EvlogError) {
    super({
      code: getStatusKeyFromCode(evlogError.status),
      message: evlogError.message,
      cause: evlogError,
    });
  }
}
