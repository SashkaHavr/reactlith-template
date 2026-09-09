import { layer } from "@effect/vitest";
import { Context, Effect, Layer, Option } from "effect";
import { HttpApi, HttpApiTest } from "effect/unstable/httpapi";
import { expect, vi } from "vitest";

import { GlobalMiddlewareLive } from "#middleware/global/layer";
import { ClientDependenciesLayerTest } from "#test-utils";
import { AuthConfig } from "@reactlith-template/config/auth";
import { Database } from "@reactlith-template/db";

import { ConfigApiLive } from "./layer";
import { ConfigApi, NotReady } from "./schema";

const DatabaseMock = { execute: vi.fn<() => Effect.Effect<void, void>>() };

class TestApi extends HttpApi.make("api").add(ConfigApi).prefix("/api/rpc") {}

class TestClient extends Context.Service<TestClient>()("api/TestClient", {
  make: HttpApiTest.groups(TestApi, ["config"]),
}) {
  static readonly layerTest = Layer.effect(this, this.make).pipe(
    Layer.provide(ConfigApiLive),
    Layer.provide(GlobalMiddlewareLive),
    Layer.provide(ClientDependenciesLayerTest),
    Layer.provide(Layer.succeed(Database)(DatabaseMock as never)),
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
)((it) => {
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
)((it) => {
  it.effect(
    "reports disabled emulate provider",
    Effect.fn(function* () {
      const client = yield* TestClient;

      const result = yield* client.config.auth();

      expect(result).toEqual({ googleEmulate: false });
    }),
  );

  it.effect(
    "reports the service is live",
    Effect.fn(function* () {
      const client = yield* TestClient;

      const result = yield* client.config.healthLive();

      expect(result).toBeNull();
    }),
  );

  it.effect(
    "reports the service is ready when the database probe succeeds",
    Effect.fn(function* () {
      const client = yield* TestClient;
      DatabaseMock.execute.mockReturnValue(Effect.succeedNone);

      const result = yield* client.config.healthReady();

      expect(result).toBeNull();
    }),
  );

  it.effect(
    "reports the service is not ready when the database probe fails",
    Effect.fn(function* () {
      const client = yield* TestClient;
      DatabaseMock.execute.mockReturnValue(Effect.fail(Option.none));

      const error = yield* client.config.healthReady().pipe(Effect.flip);

      expect(error).toBeInstanceOf(NotReady);
    }),
  );
});
