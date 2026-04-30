'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultLocale, getDictionary, isLocale, locales, type Dictionary, type Locale } from '@/i18n/config';

type TranslationKey = string;

type I18nContextValue = {
  locale: Locale;
  locales: typeof locales;
  dictionary: Dictionary;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, fallback?: string) => string;
};

const STORAGE_KEY = 'dwms_locale';
const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLocale(stored) ? stored : defaultLocale;
}

function getNestedValue(source: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((value, part) => {
    if (value && typeof value === 'object' && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, source);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  useEffect(() => {
    const current = locales.find((item) => item.code === locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = current?.dir ?? 'ltr';
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const dictionary = useMemo(() => getDictionary(locale), [locale]);

  const t = useCallback(
    (key: TranslationKey, fallback?: string) => {
      const translated = getNestedValue(dictionary, key);
      if (typeof translated === 'string') return translated;

      const defaultTranslated = getNestedValue(getDictionary(defaultLocale), key);
      if (typeof defaultTranslated === 'string') return defaultTranslated;

      return fallback ?? key;
    },
    [dictionary],
  );

  const value = useMemo(
    () => ({ locale, locales, dictionary, setLocale, t }),
    [dictionary, locale, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }
  return context;
}
