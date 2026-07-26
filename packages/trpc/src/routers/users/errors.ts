import { defineErrorCatalog } from "evlog";

export const userErrors = defineErrorCatalog("users", {
  NOT_FOUND: {
    message: "User not found",
    status: 404,
  },
});

declare module "evlog" {
  interface RegisteredErrorCatalogs {
    users: typeof userErrors;
  }
}
