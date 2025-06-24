import type { Locale } from 'use-intl';

import { locales } from '@reactlith-template/locale';

import { getLocale } from '~/lib/intl';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useLocaleStore } from './use-locale-store';

const localeToText: Record<Locale, string> = {
  en: 'English',
  uk: 'Українська',
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocaleStore();

  return (
    <Select
      value={getLocale(locale)}
      onValueChange={(e) => {
        setLocale(e as Locale);
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
