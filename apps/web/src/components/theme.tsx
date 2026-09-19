import { environmentManager } from "@tanstack/react-query";
import { ScriptOnce, useHydrated, useRouteContext, useRouter } from "@tanstack/react-router";
import { useEffect, useEffectEvent } from "react";

export function syncMetaThemeColor() {
  const html = document.documentElement;
  const updateMetaThemeColor = () => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.append(meta);
    }
    const themeColor = getComputedStyle(html).getPropertyValue("--theme-color").trim();
    meta.setAttribute("content", themeColor);
  };
  new MutationObserver(updateMetaThemeColor).observe(html, {
    attributes: true,
    attributeFilter: ["class"],
  });
  updateMetaThemeColor();
}

function getDarkThemeMediaQuery() {
  return window.matchMedia("(prefers-color-scheme: dark)");
}

export type Theme = "light" | "dark";

export function useTheme() {
  const hydrated = useHydrated();
  return useRouteContext({
    from: "__root__",
    select: (s) => (hydrated ? s.theme! : undefined),
  });
}

function getSystemTheme(): Theme {
  return getDarkThemeMediaQuery().matches ? "dark" : "light";
}

function getSavedTheme(): Theme | undefined {
  const theme = localStorage.getItem("theme");
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  return undefined;
}

export function getTheme(): Theme | undefined {
  if (environmentManager.isServer()) return undefined;
  return getSavedTheme() ?? getSystemTheme();
}

export function useSetTheme() {
  const router = useRouter();
  return async (newTheme: Theme) => {
    if (newTheme === getSystemTheme()) {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", newTheme);
    }
    await router.invalidate();
  };
}

export function useSyncTheme() {
  const router = useRouter();
  const handleMediaQuery = useEffectEvent(() => {
    void router.invalidate();
  });

  useEffect(() => {
    const media = getDarkThemeMediaQuery();
    media.addEventListener("change", handleMediaQuery);
    handleMediaQuery();
    return () => media.removeEventListener("change", handleMediaQuery);
  }, []);
}

export function ThemeScript() {
  return (
    <ScriptOnce>
      {`${getSavedTheme.toString()}
        ${getDarkThemeMediaQuery.toString()}
        ${getSystemTheme.toString()}
        (${(() => document.documentElement.classList.add(getSavedTheme() ?? getSystemTheme())).toString()})()`}
    </ScriptOnce>
  );
}
