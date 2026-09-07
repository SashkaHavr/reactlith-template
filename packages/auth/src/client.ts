import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient as createAuthClientBase } from "better-auth/react";

import type { AuthType } from "#index";
import { ac, roles } from "#permissions";

export function createAuthClient(args?: { baseURL?: string; customFetchImpl?: typeof fetch }) {
  return createAuthClientBase({
    baseURL: args?.baseURL,
    basePath: "/api/auth",
    plugins: [inferAdditionalFields<AuthType>(), adminClient({ ac, roles })],
    fetchOptions: {
      customFetchImpl: args?.customFetchImpl,
      throw: true,
    },
  });
}
