import { useRouteContext } from "@tanstack/react-router";

export function useAuth() {
  return useRouteContext({ from: "__root__", select: (s) => s.auth });
}

export function useLoggedInAuth() {
  const auth = useAuth();
  if (!auth.loggedIn) {
    throw new Error("Auth is not defined");
  }
  return auth;
}
