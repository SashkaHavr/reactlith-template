import { Schema } from "effect";
import { AsyncResult, Atom } from "effect/reactivity";

import { AuthOutput } from "@reactlith-template/api-contract/features/config";
import { getApiClient } from "~/lib/api";

export const authConfigAtom = Atom.make(() => getApiClient().config.auth()).pipe(
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

export const healthReadyAtom = Atom.make(() => getApiClient().config.healthReady()).pipe(
  Atom.serializable({
    key: "config/healthReady",
    schema: AsyncResult.Schema({ success: Schema.Null }),
    skipInitialRun: true,
  }),
  Atom.swr({
    staleTime: 0,
    revalidateOnFocus: true,
    focusSignal: Atom.windowFocusSignal,
  }),
);
