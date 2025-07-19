import type { Locale, NamespaceKeys, NestedKeyOf } from 'use-intl';
import { createTranslator } from 'use-intl';
import z from 'zod';
import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

import type baseMessages from './messages/en.json';

export const defaultLocale: (typeof locales)[number] = 'uk';
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
      return (await import(`./messages/en.json`)) as unknown as BaseMessages;
    case 'uk':
      return (await import(`./messages/uk.json`)) as unknown as BaseMessages;
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

interface LocaleStore {
  locale: Locale | undefined;
  setLocale: (locale: Locale) => void;
}

const localeStore = createStore<LocaleStore>()(
  persist(
    (set) => ({
      locale: undefined,
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'locale' },
  ),
);

export function setStoredLocale(locale: Locale) {
  localeStore.getState().setLocale(locale);
}

function getLocale(localeRouteParam: string | undefined): Locale {
  if (isLocale(localeRouteParam)) {
    return localeRouteParam;
  }
  const storedLocale = localeStore.getState().locale;
  if (isLocale(storedLocale)) {
    return storedLocale;
  }
  if (
    typeof navigator !== 'undefined' &&
    'languages' in navigator &&
    Array.isArray(navigator.languages)
  ) {
    const prefferedLocales = navigator.languages.filter(isLocale);
    const firstPrefferedLocale = prefferedLocales[0];
    if (firstPrefferedLocale) {
      return firstPrefferedLocale;
    }
  }
  return defaultLocale;
}

export async function getIntlContext(localeRouteParam: string | undefined) {
  const locale = getLocale(localeRouteParam);
  const messages = await getMessages(locale);
  z.config((await getZodLocale(locale))());
  return {
    intl: {
      locale: locale,
      messages: messages,
    },
  };
}

export const localeHeader = 'reactlith-template-Locale';
