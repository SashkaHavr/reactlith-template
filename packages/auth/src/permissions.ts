import type { AdminOptions } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

const statement = {
  ...defaultStatements,
} as const;

const ac = createAccessControl(statement);

const user = ac.newRole({ user: [] });

const admin = ac.newRole({
  ...adminAc.statements,
});

export const permissions = {
  ac,
  roles: { admin, user },
} satisfies AdminOptions;

const allRoles = Object.keys(permissions.roles);

export type Role = keyof typeof permissions.roles;

export function getRoles(role: string | null | undefined) {
  if (!role) return;
  const roles = role.split(',');
  if (roles.length > 0 && roles.every((r) => allRoles.includes(r))) {
    return roles as Role[];
  }
  return;
}

export function isRole(role: string | null | undefined): role is Role {
  return getRoles(role) != undefined;
}
