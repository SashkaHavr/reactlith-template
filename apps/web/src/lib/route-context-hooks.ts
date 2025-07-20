import { useRouteContext } from '@tanstack/react-router';

export function useRootRouteContext() {
  return useRouteContext({ from: '/{-$locale}' });
}

export function useAuth() {
  return useRootRouteContext().auth;
}

export function useLoggedInAuth() {
  const auth = useRootRouteContext().auth;
  if (!auth.loggedIn) {
    throw new Error('Auth is not defined');
  }
  return auth;
}
