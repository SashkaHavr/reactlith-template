import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useFormatter, useNow, useTranslations } from 'use-intl';

import { LocaleSwitcher } from '~/components/intl/locale-switcher';
import { ThemeToggle } from '~/components/theme/theme-toggle';
import { useAuth } from '~/lib/route-context-hooks';
import { useTRPC } from '~/lib/trpc';

export const Route = createFileRoute('/{-$locale}/_layout')({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const t = useTranslations('index');
  const format = useFormatter();

  const auth = useAuth();
  const trpcHealth = useQuery(trpc.health.queryOptions());

  const now = useNow({ updateInterval: 1000 });

  return (
    <div className="flex w-full flex-col items-center gap-8 pt-20">
      <div className="flex w-100 flex-col items-center">
        <div className="flex w-fit flex-col gap-4">
          <div className="flex gap-3">
            <p className="self-center text-xl">{t('works')}</p>
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
          <p>
            {t('trpc-health-response')}:{' '}
            <span
              className={
                trpcHealth.isSuccess ? 'text-green-500' : 'text-red-500'
              }
            >
              {trpcHealth.data ?? t('undefined')}
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
            {t('now-is')}: {format.dateTime(now, 'full')}
          </p>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
