import { layer } from "@effect/vitest";
import { Effect, FileSystem, Layer, Option, Path, Redacted } from "effect";
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

const authConfig = {
  allowedHosts: [],
  secret: Redacted.make(""),
  googleClientId: "",
  googleClientSecret: Redacted.make(""),
  googleEmulateUrl: Option.none(),
} satisfies AuthConfig["Service"];

layer(
  Layer.succeed(AuthConfig)({
    ...authConfig,
    googleEmulateUrl: Option.some(new URL("http://localhost")),
  }),
)((it) => {
  it.effect("reports enabled authentication providers", () =>
    Effect.gen(function* () {
      const client = yield* makeClient;
      const result = yield* client.config.auth();
      expect(result).toEqual({ googleEmulate: true });
    }),
  );
});

layer(Layer.succeed(AuthConfig)(authConfig))((it) => {
  it.effect("reports disabled authentication providers", () =>
    Effect.gen(function* () {
      const client = yield* makeClient;
      const result = yield* client.config.auth();
      expect(result).toEqual({ googleEmulate: false });
    }),
  );
});
