'use client';

import { Check, Languages } from 'lucide-react';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useI18n, type Locale } from '@/i18n';

export function LanguageSwitcher() {
  const { locale, locales, setLocale, t } = useI18n();

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
        <Languages className="h-4 w-4" />
        {t('common.language', 'Language')}
      </DropdownMenuLabel>
      {locales.map((item) => (
        <DropdownMenuItem
          key={item.code}
          onClick={() => setLocale(item.code as Locale)}
          className="flex items-center justify-between"
        >
          <span>{item.nativeName}</span>
          {locale === item.code ? <Check className="h-4 w-4" /> : null}
        </DropdownMenuItem>
      ))}
    </>
  );
}
