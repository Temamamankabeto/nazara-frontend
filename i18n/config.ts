import en from '@/locales/en.json';
import am from '@/locales/am.json';
import om from '@/locales/om.json';

export const defaultLocale = 'en' as const;

export const dictionaries = {
  en,
  am,
  om,
} as const;

export const locales = [
  { code: 'en', label: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'am', label: 'Amharic', nativeName: 'አማርኛ', dir: 'ltr' },
  { code: 'om', label: 'Afaan Oromo', nativeName: 'Afaan Oromo', dir: 'ltr' },
] as const;

export type Locale = keyof typeof dictionaries;
export type Dictionary = (typeof dictionaries)[Locale];

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && value in dictionaries;
}

export function getDictionary(locale: Locale = defaultLocale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
