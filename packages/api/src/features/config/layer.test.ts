import { layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Option, Path } from "effect";
import { Etag, HttpPlatform } from "effect/unstable/http";
import { HttpApiTest } from "effect/unstable/httpapi";
import { expect } from "vitest";

import { Api } from "#client";
import { AuthenticationMiddleware } from "#middleware/authentication/schema";
import { GlobalMiddlewareLive } from "#middleware/global/layer";
import { AuthConfig } from "@reactlith-template/config/auth";

import { ConfigApiLive } from "./layer";

const TestServices = Layer.mergeAll(Path.layer, Etag.layerWeak, HttpPlatform.layer).pipe(
  Layer.provideMerge(FileSystem.layerNoop({})),
);

const ClientServices = Layer.mergeAll(
  TestServices,
  ConfigApiLive.pipe(Layer.provideMerge(GlobalMiddlewareLive)),
  Layer.succeed(AuthenticationMiddleware)(
    AuthenticationMiddleware.of(() => Effect.die("unexpected authentication")),
  ),
);
const makeClient = HttpApiTest.groups(Api, ["config"]).pipe(Effect.provide(ClientServices));

layer(
  Layer.succeed(AuthConfig)({
    googleEmulateUrl: Option.some(new URL("http://localhost")),
  } satisfies Partial<AuthConfig["Service"]> as AuthConfig["Service"]),
)((it) => {
  it.effect("reports enabled authentication providers", () =>
    Effect.gen(function* () {
      const client = yield* makeClient;
      const result = yield* client.config.auth();
      expect(result).toEqual({ googleEmulate: true });
    }),
  );
});

layer(
  Layer.succeed(AuthConfig)({
    googleEmulateUrl: Option.none(),
  } satisfies Partial<AuthConfig["Service"]> as AuthConfig["Service"]),
)((it) => {
  it.effect("reports disabled authentication providers", () =>
    Effect.gen(function* () {
      const client = yield* makeClient;
      const result = yield* client.config.auth();
      expect(result).toEqual({ googleEmulate: false });
    }),
  );
});
