import { defineErrorCatalog } from "evlog";

export const numberErrors = defineErrorCatalog("numbers", {
  NOT_FOUND: {
    message: "Number not found",
    trpcCode: "NOT_FOUND",
  },
  ADD_FAILED: {
    message: "Failed to add number",
    trpcCode: "INTERNAL_SERVER_ERROR",
  },
  MAX_COUNT_REACHED: {
    message: "Max numbers count is 10",
    trpcCode: "BAD_REQUEST",
  },
});
