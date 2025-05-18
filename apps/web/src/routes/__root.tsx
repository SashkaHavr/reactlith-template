import { createRootRoute, Navigate, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <Navigate to="/" />,
});

function RootComponent() {
  return <Outlet />;
}
