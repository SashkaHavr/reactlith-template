import { useEffect, useEffectEvent, useState } from 'react';
import { ScriptOnce, useRouteContext, useRouter } from '@tanstack/react-router';
import { createIsomorphicFn } from '@tanstack/react-start';

import type { ResolvedTheme } from './context';
import { setThemeCookie, ThemeContext } from './context';

const MEDIA = '(prefers-color-scheme: dark)';

const getSystemTheme = createIsomorphicFn()
  .server((_e?: MediaQueryListEvent | MediaQueryList) => {
    return 'light' as const;
  })
  .client((e?: MediaQueryListEvent | MediaQueryList) => {
    return (e ?? window.matchMedia(MEDIA)).matches ? 'dark' : 'light';
  });

function updateMetaThemeColor() {
  const themeColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--theme-color')
    .trim();
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', themeColor);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const savedTheme = useRouteContext({
    from: '__root__',
    select: (s) => s.theme,
  });
  const setSavedTheme = (newTheme: ResolvedTheme) => {
    setThemeCookie(newTheme);
    void router.invalidate().then(() => {
      updateMetaThemeColor();
    });
  };

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');

  const handleMediaQuery = useEffectEvent(
    (e: MediaQueryListEvent | MediaQueryList) => {
      if (savedTheme !== 'system') return;
      const systemTheme = getSystemTheme(e);
      setSystemTheme(systemTheme);
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
      updateMetaThemeColor();
    },
  );

  useEffect(() => {
    const media = window.matchMedia(MEDIA);
    media.addEventListener('change', handleMediaQuery);
    handleMediaQuery(media);
    return () => media.removeEventListener('change', handleMediaQuery);
  }, []);

  const resolvedTheme = savedTheme === 'system' ? systemTheme : savedTheme;

  return (
    <ThemeContext
      value={{ theme: savedTheme, setTheme: setSavedTheme, resolvedTheme }}
    >
      {children}
    </ThemeContext>
  );
}

export function ThemeScript() {
  return (
    <ScriptOnce>
      {`(${(() => {
        let mode = 'light';
        const dark = document.documentElement.classList.contains('dark');
        const isSystemTheme =
          !document.documentElement.classList.contains('light') && !dark;
        if (isSystemTheme) {
          mode = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
          document.documentElement.classList.toggle('dark', mode === 'dark');
        } else mode = dark ? 'dark' : 'light';
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute(
            'content',
            getComputedStyle(document.documentElement)
              .getPropertyValue('--theme-color')
              .trim(),
          );
      }).toString()})()`}
    </ScriptOnce>
  );
}
