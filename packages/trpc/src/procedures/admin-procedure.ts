import { TRPCError } from "@trpc/server";

import type { Permissions } from "@reactlith-template/auth";

import { protectedProcedure } from "./protected-procedure";

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

    ctx.logger.setBindings({
      adminProcedure: {
        permissionsRequested: requestPermissionsList,
      },
    });

    if (requestPermissionsList.length === 0) {
      throw new TRPCError({
        message: "No permissions specified for adminProcedure",
        code: "INTERNAL_SERVER_ERROR",
      });
    }

    const hasPermission = await ctx.auth.userHasPermission({
      body: { userId: ctx.userId, permissions: permissions },
    });
    if (!hasPermission.success) {
      throw new TRPCError({
        message: "You don't have permissions to access this endpoint",
        code: "FORBIDDEN",
      });
    }

    return await next();
  });
}
