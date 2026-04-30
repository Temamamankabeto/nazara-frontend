'use client';

import { ReactQueryProvider } from "./react-query-provider";
import { I18nProvider } from "@/i18n";


export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
      <I18nProvider><ReactQueryProvider>{children}</ReactQueryProvider></I18nProvider>
  );
}
