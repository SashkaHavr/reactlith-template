import { HttpApiMiddleware } from "effect/unstable/httpapi";

export class GlobalMiddleware extends HttpApiMiddleware.Service<GlobalMiddleware>()(
  "api/GlobalMiddleware",
) {}
