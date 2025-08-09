import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useFormatter, useNow, useTranslations } from 'use-intl';

import { LocaleSelect } from '~/components/locale-select';
import { ThemeToggle } from '~/components/theme-toggle';
import { useIsClient } from '~/hooks/use-is-client';
import { useAuth } from '~/lib/route-context-hooks';
import { useTRPC } from '~/lib/trpc';
import { healthServerFn } from '~/lib/trpc-server';

export const Route = createFileRoute('/{-$locale}/_layout')({
  loader: async ({ context: { queryClient, trpc } }) => {
    await queryClient.ensureQueryData({
      queryKey: trpc.health.queryKey(),
      queryFn: () => healthServerFn(),
    });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const t = useTranslations('index');
  const format = useFormatter();

  const auth = useAuth();
  const trpcHealth = useSuspenseQuery(trpc.health.queryOptions());

  const now = useNow({ updateInterval: 1000 });
  const isClient = useIsClient();

  return (
    <div className="flex w-full flex-col items-center gap-8 pt-20">
      <div className="flex w-100 flex-col items-center">
        <div className="flex w-fit flex-col gap-4">
          <div className="flex gap-3">
            <p className="self-center text-xl">{t('works')}</p>
            <ThemeToggle />
            <LocaleSelect />
          </div>
          <p>
            {t('trpc-health-response')}:{' '}
            <span
              className={
                trpcHealth.isSuccess ? 'text-green-500' : 'text-red-500'
              }
            >
              {trpcHealth.data}
            </span>
          </p>
          <p>
            {t('auth-status')}:{' '}
            <span
              className={auth.available ? 'text-green-500' : 'text-red-500'}
            >
              {auth.available ? t('available') : t('not-available')}
            </span>
          </p>
          <p>
            {t('now-is')}: {isClient ? format.dateTime(now, 'full') : ''}
          </p>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
