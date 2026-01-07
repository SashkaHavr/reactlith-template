import type { Span } from "@opentelemetry/api";

import { trace, SpanStatusCode, SpanKind } from "@opentelemetry/api";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter as DefaultConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base";

import { StructuredLogSpanExporter } from "#structured-log-span-exporter.ts";
import { envNode } from "@reactlith-template/env/node";
import { envOtel } from "@reactlith-template/env/otel";

const traceExporter =
  envNode.NODE_ENV === "production"
    ? new StructuredLogSpanExporter()
    : new DefaultConsoleSpanExporter();

const resource = resourceFromAttributes({
  "service.name": envOtel.SERVICE_NAME,
  "service.namepace": envOtel.SERVICE_NAMESPACE,
  "service.instance.id": envOtel.SERVICE_INSTANCE_ID,
  "server.address": envOtel.SERVER_ADDRESS,
  "deployment.environment.name": envOtel.DEPLOYMENT_ENVIRONMENT_NAME,
  "cloud.region": envOtel.CLOUD_REGION,
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
