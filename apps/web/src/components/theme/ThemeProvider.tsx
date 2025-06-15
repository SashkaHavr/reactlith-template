import type { ReactNode } from 'react';
import { useEffect } from 'react';

import { useRealTheme } from './useTheme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const realTheme = useRealTheme();
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(realTheme);
  }, [realTheme]);
  return children;
}
