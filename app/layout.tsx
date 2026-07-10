import type { Metadata } from 'next';
import './globals.css';
import ReduxProvider from '@/stores/provider';
import { Toaster } from 'sonner';
import { AppProviders } from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: 'Pearl Detergent DWMS',
  description: 'Detergent wholesale management system',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ReduxProvider>
          <AppProviders>
            <Toaster position="top-right" richColors closeButton />
            {children}
          </AppProviders>
        </ReduxProvider>
      </body>
    </html>
  );
}
