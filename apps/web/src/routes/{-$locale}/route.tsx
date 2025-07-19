import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { getIntlContext, isLocale } from '@reactlith-template/intl';

import { ThemeProvider } from '~/components/theme/theme-provider';
import { IntlProvider } from '~/lib/intl';

export const Route = createFileRoute('/{-$locale}')({
  beforeLoad: async ({ params }) => {
    if (params.locale && !isLocale(params.locale)) {
      throw redirect({ to: '/{-$locale}', params: { locale: undefined } });
    }

    const intlContext = await getIntlContext(params.locale);
    return { ...intlContext };
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
