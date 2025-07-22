import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import {
  defaultLocale,
  getIntlContext,
  getTranslator,
  isLocale,
} from '@reactlith-template/intl';
import { LoadingSpinner } from '~/components/ui/loading';

import { getAuthContext } from '~/lib/auth';
import { IntlProvider } from '~/lib/intl';

export const Route = createFileRoute('/{-$locale}')({
  ssr: 'data-only',
  pendingComponent: PendingComponent,
  beforeLoad: async ({ params, context: { queryClient } }) => {
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
      auth: await getAuthContext(queryClient),
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

function PendingComponent() {
  const loadingText = Route.useRouteContext({
    select: (s) => s.loadingText,
  });

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-1 pb-20">
      <LoadingSpinner />
      <p className="text-lg">{loadingText}</p>
    </div>
  );
}
