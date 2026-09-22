// oxlint-disable import/no-default-export
import { exec } from "node:child_process";
import { promisify } from "node:util";

import { defineRailway, image, postgres, preserve, project, service, volume } from "railway/iac";

const execAsync = promisify(exec);

const RAM_GB = 1000000000;
const STORAGE_GB = 1000;
const region = "europe-west4-drams3a";

async function getServiceVariables(serviceName: string) {
  try {
    return JSON.parse(
      (await execAsync(`railway variables --service ${serviceName} --json`)).stdout,
    ) as Record<string, string>;
  } catch {
    return undefined;
  }
}

async function preserveOrGenerator({ service, variable }: { service: string; variable: string }) {
  const variables = await getServiceVariables(service);
  if (variables && variable in variables) {
    return preserve();
  }
  return "${{secret(32)}}";
}

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
      BETTER_AUTH_SECRET: await preserveOrGenerator({
        service: "web",
        variable: "BETTER_AUTH_SECRET",
      }),
      DATABASE_URL: db.env.DATABASE_URL,
      GOOGLE_CLIENT_ID: preserve(),
      GOOGLE_CLIENT_SECRET: preserve(),
      GOOGLE_EMULATE_URL: preserve(),
    },
  });

  const drizzleGatewayVolume = volume("drizzle-gateway-volume", {
    region: region,
    sizeMB: STORAGE_GB,
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
      MASTERPASS: await preserveOrGenerator({ service: "drizzle-gateway", variable: "MASTERPASS" }),
    },
  });

  return project("reactlith-iac-test", {
    resources: [db, reactlithTemplateWeb, drizzleGateway, drizzleGatewayVolume],
  });
});
