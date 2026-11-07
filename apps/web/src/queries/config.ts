import { AsyncResult, Atom } from "effect/reactivity";

import { AuthOutput } from "@reactlith-template/api-contract/features/config";
import { apiRuntime, ApiClient } from "~/lib/api";

export const authConfigAtom = apiRuntime.atom(ApiClient.use((client) => client.config.auth())).pipe(
  Atom.serializable({
    key: "config/auth",
    schema: AsyncResult.Schema({ success: AuthOutput }),
    skipInitialRun: true,
  }),
  Atom.swr({
    staleTime: 0,
    revalidateOnFocus: true,
    focusSignal: Atom.windowFocusSignal,
  }),
);
