function matchSystemTheme(theme) {
  return theme == 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : theme;
}
function getRealTheme() {
  const themeStateString = localStorage.getItem('ui-theme');
  if (themeStateString) {
    try {
      const theme = JSON.parse(themeStateString);
      if (['light', 'dark', 'system'].includes(theme?.state?.theme)) {
        return matchSystemTheme(theme.state.theme);
      }
    } catch {}
  }
  return matchSystemTheme('system');
}
function setRealTheme() {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  const realTheme = getRealTheme();
  root.classList.add(realTheme);
}
setRealTheme();
