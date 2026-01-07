// oxlint-disable

import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";

import { type ExportResult, ExportResultCode, hrTimeToMicroseconds } from "@opentelemetry/core";

function unflatten(obj: Record<string, any>) {
  const result: Record<string, any> = {};

  for (const key in obj) {
    const parts = key.split(".");
    let current = result;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = obj[key];
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    });
  }

  return result;
}

export class StructuredLogSpanExporter implements SpanExporter {
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
      resource: unflatten(span.resource.attributes),
      traceId: span.spanContext().traceId,
      parentSpanId: span.parentSpanContext?.spanId,
      name: span.name,
      id: span.spanContext().spanId,
      kind: span.kind,
      timestamp: hrTimeToMicroseconds(span.startTime),
      duration: hrTimeToMicroseconds(span.duration),
      attributes: unflatten(span.attributes),
      status: span.status,
      events: span.events,
      links: span.links,
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
