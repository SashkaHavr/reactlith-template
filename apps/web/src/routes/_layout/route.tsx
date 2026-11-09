import { createFileRoute, Outlet, useHydrated, useRouter } from "@tanstack/react-router";
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { m } from "@reactlith-template/intl/messages";
import { getLocale, isLocale, localizeUrl, setLocale } from "@reactlith-template/intl/runtime";
import type { Locale } from "@reactlith-template/intl/runtime";
import { useSetTheme, useTheme } from "~/components/theme";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select";

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
});

function ThemeSwitcher() {
  const theme = useTheme();
  const hydrated = useHydrated();
  const setTheme = useSetTheme();

  return (
    <>
      {(!hydrated || theme === "light") && (
        <Button className="dark:hidden" variant="outline" onClick={() => void setTheme("dark")}>
          <MoonIcon />
          <span>{m.example_darkMode()}</span>
        </Button>
      )}
      {(!hydrated || theme === "dark") && (
        <Button
          className="hidden dark:inline-flex"
          variant="outline"
          onClick={() => void setTheme("light")}
        >
          <SunIcon />
          <span>{m.example_lightMode()}</span>
        </Button>
      )}
    </>
  );
}

const localeToString: Record<Locale, string> = {
  en: "English",
  uk: "Українська",
};

function LocaleSwitcher() {
  const router = useRouter();

  return (
    <Select
      value={getLocale()}
      onValueChange={(value) => {
        if (isLocale(value)) {
          void (async () => {
            await setLocale(value);
            const url = localizeUrl(window.location.href, { locale: value });
            router.history.replace(
              `${url.pathname}${url.search}${url.hash}`,
              router.history.location.state,
            );
          })();
        }
      }}
    >
      <SelectTrigger className="w-fit">
        <span>{localeToString[getLocale()]}</span>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(localeToString).map(([key, label]) => (
          <SelectItem key={key} value={key}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const initialNow = Date.now();

function RouteComponent() {
  const hydrated = useHydrated();
  const [now, setNow] = useState(initialNow);
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(getLocale(), {
        dateStyle: "long",
        timeStyle: "medium",
      }),
    [],
  );
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-8 px-4 pt-20 pb-8">
      <div className="flex w-full flex-col items-center">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap justify-center gap-3">
            <p className="self-center font-heading text-xl">{m.example_works()}</p>
            <ThemeSwitcher />
            <LocaleSwitcher />
          </div>
          <p>
            {m.example_timeNow()}: {hydrated && dateFormatter.format(now)}
          </p>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
