import { useSuspenseQuery } from '@tanstack/react-query';
import {
  ClientOnly,
  createFileRoute,
  Outlet,
  useHydrated,
  useRouteContext,
} from '@tanstack/react-router';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useFormatter, useNow, useTranslations } from 'use-intl';

import { isLocale } from '@reactlith-template/intl';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select';

import { useTheme } from '~/components/theme/context';
import { useAuth } from '~/hooks/route-context';
import { localeToString, useSetLocale } from '~/lib/intl-server';
import { useTRPC } from '~/lib/trpc';
import { getHealthCheckServerFn } from '~/lib/trpc-server';

export const Route = createFileRoute('/_layout')({
  loader: async ({ context: { trpc, queryClient } }) => {
    await queryClient.ensureQueryData({
      queryKey: trpc.health.queryKey(),
      queryFn: () => getHealthCheckServerFn(),
    });
  },
  component: RouteComponent,
});

function ThemeSwitcher() {
  const theme = useTheme();
  const hydrated = useHydrated();

  return (
    <>
      {(!hydrated || theme.resolvedTheme === 'light') && (
        <Button className="dark:hidden" onClick={() => theme.setTheme('dark')}>
          <MoonIcon />
          <span>Dark mode</span>
        </Button>
      )}
      {(!hydrated || theme.resolvedTheme === 'dark') && (
        <Button
          className="hidden dark:inline-flex"
          onClick={() => theme.setTheme('light')}
        >
          <SunIcon />
          <span>Light mode</span>
        </Button>
      )}
    </>
  );
}

function LocaleSwitcher() {
  const locale = useRouteContext({
    from: '__root__',
    select: (s) => s.intl.locale,
  });
  const setLocale = useSetLocale();

  return (
    <>
      <Select
        value={locale}
        onValueChange={(value) => {
          if (isLocale(value)) {
            setLocale(value);
          }
        }}
      >
        <SelectTrigger>
          <span>{localeToString[locale]}</span>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(localeToString).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

function RouteComponent() {
  const trpc = useTRPC();
  const t = useTranslations('index');
  const format = useFormatter();

  const auth = useAuth();
  const trpcHealth = useSuspenseQuery(trpc.health.queryOptions());

  const now = useNow({ updateInterval: 1000 });

  return (
    <div className="flex w-full flex-col items-center gap-8 pt-20">
      <div className="flex w-100 flex-col items-center">
        <div className="flex w-fit flex-col gap-4">
          <div className="flex gap-3">
            <p className="self-center text-xl">{t('works')}</p>
            <ThemeSwitcher />
            <LocaleSwitcher />
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
            {t('now-is')}:{' '}
            <ClientOnly>{format.dateTime(now, 'full')}</ClientOnly>
          </p>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
