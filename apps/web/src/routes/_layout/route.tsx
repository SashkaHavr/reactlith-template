import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useHydrated,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { m } from "@reactlith-template/intl/messages";
import { isLocale, setLocale } from "@reactlith-template/intl/runtime";
import type { Locale } from "@reactlith-template/intl/runtime";
import { useTheme } from "~/components/theme/context";
import { Button } from "~/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "~/components/ui/select";
import { api } from "~/lib/query";

export const Route = createFileRoute("/_layout")({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(api.index.health.queryOptions());
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

const localeToString: Record<Locale, string> = {
  en: "English",
  uk: "Українська",
};

function LocaleSwitcher() {
  const locale = useRouteContext({ from: "__root__", select: (r) => r.locale });
  const router = useRouter();

  return (
    <Select
      value={locale}
      onValueChange={(value) => {
        if (isLocale(value)) {
          void (async () => {
            await setLocale(value, { reload: false });
            await router.invalidate();
          })();
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
  // const t = useTranslations("index");
  // const format = useFormatter();

  const health = useSuspenseQuery(api.index.health.queryOptions());

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const hydrated = useHydrated();

  // Intl.DateTimeFormat("en", {timeStyle: ""})

  return (
    <div className="flex w-full flex-col items-center gap-8 pt-20">
      <div className="flex w-100 flex-col items-center">
        <div className="flex w-fit flex-col gap-4">
          <div className="flex gap-3">
            <p className="self-center font-heading text-xl">{m.works()}</p>
            <ThemeSwitcher />
            <LocaleSwitcher />
          </div>
          <p className={health.isSuccess ? "text-green-500" : "text-red-500"}>
            {m.api_health_response()}
          </p>
          <p>{hydrated ? m.time_now({ date: now }) : m.server_rendered()}</p>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
