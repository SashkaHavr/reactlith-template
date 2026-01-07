import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter as DefaultConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { envOtel } from "@reactlith-template/env/otel";
import { envHost } from "@reactlith-template/env/host";
import { trace, SpanStatusCode, SpanKind } from "@opentelemetry/api";
import type { Span } from "@opentelemetry/api";
import { ConsoleSpanExporter } from "#console-span-exporter.ts";
import { envNode } from "@reactlith-template/env/node";

const traceExporter =
  envNode.NODE_ENV === "production" ? new ConsoleSpanExporter() : new DefaultConsoleSpanExporter();

const resource = resourceFromAttributes({
  "service.name": envHost.SERVICE_NAME,
  "service.namepace":
    envHost.PROJECT_NAME && envHost.ENVIRONMENT_NAME
      ? `${envHost.PROJECT_NAME}.${envHost.ENVIRONMENT_NAME}`
      : undefined,
  "service.instance.id": envHost.REPLICA_ID,

  "server.address": envHost.PUBLIC_DOMAIN,

  "deployment.environment.name": envHost.ENVIRONMENT_NAME,
  "deployment.id": envHost.DEPLOYMENT_ID,

  "cloud.region": envHost.REPLICA_REGION,

  // Non-standard
  "service.id": envHost.SERVICE_ID,
  "service.project.id": envHost.PROJECT_ID,
  "service.project.name": envHost.PROJECT_NAME,
  "deployment.environment.id": envHost.ENVIRONMENT_ID,
});

const sdk = new NodeSDK({
  autoDetectResources: false,
  spanProcessor: new BatchSpanProcessor(traceExporter),
  resource: resource,
});

if (envOtel.OTEL_ENABLED) {
  sdk.start();
}

const tracer = trace.getTracer("reactlith-template.trpc");
export async function startActiveSpan<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T> {
  return await tracer.startActiveSpan(name, { kind: SpanKind.SERVER }, async (span) => {
    try {
      return await fn(span);
    } finally {
      span.end();
    }
  });
}

export function getActiveSpan() {
  return trace.getActiveSpan();
}

export { SpanStatusCode };
