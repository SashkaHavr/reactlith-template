import { Context } from "effect";

import type { LogType } from "@reactlith-template/utils/log";

export class Log extends Context.Service<
  Log,
  {
    readonly set: LogType["set"];
    readonly error: LogType["error"];
    readonly warn: LogType["warn"];
    readonly audit: LogType["audit"];
  }
>()("@reactlith-template/log") {}
