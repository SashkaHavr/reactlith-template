import type { Locale } from "use-intl";

export const defaultLocale: (typeof locales)[number] = "en";
export const locales = ["en"] as const;

export function isLocale(locale: string | undefined | null): locale is Locale {
  return typeof locale === "string" && (locales as readonly string[]).includes(locale);
}

export function parseLocale(localeOptional: string | undefined): Locale {
  if (isLocale(localeOptional)) {
    return localeOptional;
  }
  return defaultLocale;
}

declare module "use-intl" {
  interface AppConfig {
    Locale: (typeof locales)[number];
  }
}

export const localeCookieName = "locale";
