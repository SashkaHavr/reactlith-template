export function getErrorData(error: unknown) {
  if (error instanceof Error) {
    const errorObj: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    const errRecord = error as unknown as Record<string, unknown>;
    for (const key of [
      "status",
      "statusText",
      "statusCode",
      "statusMessage",
      "data",
      "code",
      "routerCode",
    ] as const) {
      if (key in error) errorObj[key] = errRecord[key];
    }

    return errorObj;
  }
  return error ?? {};
}

export function getErrorDataWithCause(error: unknown) {
  if (error instanceof Error) {
    return {
      ...getErrorData(error),
      cause: error.cause !== undefined ? getErrorData(error.cause) : undefined,
    };
  }
  return error;
}
