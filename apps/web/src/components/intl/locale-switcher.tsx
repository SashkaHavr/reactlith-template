import type { Locale } from 'use-intl';
import { useNavigate } from '@tanstack/react-router';

import { locales } from '@reactlith-template/intl';

import { useRootRouteContext } from '~/lib/route-context-hooks';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const localeToText: Record<Locale, string> = {
  en: 'English',
  uk: 'Українська',
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useRootRouteContext().intl.locale;
  const navigate = useNavigate({ from: '/{-$locale}' });
  return (
    <Select
      value={locale}
      onValueChange={(e) => {
        void navigate({ params: { locale: e } });
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {locales.map((l) => (
            <SelectItem key={l} value={l}>
              {localeToText[l]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
