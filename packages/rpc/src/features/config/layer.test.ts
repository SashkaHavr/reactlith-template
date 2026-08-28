/* oxlint-disable vitest/no-standalone-expect -- Effect's it.effect wrapper is not recognized. */
import { describe, it } from "@effect/vitest";
import { Effect, Layer, Option, Redacted } from "effect";
import * as RpcTest from "effect/unstable/rpc/RpcTest";
import { expect } from "vitest";

import { AuthConfig } from "@reactlith-template/config/auth-config";

import { ConfigRpcsLive } from "./layer";
import { ConfigRpcs } from "./schema";

function makeConfigLayer({ emulate = false, secret = "client-secret" } = {}) {
  return Layer.succeed(AuthConfig)({
    allowedHosts: ["localhost:*"],
    secret: Redacted.make("auth-secret"),
    googleClientId: "client-id",
    googleClientSecret: Redacted.make(secret),
    googleEmulateUrl: emulate ? Option.some(new URL("http://localhost:8080")) : Option.none(),
  });
}

function callAuth(configLayer: ReturnType<typeof makeConfigLayer>) {
  const handlers = ConfigRpcsLive.pipe(Layer.provide(configLayer));
  return Effect.scoped(
    Effect.gen(function* () {
      const client = yield* RpcTest.makeClient(ConfigRpcs);
      return yield* client["config.auth"]();
    }).pipe(Effect.provide(handlers)),
  );
}

describe("ConfigRpcs", () => {
  it.effect("reports enabled authentication providers", () =>
    Effect.gen(function* () {
      const result = yield* callAuth(makeConfigLayer({ emulate: true }));
      expect(result).toEqual({ google: true, googleEmulate: true });
    }),
  );

  it.effect("reports disabled authentication providers", () =>
    Effect.gen(function* () {
      const result = yield* callAuth(makeConfigLayer({ secret: "" }));
      expect(result).toEqual({ google: false, googleEmulate: false });
    }),
  );
});
