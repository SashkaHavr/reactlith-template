import type { Formats, Locale } from 'use-intl';
import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';

import type baseMessages from '@reactlith-template/locale/en';
import { defaultLocale, locales } from '@reactlith-template/locale';

import {
  localeStoreName,
  useLocaleStore,
} from '~/components/locale/use-locale-store';

export type BaseMessages = typeof baseMessages;

export function getLocale(localeFromStore: Locale | undefined): Locale {
  if (localeFromStore && !locales.includes(localeFromStore)) {
    localStorage.removeItem(localeStoreName);
    return defaultLocale;
  }
  if (localeFromStore) return localeFromStore;
  const prefferedLocales = navigator.languages.filter((l) =>
    locales.includes(l as Locale),
  ) as Locale[];
  const firstPrefferedLocale = prefferedLocales[0];
  if (firstPrefferedLocale) {
    return firstPrefferedLocale;
  }
  return defaultLocale;
}

export function useLocaleSync() {
  const router = useRouter();
  const locale = useLocaleStore((state) => state.locale);
  useEffect(() => {
    document.documentElement.lang = getLocale(locale);
    void router.invalidate();
  }, [locale, router]);
}

export const formats = {
  dateTime: {
    full: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    },
  },
} satisfies Formats;
