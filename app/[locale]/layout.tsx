import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Anton, JetBrains_Mono } from 'next/font/google';
import { GsapProvider } from '@/components/motion/GsapProvider';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { LipstickRoot } from '@/components/three/LipstickRoot';
import { locales, type Locale } from '@/i18n';

export const metadata: Metadata = {
  metadataBase: new URL('https://loustudio.fr'),
};

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${anton.variable} ${jetbrainsMono.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <GsapProvider>
            <LipstickRoot />
            <Nav locale={locale} />
            {children}
            <Footer locale={locale} />
          </GsapProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
