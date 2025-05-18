import { useContext } from 'react';

import type { ThemeProviderState } from './ThemeProviderContext';
import { ThemeProviderContext } from './ThemeProviderContext';

export const useTheme = () => {
  return useContext<ThemeProviderState>(ThemeProviderContext);
};
