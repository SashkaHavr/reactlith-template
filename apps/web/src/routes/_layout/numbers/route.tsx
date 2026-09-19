import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/numbers")({
  beforeLoad: ({ context: { session } }) => {
    if (!session.loggedIn) {
      throw redirect({ to: "/" });
    }
  },
});
