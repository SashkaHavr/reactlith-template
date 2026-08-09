import { panic, TaggedError } from "better-result";

import { TRPCError } from "#/context";
import type { Permissions } from "@reactlith-template/auth";

import { protectedProcedure } from "./protected-procedure";

export class AdminProcedureForbidden extends TaggedError("AdminProcedureForbidden")<{
  message: string;
}> {
  constructor() {
    super({
      message: "You don't have permissions to access this endpoint",
    });
  }
}

export function adminProcedure(permissions: Permissions) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const requestPermissionsList = (
      Object.entries(permissions) as [
        keyof typeof permissions,
        NonNullable<(typeof permissions)[keyof typeof permissions]>,
      ][]
    )
      .flatMap(([key, value]) =>
        value.map((p): `${keyof typeof permissions}.${typeof p}` => `${key}.${p}`),
      )
      .flat();

    ctx.log?.set({
      admin: {
        permissionsRequested: requestPermissionsList,
      },
    });

    if (requestPermissionsList.length === 0) {
      panic("No permissions specified for adminProcedure");
    }

    const hasPermission = await ctx.auth.userHasPermission({
      body: { userId: ctx.userId, permissions: permissions },
    });
    if (!hasPermission.success) {
      throw new TRPCError({ code: "FORBIDDEN", error: new AdminProcedureForbidden() });
    }

    return await next();
  });
}
