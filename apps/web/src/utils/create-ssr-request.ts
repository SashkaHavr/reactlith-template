import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

function getRelativeUrl(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`;
}

function constructServerUrl(input: RequestInfo | URL, serverRequest: Request) {
  return new URL(
    typeof input === "string"
      ? input
      : getRelativeUrl(new URL(input instanceof Request ? input.url : input)),
    new URL(serverRequest.url).origin,
  );
}

export const createSSRRequest = createServerOnlyFn(
  (input: RequestInfo | URL, init?: RequestInit) => {
    const serverRequest = getRequest();
    return new Request(constructServerUrl(input, serverRequest), {
      ...init,
      headers: serverRequest.headers,
    });
  },
);
