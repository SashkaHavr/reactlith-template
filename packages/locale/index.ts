import type { Locale, NamespaceKeys, NestedKeyOf } from 'use-intl';
import { createTranslator } from 'use-intl';

import type baseMessages from './messages/en.json';

export const locales = ['en', 'uk'] as const;
export const defaultLocale: (typeof locales)[number] = 'uk';
export type BaseMessages = typeof baseMessages;
export function isLocale(locale: string | undefined | null): locale is Locale {
  return !!locale && (locales as readonly string[]).includes(locale);
}

declare module 'use-intl' {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: BaseMessages;
  }
}

export async function getMessages(locale: Locale) {
  switch (locale) {
    case 'en':
      return (await import(`./messages/en.json`)) as unknown as BaseMessages;
    case 'uk':
      return (await import(`./messages/uk.json`)) as unknown as BaseMessages;
  }
}

export async function getZodLocale(locale: Locale) {
  switch (locale) {
    case 'en':
      return (await import(`zod/v4/locales/en.js`)).default;
    case 'uk':
      return (await import(`zod/v4/locales/ua.js`)).default;
  }
}

const existingTranslators = new Map<Locale, unknown>();

export function getTranslator<
  Namespace extends NamespaceKeys<
    BaseMessages,
    NestedKeyOf<BaseMessages>
  > = never,
>(params: Parameters<typeof createTranslator<BaseMessages, Namespace>>[0]) {
  const t = existingTranslators.get(params.locale) as
    | ReturnType<typeof createTranslator<BaseMessages, Namespace>>
    | undefined;
  if (t) return t;
  const newT = createTranslator<BaseMessages, Namespace>(params);
  existingTranslators.set(params.locale, newT);
  return newT;
}

export const localeHeader = 'reactlith-template-Locale';
