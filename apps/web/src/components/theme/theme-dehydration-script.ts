import { matchSystemTheme, useThemeStore } from './use-theme';

function getRealTheme() {
  const theme = useThemeStore.getState().theme;
  return matchSystemTheme(theme);
}

function setRealTheme() {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  const realTheme = getRealTheme();
  root.classList.add(realTheme);
}

setRealTheme();
