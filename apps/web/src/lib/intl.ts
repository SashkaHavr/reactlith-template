import { useRouteContext, useRouter } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import type { Formats, Locale } from "use-intl";

import { defaultLocale, isLocale, localeCookieName } from "@reactlith-template/utils/intl";
import { getCookie, setCookie } from "~/utils/cookie";

import type baseMessages from "../../messages/en.json";

const getSystemLocale = createIsomorphicFn()
  .server(() => {
    const locales =
      getRequestHeader("accept-language")
        ?.split(",")
        .map((lang) => lang.split(";")[0]) ?? [];
    return locales.find((value) => isLocale(value));
  })
  .client(() => {
    const locales = navigator.languages;
    return locales.find((value) => isLocale(value));
  });

export async function getLocale(): Promise<Locale> {
  const localeFromCookie = await getCookie(localeCookieName);
  if (isLocale(localeFromCookie)) {
    return localeFromCookie;
  }
  return getSystemLocale() ?? defaultLocale;
}

export function useSetLocale() {
  const router = useRouter();

  return async (locale: string) => {
    if (!isLocale(locale)) return;
    await setCookie(localeCookieName, locale);
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
  }
}

export const localeToString: Record<Locale, string> = {
  en: "English",
};

export const intlFormats = {
  dateTime: {
    full: {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    },
  },
} satisfies Formats;

declare module "use-intl" {
  interface AppConfig {
    Messages: BaseMessages;
    Formats: typeof intlFormats;
  }
}
