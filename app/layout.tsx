import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/stores/provider';
import { Toaster } from 'sonner';
import { AppProviders } from '@/providers/AppProviders';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pearl Detergent DWMS',
  description: 'Detergent wholesale management system',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
