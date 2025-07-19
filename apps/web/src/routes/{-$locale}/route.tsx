import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { getIntlContext, isLocale } from '@reactlith-template/intl';

import { ThemeProvider } from '~/components/theme/theme-provider';
import { getAuthContext } from '~/lib/auth';
import { IntlProvider } from '~/lib/intl';

export const Route = createFileRoute('/{-$locale}')({
  ssr: 'data-only',
  pendingComponent: PendingComponent,
  beforeLoad: async ({ params, context: { queryClient } }) => {
    if (params.locale && !isLocale(params.locale)) {
      throw redirect({ to: '/{-$locale}', params: { locale: undefined } });
    }

    const intlContext = await getIntlContext(params.locale);
    return { ...intlContext, auth: await getAuthContext(queryClient) };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ThemeProvider>
      <IntlProvider>
        <Outlet />
      </IntlProvider>
    </ThemeProvider>
  );
}

function PendingComponent() {
  return <p className="text-4xl">Loading...</p>;
}
