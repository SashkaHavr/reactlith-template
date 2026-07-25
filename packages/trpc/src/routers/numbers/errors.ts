import { defineErrorCatalog } from "evlog";

export const numberErrors = defineErrorCatalog("numbers", {
  NOT_FOUND: {
    message: "Number not found",
    status: 404,
  },
  ADD_FAILED: {
    message: "Failed to add number",
    status: 500,
  },
  MAX_COUNT_REACHED: {
    message: "Max numbers count is 10",
    status: 400,
  },
});

declare module "evlog" {
  interface RegisteredErrorCatalogs {
    numbers: typeof numberErrors;
  }
}
