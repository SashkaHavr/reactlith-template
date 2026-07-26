import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Context } from "#/context";

const getEnvAuth = vi.hoisted(() => vi.fn());

vi.mock("@reactlith-template/env", () => ({ getEnvAuth }));

import { configRouter } from "./router";

function createCaller() {
  return configRouter.createCaller({
    request: new Request("http://localhost/trpc"),
  } as Context);
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("configRouter", () => {
  it("reports enabled authentication providers", async () => {
    getEnvAuth.mockReturnValue({
      GOOGLE_CLIENT_ID: "client-id",
      GOOGLE_CLIENT_SECRET: "client-secret",
      GOOGLE_EMULATE_URL: "http://localhost:8080",
    });

    await expect(createCaller().general()).resolves.toEqual({
      auth: { google: true, googleEmulate: true },
    });
  });

  it("reports disabled authentication providers", async () => {
    getEnvAuth.mockReturnValue({
      GOOGLE_CLIENT_ID: "",
      GOOGLE_CLIENT_SECRET: "",
      GOOGLE_EMULATE_URL: undefined,
    });

    await expect(createCaller().general()).resolves.toEqual({
      auth: { google: false, googleEmulate: false },
    });
  });
});
