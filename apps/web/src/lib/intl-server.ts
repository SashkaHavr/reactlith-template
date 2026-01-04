import type { Locale } from "use-intl";

import { defaultLocale, isLocale, localeCookieName } from "@reactlith-template/intl";
import { useRouteContext, useRouter } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie, getRequestHeader } from "@tanstack/react-start/server";

import { getClientCookie, setClientCookie } from "~/utils/cookie";

import type baseMessages from "../../messages/en.json";

export const getLocale = createIsomorphicFn()
  .server(() => {
    const localeFromCookie = getCookie(localeCookieName);
    if (isLocale(localeFromCookie)) {
      return localeFromCookie;
    }

    const locales =
      getRequestHeader("accept-language")
        ?.split(",")
        .map((lang) => lang.split(";")[0]) ?? [];
    return locales.find(isLocale) ?? defaultLocale;
  })
  .client(() => {
    const localeFromCookie = getClientCookie(localeCookieName);
    if (isLocale(localeFromCookie)) {
      return localeFromCookie;
    }

    const locales = navigator.languages;
    return locales.find(isLocale) ?? defaultLocale;
  });

export function useSetLocale() {
  const router = useRouter();

  return (locale: string) => {
    if (!isLocale(locale)) return;
    setClientCookie(localeCookieName, locale);
    void router.invalidate();
  };
}

export function useLocale() {
  return useRouteContext({
    from: "__root__",
    select: (s) => s.intl.locale,
  });
}

type BaseMessages = typeof baseMessages;

export async function getMessages(locale: Locale) {
  switch (locale) {
    case "en":
      return (await import(`../../messages/en.json`)) as unknown as BaseMessages;
    case "uk":
      return (await import(`../../messages/uk.json`)) as unknown as BaseMessages;
  }
}

export const localeToString: Record<Locale, string> = {
  en: "English",
  uk: "Українська",
};

declare module "use-intl" {
  interface AppConfig {
    Messages: BaseMessages;
  }
}
