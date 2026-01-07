// oxlint-disable

import { type ExportResult, ExportResultCode, hrTimeToMicroseconds } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";

// Single line console span exporter for OpenTelemetry
export class ConsoleSpanExporter implements SpanExporter {
  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    return this._sendSpans(spans, resultCallback);
  }
  shutdown(): Promise<void> {
    this._sendSpans([]);
    return this.forceFlush();
  }
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
  private _exportInfo(span: ReadableSpan) {
    return {
      resource: span.resource.attributes,
      traceId: span.spanContext().traceId,
      parentSpanId: span.parentSpanContext?.spanId,
      name: span.name,
      id: span.spanContext().spanId,
      kind: span.kind,
      timestamp: hrTimeToMicroseconds(span.startTime),
      duration: hrTimeToMicroseconds(span.duration),
      attributes: span.attributes,
      status: span.status,
      events: span.events,
      links: span.links,
      test: {
        directKey: "value",
        nested: {
          nestedKey: "nestedValue",
        },
        "logically.nested": "logicallyNestedValue",
      },
    };
  }
  private _sendSpans(spans: ReadableSpan[], done?: (result: ExportResult) => void): void {
    for (const span of spans) {
      console.log(JSON.stringify(this._exportInfo(span)));
    }
    if (done) {
      return done({ code: ExportResultCode.SUCCESS });
    }
  }
}
