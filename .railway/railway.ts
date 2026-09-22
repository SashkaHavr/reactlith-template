// oxlint-disable import/no-default-export
import { NodeServices } from "@effect/platform-node";
import { Effect, Predicate, Schema, Stream } from "effect";
import { ChildProcess, ChildProcessSpawner } from "effect/unstable/process";
import { defineRailway, image, postgres, preserve, project, service, volume } from "railway/iac";

const RAM_GB = 1000000000 as const;
const STORAGE_5GB = 5000 as const;
const region = "europe-west4-drams3a" as const;
const randomStringGenerator = "${{secret(32)}}" as const;

const preserveOrGenerate = Effect.fn(
  function* ({ service, variable }: { service: string; variable: string }) {
    const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
    const handle = yield* spawner.spawn(
      ChildProcess.make`railway variables --service ${service} --json`,
    );
    const output = yield* handle.all.pipe(Stream.decodeText, Stream.mkString);
    const exitCode = yield* handle.exitCode;
    if (exitCode !== 0) {
      if (output.toLowerCase().includes(`service '${service}' not found`.toLowerCase())) {
        return randomStringGenerator;
      }
      return yield* Effect.die(`railway variables failed: ${output.trim()}`);
    }
    const variables = yield* Schema.Record(Schema.String, Schema.Unknown).pipe(
      Schema.fromJsonString,
      Schema.decodeUnknownEffect,
    )(output);
    return Predicate.hasProperty(variable)(variables) ? preserve() : randomStringGenerator;
  },
  Effect.provide(NodeServices.layer),
  Effect.scoped,
);

export default defineRailway(async () => {
  const db = postgres("db", { region: region });
  db.networking = { tcpProxies: { "5432": {} } };
  const reactlithTemplateWeb = service("web", {
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
      BETTER_AUTH_SECRET: await preserveOrGenerate({
        service: "web",
        variable: "BETTER_AUTH_SECRET",
      }).pipe(Effect.runPromise),
      DATABASE_URL: db.env.DATABASE_URL,
      GOOGLE_CLIENT_ID: preserve(),
      GOOGLE_CLIENT_SECRET: preserve(),
      GOOGLE_EMULATE_URL: preserve(),
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
      MASTERPASS: await preserveOrGenerate({
        service: "drizzle-gateway",
        variable: "MASTERPASS",
      }).pipe(Effect.runPromise),
    },
  });

  return project("reactlith-iac-test", {
    resources: [db, reactlithTemplateWeb, drizzleGateway, drizzleGatewayVolume],
  });
});
