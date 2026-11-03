// oxlint-disable import/no-default-export
import { NodeServices } from "@effect/platform-node";
import { Config, Effect, Predicate, Schema, Stream } from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/process";
import { defineRailway, image, postgres, preserve, project, service, volume } from "railway/iac";

const RAM_GB = 1000000000 as const;
const STORAGE_5GB = 5000 as const;
const region = "europe-west4-drams3a" as const;
const randomStringGenerator = "${{secret(32)}}" as const;

const RailwayConfig = Schema.Struct({
  resources: Schema.Array(
    Schema.Struct({
      address: Schema.String,
      variables: Schema.Record(Schema.String, Schema.Unknown).pipe(Schema.NullOr),
      source: Schema.Struct({
        repo: Schema.String.pipe(Schema.NullOr, Schema.optional),
        branch: Schema.String.pipe(Schema.NullOr, Schema.optional),
      }).pipe(Schema.NullOr),
    }),
  ),
});

function preserveOrGenerate(
  config: typeof RailwayConfig.Type,
  { service, variable }: { service: string; variable: string },
) {
  const resource = config.resources.find((resource) => resource.address === `service.${service}`);
  return Predicate.hasProperty(variable)(resource?.variables ?? {})
    ? preserve()
    : randomStringGenerator;
}

export default defineRailway(async () =>
  Effect.gen(function* () {
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
    const handle = yield* spawner.spawn(ChildProcess.make`railway config pull --json`);
    const { output, error } = yield* Effect.all(
      {
        output: handle.stdout.pipe(Stream.decodeText, Stream.mkString),
        error: handle.stderr.pipe(Stream.decodeText, Stream.mkString),
      },
      { concurrency: "unbounded" },
    );
    const exitCode = yield* handle.exitCode;
    if (exitCode !== 0) {
      return yield* Effect.die(`railway config pull failed: ${error.trim() || output.trim()}`);
    }
    const config = yield* RailwayConfig.pipe(
      Schema.fromJsonString,
      Schema.decodeUnknownEffect,
    )(output);
    const source = config.resources.find((resource) => resource.address === "service.web")?.source;
    const github = yield* Config.all({
      repo: Config.String("GITHUB_REPOSITORY").pipe(Config.withDefault("")),
      headRef: Config.String("GITHUB_HEAD_REF").pipe(Config.withDefault("")),
      refName: Config.String("GITHUB_REF_NAME").pipe(Config.withDefault("")),
    });

    const db = postgres("db", { region: region });
    db.networking = { tcpProxies: { "5432": {} } };

    const web = service("web", {
      source: {
        type: "github",
        repo: github.repo || source?.repo,
        branch: github.headRef || github.refName || source?.branch,
        checkSuites: true,
      },
      replicas: { [region]: 1 },
      deploy: {
        limitOverride: { containers: { cpu: 2, memoryBytes: 2 * RAM_GB } },
        sleepApplication: true,
      },
      build: {
        builder: "DOCKERFILE",
        dockerfilePath: "/apps/web/Dockerfile",
      },
      healthcheckPath: "/api/health/ready",
      healthcheckTimeout: 10,
      env: {
        PUBLIC_URL: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
        PORT: "3000",
        BETTER_AUTH_ALLOWED_HOSTS: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
        BETTER_AUTH_IP_ADDRESS_HEADERS: "X-Real-IP",
        BETTER_AUTH_SECRET: preserveOrGenerate(config, {
          service: "web",
          variable: "BETTER_AUTH_SECRET",
        }),
        DATABASE_URL: db.env.DATABASE_URL,
        GOOGLE_CLIENT_ID: preserve(),
        GOOGLE_CLIENT_SECRET: preserve(),
        GOOGLE_EMULATE_URL: preserve(),
        GOOGLE_EMULATE_INTERNAL_URL: preserve(),
      },
      tracing: {
        autoInstrumentation: false,
        enabled: true,
      },
    });

    const drizzleGatewayVolume = volume("drizzle-gateway-volume", {
      region: region,
      sizeMB: STORAGE_5GB,
    });
    const drizzleGateway = service("drizzle-gateway", {
      source: image("ghcr.io/drizzle-team/gateway:latest"),
      replicas: { [region]: 1 },
      healthcheck: "/health",
      deploy: {
        limitOverride: { containers: { cpu: 1, memoryBytes: RAM_GB } },
        sleepApplication: true,
      },
      volumeMounts: { "/app": drizzleGatewayVolume },
      env: {
        PORT: "4983",
        DATABASE_URL: db.env.DATABASE_URL,
        MASTERPASS: preserveOrGenerate(config, {
          service: "drizzle-gateway",
          variable: "MASTERPASS",
        }),
      },
    });

    return project("reactlith-iac-test", {
      resources: [db, web, drizzleGateway, drizzleGatewayVolume],
    });
  }).pipe(Effect.provide(NodeServices.layer), Effect.scoped, Effect.runPromise),
);
