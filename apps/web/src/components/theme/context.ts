import { createContext, use } from "react";

import { getCookie, setCookie } from "~/utils/cookie";

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

export async function getTheme(): Promise<Theme> {
  const theme = await getCookie(themeCookieName);
  if (theme === "light" || theme === "dark") {
    return theme;
  }
  return "system";
}

export async function setThemeCookie(theme: ResolvedTheme) {
  await setCookie(themeCookieName, theme);
}
