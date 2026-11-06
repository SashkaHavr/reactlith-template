import { Schema } from "effect";

import { AuthOutput } from "@reactlith-template/api-contract/features/config";
import { getApiClient } from "~/lib/api";
import { makeQueryAtom } from "~/lib/atom";

export const authConfigAtom = makeQueryAtom(
  "config/auth",
  () => getApiClient().config.auth(),
  AuthOutput,
);

export const healthReadyAtom = makeQueryAtom(
  "config/healthReady",
  () => getApiClient().config.healthReady(),
  Schema.Null,
);
