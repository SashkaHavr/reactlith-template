import type { Locale } from 'use-intl';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const localeStoreName = 'locale';

export const useLocaleStore = create<{
  locale: Locale | undefined;
  setLocale: (value: Locale) => void;
}>()(
  persist(
    (set) => ({
      locale: undefined,
      setLocale: (newLocale) => set({ locale: newLocale }),
    }),
    { name: localeStoreName },
  ),
);
