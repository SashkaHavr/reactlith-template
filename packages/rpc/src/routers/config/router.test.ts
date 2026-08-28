import { Effect, Option, Redacted } from "effect";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Context } from "#context";

type AuthConfigShape = {
  readonly allowedHosts: readonly string[];
  readonly secret: Redacted.Redacted;
  readonly googleClientId: string;
  readonly googleClientSecret: Redacted.Redacted;
  readonly googleEmulateUrl: Option.Option<URL>;
};

const authConfigMakeMock = vi.hoisted(() => vi.fn<() => Effect.Effect<AuthConfigShape>>());

vi.mock("@reactlith-template/config/auth-config", () => ({
  AuthConfig: {
    get make() {
      return authConfigMakeMock();
    },
  },
}));

import { configRouter } from "./router";

function createCaller() {
  return configRouter.createCaller({} as Context);
}

beforeEach(() => {
  vi.resetAllMocks();
  authConfigMakeMock.mockReturnValue(
    Effect.succeed({
      allowedHosts: ["localhost:*"],
      secret: Redacted.make("auth-secret"),
      googleClientId: "client-id",
      googleClientSecret: Redacted.make("client-secret"),
      googleEmulateUrl: Option.none(),
    }),
  );
});

describe("configRouter", () => {
  it("reports enabled authentication providers", async () => {
    authConfigMakeMock.mockReturnValue(
      Effect.succeed({
        allowedHosts: ["localhost:*"],
        secret: Redacted.make("auth-secret"),
        googleClientId: "client-id",
        googleClientSecret: Redacted.make("client-secret"),
        googleEmulateUrl: Option.some(new URL("http://localhost:8080")),
      }),
    );

    const result = await createCaller().auth();

    expect(result).toEqual({ google: true, googleEmulate: true });
  });

  it("reports disabled authentication providers", async () => {
    authConfigMakeMock.mockReturnValue(
      Effect.succeed({
        allowedHosts: ["localhost:*"],
        secret: Redacted.make("auth-secret"),
        googleClientId: "client-id",
        googleClientSecret: Redacted.make(""),
        googleEmulateUrl: Option.none(),
      }),
    );

    const result = await createCaller().auth();

    expect(result).toEqual({ google: false, googleEmulate: false });
  });
});
