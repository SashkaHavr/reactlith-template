import { defineErrorCatalog } from "evlog";

import type { Permissions } from "@reactlith-template/auth";

import { protectedProcedure } from "./protected-procedure";

const errors = defineErrorCatalog("adminProcedure", {
  NO_PERMISSIONS_SPECIFIED: {
    message: "No permissions specified for adminProcedure",
    trpcCode: "INTERNAL_SERVER_ERROR",
  },
  FORBIDDEN: {
    message: "You don't have permissions to access this endpoint",
    trpcCode: "FORBIDDEN",
  },
});

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
      throw errors.NO_PERMISSIONS_SPECIFIED();
    }

    const hasPermission = await ctx.auth.userHasPermission({
      body: { userId: ctx.userId, permissions: permissions },
    });
    if (!hasPermission.success) {
      throw errors.FORBIDDEN;
    }

    return await next();
  });
}
