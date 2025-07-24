import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import {
  defaultLocale,
  getIntlContext,
  getTranslator,
  isLocale,
} from '@reactlith-template/intl';

import { IntlProvider } from '~/lib/intl';

export const Route = createFileRoute('/{-$locale}')({
  ssr: 'data-only',
  beforeLoad: async ({ params }) => {
    if (params.locale && !isLocale(params.locale)) {
      throw redirect({ to: '/{-$locale}', params: { locale: undefined } });
    }
    const intl = await getIntlContext(params.locale);
    if (intl.locale != params.locale && intl.locale != defaultLocale) {
      throw redirect({
        to: '/{-$locale}',
        params: { locale: intl.locale },
      });
    }
    const t = getTranslator(intl);
    return {
      intl,
      loadingText: t('loading'),
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <IntlProvider>
      <Outlet />
    </IntlProvider>
  );
}
