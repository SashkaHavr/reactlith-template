import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Context } from "#context";
import type { getEnvAuth } from "@reactlith-template/env";

const getEnvAuthMock = vi.hoisted(() => vi.fn<typeof getEnvAuth>());

vi.mock("@reactlith-template/env", () => ({ getEnvAuth: getEnvAuthMock }));

import { configRouter } from "./router";

function createCaller() {
  return configRouter.createCaller({} as Context);
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("configRouter", () => {
  it("reports enabled authentication providers", async () => {
    getEnvAuthMock.mockReturnValue({
      BETTER_AUTH_ALLOWED_HOSTS: [],
      GOOGLE_CLIENT_ID: "client-id",
      GOOGLE_CLIENT_SECRET: "client-secret",
      GOOGLE_EMULATE_URL: "http://localhost:8080",
    });

    const result = await createCaller().auth();

    expect(result).toEqual({ google: true, googleEmulate: true });
  });

  it("reports disabled authentication providers", async () => {
    getEnvAuthMock.mockReturnValue({
      BETTER_AUTH_ALLOWED_HOSTS: [],
      GOOGLE_CLIENT_ID: "",
      GOOGLE_CLIENT_SECRET: "",
      GOOGLE_EMULATE_URL: undefined,
    });

    const result = await createCaller().auth();

    expect(result).toEqual({ google: false, googleEmulate: false });
  });
});
