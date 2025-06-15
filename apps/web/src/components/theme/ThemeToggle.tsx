import type { VariantProps } from 'class-variance-authority';
import { MoonIcon, SunIcon } from 'lucide-react';

import type { buttonVariants } from '../ui/button';
import { Button } from '../ui/button';
import { useRealTheme, useThemeStore } from './useTheme';

export function ThemeToggle(
  props: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    },
) {
  const realTheme = useRealTheme();
  const { setTheme } = useThemeStore();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(realTheme == 'light' ? 'dark' : 'light')}
      {...props}
    >
      {realTheme == 'light' ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
