import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient as createAuthClientBase } from "better-auth/react";

import type { AuthType } from "#index";
import { ac, roles } from "#permissions";

export function createAuthClient(args?: {
  customFetchImpl?: (
    input: Parameters<typeof fetch>[0],
    init: Parameters<typeof fetch>[1],
  ) => Promise<Response>;
}) {
  return createAuthClientBase({
    basePath: "/api/auth",
    plugins: [inferAdditionalFields<AuthType>(), adminClient({ ac, roles })],
    fetchOptions: {
      customFetchImpl: args?.customFetchImpl,
      throw: true,
    },
  });
}
