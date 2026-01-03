import { auth } from "@reactlith-template/auth";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

export const authServerFnMiddleware = createMiddleware({
  type: "function",
}).server(({ next }) => {
  return next({
    context: {
      auth: auth.api,
      headers: getRequest().headers,
    },
  });
});

export const getSessionServerFn = createServerFn()
  .middleware([authServerFnMiddleware])
  .handler(async ({ context: { auth, headers } }) => {
    const session = await auth.getSession({ headers });
    return session ? { session: session.session, user: session.user } : null;
  });
