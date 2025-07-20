import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light' | 'system';
export type RealTheme = 'dark' | 'light';

interface State {
  theme: Theme;
}
interface Actions {
  setTheme: (theme: Theme) => void;
  reset: () => void;
}

const defaultState: State = {
  theme: 'system',
};

export const useThemeStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...defaultState,
      setTheme: (theme) => set({ theme: theme }),
      reset: () => set(defaultState),
    }),
    { name: 'ui-theme' },
  ),
);

export function matchSystemTheme(theme: Theme) {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return theme == 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : theme;
}

export function useRealTheme() {
  const theme = useThemeStore((state) => state.theme);
  return matchSystemTheme(theme);
}
