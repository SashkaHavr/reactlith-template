import { ScriptOnce, useRouteContext, useRouter } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { useEffect, useEffectEvent } from "react";

import { deleteCookie, getCookie, setCookie } from "~/utils/cookie";

function updateMetaThemeColor() {
  const themeColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--theme-color")
    .trim();
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
}

function getDarkThemeMediaQuery() {
  return window.matchMedia("(prefers-color-scheme: dark)");
}

export type Theme = "light" | "dark";

export function useTheme() {
  return useRouteContext({ from: "__root__", select: (s) => s.theme.theme as Theme });
}

const getSystemTheme = createIsomorphicFn()
  .server(() => {
    return "light" as const;
  })
  .client(() => {
    return getDarkThemeMediaQuery().matches ? "dark" : "light";
  });

const themeCookieName = "theme";

export async function getThemeCookie() {
  const theme = await getCookie(themeCookieName);
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  return undefined;
}

export async function getTheme() {
  return (await getThemeCookie()) ?? getSystemTheme();
}

export function useSetTheme() {
  const router = useRouter();
  return async (newTheme: Theme) => {
    if (newTheme === getSystemTheme()) {
      await deleteCookie(themeCookieName);
    } else {
      await setCookie(themeCookieName, newTheme);
    }
    await router.invalidate();
    updateMetaThemeColor();
  };
}

export function ThemeScript() {
  const router = useRouter();
  const { themeCookieExists } = useRouteContext({
    from: "__root__",
    select: (s) => ({ themeCookieExists: s.theme.themeCookieExists }),
  });
  const handleMediaQuery = useEffectEvent(() => {
    void router.invalidate();
    updateMetaThemeColor();
  });

  useEffect(() => {
    const media = getDarkThemeMediaQuery();
    media.addEventListener("change", handleMediaQuery);
    handleMediaQuery();
    return () => media.removeEventListener("change", handleMediaQuery);
  }, []);

  return (
    <ScriptOnce>
      {`(${((themeCookieExists: boolean) => {
        if (!themeCookieExists) {
          document.documentElement.classList.toggle(
            "dark",
            window.matchMedia("(prefers-color-scheme: dark)").matches,
          );
        }
        const themeColor = getComputedStyle(document.documentElement)
          .getPropertyValue("--theme-color")
          .trim();
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
      }).toString()})(${themeCookieExists})`}
    </ScriptOnce>
  );
}
