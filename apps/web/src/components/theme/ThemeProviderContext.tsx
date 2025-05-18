import { createContext } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type RealTheme = 'dark' | 'light';

export interface ThemeProviderState {
  theme: Theme;
  realTheme: RealTheme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  realTheme: 'light',
  setTheme: () => null,
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);
