import type { Redacted } from "effect";
import { Context } from "effect";

export class ConfigNode extends Context.Service<
  ConfigNode,
  {
    readonly ENV: "development" | "production" | "test";
  }
>()("services/ConfigNode") {}

export class ConfigDB extends Context.Service<
  ConfigDB,
  {
    readonly URL: Redacted.Redacted;
  }
>()("services/ConfigDB") {}

export class AuthConfig extends Context.Service<
  AuthConfig,
  {
    readonly ALLOWED_HOSTS: ReadonlyArray<string>;
    readonly SECRET: Redacted.Redacted | undefined;
  }
>()("services/AuthConfig") {}

export class GoogleAuthConfig extends Context.Service<
  GoogleAuthConfig,
  {
    readonly CLIENT_ID: string;
    readonly CLIENT_SECRET: Redacted.Redacted;
    readonly EMULATE_URL: string | undefined;
  }
>()("services/GoogleAuthConfig") {}
