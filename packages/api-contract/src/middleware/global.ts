import { HttpApiMiddleware } from "effect/http-api";

export class GlobalMiddleware extends HttpApiMiddleware.Service<GlobalMiddleware>()(
  "api/GlobalMiddleware",
) {}
