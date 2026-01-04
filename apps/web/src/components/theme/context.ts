import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import { createContext, use } from "react";

import { getClientCookie, setClientCookie } from "~/utils/cookie";

export type ResolvedTheme = "light" | "dark";
export type Theme = ResolvedTheme | "system";

const themeCookieName = "theme";

export interface ThemeContextData {
  theme: Theme;
  setTheme: (theme: ResolvedTheme) => void;
  resolvedTheme: ResolvedTheme;
}

export const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export function useTheme() {
  const data = use(ThemeContext);

  return (
    data ?? {
      theme: "system" as Theme,
      setTheme: () => {
        /* empty */
      },
      resolvedTheme: "light" as ResolvedTheme,
    }
  );
}

export const getTheme = createIsomorphicFn()
  .server((): Theme => {
    const theme = getCookie(themeCookieName);
    if (theme === "light" || theme === "dark") {
      return theme;
    }
    return "system";
  })
  .client((): Theme => {
    const theme = getClientCookie(themeCookieName);
    if (theme === "light" || theme === "dark") {
      return theme;
    }
    return "system";
  });

export function setThemeCookie(theme: ResolvedTheme) {
  setClientCookie(themeCookieName, theme);
}
