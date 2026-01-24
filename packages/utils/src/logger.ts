import { pino, stdSerializers, destination } from "pino";

import { envLog } from "@reactlith-template/env/log";
import { envNode } from "@reactlith-template/env/node";

function hasDuration(obj: unknown): obj is { duration: number } {
  return (
    typeof obj === "object" && obj !== null && "duration" in obj && typeof obj.duration === "number"
  );
}

function hasResponse(obj: unknown): obj is { response: { statusCode: number } } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "response" in obj &&
    typeof obj.response === "object" &&
    obj.response !== null &&
    "statusCode" in obj.response &&
    typeof obj.response.statusCode === "number"
  );
}

export const baseLogger = pino(
  {
    level: envLog.LOG_LEVEL,
    base: undefined,
    hooks: {
      logMethod(inputArgs, method, level) {
        const inputObj = inputArgs[0];

        if (!envLog.LOG_SAMPLE) {
          return method.apply(this, inputArgs);
        }

        if (level >= 40) {
          return method.apply(this, inputArgs);
        }

        if (hasDuration(inputObj) && inputObj.duration > envLog.LOG_SAMPLE_TIME_MS) {
          return method.apply(this, inputArgs);
        }

        if (
          hasResponse(inputObj) &&
          inputObj.response.statusCode >= 200 &&
          inputObj.response.statusCode < 400 &&
          !envLog.LOG_OK_RESPONSES
        ) {
          return;
        }

        if (Math.random() < envLog.LOG_SAMPLE_RATE) {
          return method.apply(this, inputArgs);
        }
      },
    },
    serializers: {
      err: stdSerializers.errWithCause,
    },
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    transport:
      envNode.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
          }
        : undefined,
  },
  destination({ sync: envNode.NODE_ENV === "development" }),
);
