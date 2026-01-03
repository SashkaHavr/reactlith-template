import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

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
};
