import { layer } from "@effect/vitest";
import { Context, Effect, Layer, Option } from "effect";
import { HttpApi, HttpApiTest } from "effect/http-api";
import { expect } from "vite-plus/test";

import { GlobalMiddlewareLive } from "#/middleware/global/layer";
import { ClientDependenciesLayerTest } from "#/test-utils";
import { ConfigApi } from "@reactlith-template/api-contract/features/config";
import { AuthConfig } from "@reactlith-template/config/auth";

import { ConfigApiLive } from "./layer";

class TestApi extends HttpApi.make("api").add(ConfigApi).prefix("/api") {}

class TestClient extends Context.Service<TestClient>()("api/TestClient", {
  make: HttpApiTest.groups(TestApi, ["config"]),
}) {
  static readonly layerTest = Layer.effect(this, this.make).pipe(
    Layer.provide(ConfigApiLive),
    Layer.provide(GlobalMiddlewareLive),
    Layer.provide(ClientDependenciesLayerTest),
  );
}

layer(
  TestClient.layerTest.pipe(
    Layer.provide(
      Layer.succeed(AuthConfig)({
        googleEmulateUrl: Option.some(new URL("http://localhost")),
      } satisfies Partial<AuthConfig["Service"]> as AuthConfig["Service"]),
    ),
  ),
)("ConfigApi with emulate", (it) => {
  it.effect(
    "reports enabled emulate provider",
    Effect.fn(function* () {
      const client = yield* TestClient;

      const result = yield* client.config.auth();

      expect(result).toEqual({ googleEmulate: true });
    }),
  );
});

layer(
  TestClient.layerTest.pipe(
    Layer.provide(
      Layer.succeed(AuthConfig)({
        googleEmulateUrl: Option.none(),
      } satisfies Partial<AuthConfig["Service"]> as AuthConfig["Service"]),
    ),
  ),
)("ConfigApi without emulate", (it) => {
  it.effect(
    "reports disabled emulate provider",
    Effect.fn(function* () {
      const client = yield* TestClient;

      const result = yield* client.config.auth();

      expect(result).toEqual({ googleEmulate: false });
    }),
  );
});
