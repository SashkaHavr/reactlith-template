// oxlint-disable import/no-default-export
import {
  defineRailway,
  github,
  image,
  postgres,
  preserve,
  project,
  service,
  volume,
} from "railway/iac";

export default defineRailway(() => {
  const db = postgres("db");
  const reactlithTemplateWeb = service("web", {
    source: github("SashkaHavr/reactlith-template", { branch: "iac-test" }),
    deploy: {
      limitOverride: { containers: { cpu: 2, memoryBytes: 2000000000 } },
    },
    build: {
      dockerfilePath: "/apps/web/Dockerfile",
    },
    healthcheckPath: "/api/health/ready",
    env: {
      BETTER_AUTH_ALLOWED_HOSTS: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
      BETTER_AUTH_IP_ADDRESS_HEADERS: "X-Real-IP",
      BETTER_AUTH_SECRET: "${{ secret(32) }}",
      DATABASE_URL: db.env.DATABASE_URL,
      GOOGLE_CLIENT_ID: preserve(),
      GOOGLE_CLIENT_SECRET: preserve(),
      GOOGLE_EMULATE_URL: preserve(),
      PUBLIC_URL: "https://${{RAILWAY_PUBLIC_DOMAIN}}",
    },
  });

  const drizzleGatewayVolume = volume("drizzle-gateway-volume");
  const drizzleGateway = service("drizzle", {
    source: image("ghcr.io/drizzle-team/gateway:latest"),
    healthcheck: "/health",
    deploy: {
      limitOverride: { containers: { cpu: 1, memoryBytes: 2000000000 } },
      sleepApplication: true,
    },
    networking: { privateNetworkEndpoint: "drizzle-gateway" },
    volumeMounts: { "/app": drizzleGatewayVolume },
    env: { DATABASE_URL: db.env.DATABASE_URL, MASTERPASS: "${{ secret(32) }}" },
  });

  return project("reactlith-iac-test", {
    resources: [db, reactlithTemplateWeb, drizzleGateway, drizzleGatewayVolume],
  });
});
