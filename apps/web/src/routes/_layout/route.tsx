import { useAtomSuspense } from "@effect/atom-react";
import {
  ClientOnly,
  createFileRoute,
  Outlet,
  useHydrated,
  useRouteContext,
} from "@tanstack/react-router";
import { MoonIcon, SunIcon } from "lucide-react";
import { useFormatter, useNow, useTranslations } from "use-intl";

import { isLocale } from "@reactlith-template/utils/intl";
import { useTheme } from "~/components/theme/context";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select";
import { preloadAtom } from "~/lib/atom";
import { localeToString, useSetLocale } from "~/lib/intl";
import { healthAtom } from "~/queries";

export const Route = createFileRoute("/_layout")({
  loader: async ({ context: { atomRegistry } }) => {
    await preloadAtom(atomRegistry, healthAtom);
  },
  component: RouteComponent,
});

function ThemeSwitcher() {
  const theme = useTheme();
  const hydrated = useHydrated();

  return (
    <>
      {(!hydrated || theme.resolvedTheme === "light") && (
        <Button className="dark:hidden" onClick={() => theme.setTheme("dark")}>
          <MoonIcon />
          <span>Dark mode</span>
        </Button>
      )}
      {(!hydrated || theme.resolvedTheme === "dark") && (
        <Button className="hidden dark:inline-flex" onClick={() => theme.setTheme("light")}>
          <SunIcon />
          <span>Light mode</span>
        </Button>
      )}
    </>
  );
}

function LocaleSwitcher() {
  const locale = useRouteContext({
    from: "__root__",
    select: (s) => s.intl.locale,
  });
  const setLocale = useSetLocale();

  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        if (isLocale(value)) {
          void setLocale(value);
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
  );
}

function RouteComponent() {
  const t = useTranslations("index");
  const format = useFormatter();

  useAtomSuspense(healthAtom);

  const now = useNow({ updateInterval: 1000 });

  return (
    <div className="flex w-full flex-col items-center gap-8 pt-20">
      <div className="flex w-100 flex-col items-center">
        <div className="flex w-fit flex-col gap-4">
          <div className="flex gap-3">
            <p className="self-center font-heading text-xl">{t("works")}</p>
            <ThemeSwitcher />
            <LocaleSwitcher />
          </div>
          <p className="text-green-500">{t("api-health-response")}</p>
          <p>
            {t("time-now")}: <ClientOnly>{format.dateTime(now, "full")}</ClientOnly>
          </p>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
