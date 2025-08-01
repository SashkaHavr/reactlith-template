import type { Locale } from 'use-intl';
import z from 'zod';

import type baseMessages from '../messages/en.json';

export const defaultLocale: (typeof locales)[number] = 'en';
type BaseMessages = typeof baseMessages;
export const locales = ['en', 'uk'] as const;
export function isLocale(locale: unknown): locale is Locale {
  return (
    typeof locale == 'string' && (locales as readonly string[]).includes(locale)
  );
}

declare module 'use-intl' {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: BaseMessages;
  }
}

async function getMessages(locale: Locale) {
  switch (locale) {
    case 'en':
      return (await import(`../messages/en.json`)) as unknown as BaseMessages;
    case 'uk':
      return (await import(`../messages/uk.json`)) as unknown as BaseMessages;
  }
}

async function getZodLocale(locale: Locale) {
  switch (locale) {
    case 'en':
      return (await import(`zod/v4/locales/en.js`)).default;
    case 'uk':
      return (await import(`zod/v4/locales/ua.js`)).default;
  }
}

function getLocale(localeRouteParam: string | undefined): Locale {
  if (isLocale(localeRouteParam)) {
    return localeRouteParam;
  }
  return defaultLocale;
}

export async function getIntlContext(localeRouteParam: string | undefined) {
  const locale = getLocale(localeRouteParam);
  const messages = await getMessages(locale);
  z.config((await getZodLocale(locale))());
  return {
    locale: locale,
    messages: messages,
  };
}

export const localeHeader = 'reactlith-template-Locale';
