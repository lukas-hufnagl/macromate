/**
 * i18n Store – Sprachverwaltung
 */
import { create } from 'zustand';
import translations, { type Locale } from '../i18n/translations';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  locale: (localStorage.getItem('macromate-locale') as Locale) || 'de',

  setLocale: (locale) => {
    localStorage.setItem('macromate-locale', locale);
    document.documentElement.lang = locale;
    set({ locale });
  },

  t: (key: string) => {
    const { locale } = get();
    const dict = translations[locale] as Record<string, string>;
    return dict[key] ?? key;
  },
}));
