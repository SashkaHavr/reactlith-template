import { apiQueryOptions } from "./utils";

export function healthQueryOptions() {
  return apiQueryOptions({ group: "index", endpoint: "health" });
}
