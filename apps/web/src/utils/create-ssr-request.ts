import { createServerOnlyFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

function getRelativeUrl(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`;
}

function constructServerUrl(input: RequestInfo | URL, serverRequest: Request) {
  const serverRequestOrigin = new URL(serverRequest.url).origin;
  if (typeof input === "string") {
    return new URL(input, serverRequestOrigin);
  } else if (input instanceof URL) {
    return new URL(getRelativeUrl(input), serverRequestOrigin);
  } else if (input instanceof Request) {
    return new URL(getRelativeUrl(new URL(input.url)), serverRequestOrigin);
  }
  throw new TypeError("Invalid input type for constructServerUrl");
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
