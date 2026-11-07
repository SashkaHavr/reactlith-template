import { AsyncResult } from "effect/reactivity";

import { AuthOutput } from "@reactlith-template/api-contract/features/config";
import { apiRuntime, ApiClient } from "~/lib/api";
import { AppAtom } from "~/lib/atom";

export const authConfigAtom = apiRuntime.atom(ApiClient.use((client) => client.config.auth())).pipe(
  AppAtom.serializable({
    key: "config/auth",
    schema: AsyncResult.Schema({ success: AuthOutput }),
  }),
  AppAtom.swr,
);
