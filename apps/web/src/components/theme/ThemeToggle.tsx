import type { VariantProps } from 'class-variance-authority';
import { MoonIcon, SunIcon } from 'lucide-react';

import type { buttonVariants } from '../ui/button';
import { Button } from '../ui/button';
import { useTheme } from './useTheme';

export function ThemeToggle(
  props: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    },
) {
  const { realTheme, setTheme } = useTheme();

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
