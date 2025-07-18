import { useRouteContext } from '@tanstack/react-router';

export function useRootRouteContext() {
  return useRouteContext({ from: '__root__' });
}

export function useAuth() {
  return useRootRouteContext().auth;
}

export function useLocaleRouteContext() {
  return useRouteContext({ from: '/_main/{-$locale}' });
}

export function useLoggedInAuth() {
  const auth = useRootRouteContext().auth;
  if (!auth.isLoggedIn) {
    throw new Error('Auth is not defined');
  }
  return useRootRouteContext().auth;
}
