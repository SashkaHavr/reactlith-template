import { useRouteContext } from '@tanstack/react-router';

export function useRootRouteContext() {
  return useRouteContext({ from: '/_rootLayout' });
}

export function useAuth() {
  return useRootRouteContext().auth;
}

export function useIntlRouteContext() {
  return useRouteContext({ from: '/_rootLayout/{-$locale}' });
}

export function useLoggedInAuth() {
  const auth = useRootRouteContext().auth;
  if (!auth.isLoggedIn) {
    throw new Error('Auth is not defined');
  }
  return useRootRouteContext().auth;
}
