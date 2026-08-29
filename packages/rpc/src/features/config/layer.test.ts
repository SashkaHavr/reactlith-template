import { layer } from "@effect/vitest";
import { Context, Effect, Layer, Option, Redacted } from "effect";
import type * as RpcClient from "effect/unstable/rpc/RpcClient";
import type * as RpcGroup from "effect/unstable/rpc/RpcGroup";
import * as RpcTest from "effect/unstable/rpc/RpcTest";
import { expect } from "vitest";

import { AuthConfig } from "@reactlith-template/config/auth-config";

import { ConfigRpcsLive } from "./layer";
import { ConfigRpcs } from "./schema";

class ConfigClient extends Context.Service<
  ConfigClient,
  RpcClient.RpcClient<RpcGroup.Rpcs<typeof ConfigRpcs>>
>()("rpc/test/ConfigClient") {
  static readonly layerTest = Layer.effect(ConfigClient)(RpcTest.makeClient(ConfigRpcs)).pipe(
    Layer.provide(ConfigRpcsLive),
  );
}

const authConfig = {
  allowedHosts: [],
  secret: Redacted.make(""),
  googleClientId: "",
  googleClientSecret: Redacted.make(""),
  googleEmulateUrl: Option.none(),
} satisfies AuthConfig["Service"];

layer(
  ConfigClient.layerTest.pipe(
    Layer.provide(
      Layer.succeed(AuthConfig)({
        ...authConfig,
        googleEmulateUrl: Option.some(new URL("http://localhost:8080")),
      }),
    ),
  ),
)((it) => {
  it.effect("reports enabled authentication providers", () =>
    Effect.gen(function* () {
      const client = yield* ConfigClient;
      const result = yield* client["config.auth"]();
      expect(result).toEqual({ googleEmulate: true });
    }),
  );
});

layer(ConfigClient.layerTest.pipe(Layer.provide(Layer.succeed(AuthConfig)(authConfig))))((it) => {
  it.effect("reports disabled authentication providers", () =>
    Effect.gen(function* () {
      const client = yield* ConfigClient;
      const result = yield* client["config.auth"]();
      expect(result).toEqual({ googleEmulate: false });
    }),
  );
});
