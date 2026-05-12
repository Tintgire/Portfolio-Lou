import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Anton, JetBrains_Mono } from 'next/font/google';
import { GsapProvider } from '@/components/motion/GsapProvider';
import { LenisProvider } from '@/components/motion/LenisProvider';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { AmbientAudio } from '@/components/ui/AmbientAudio';
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
            <LenisProvider>
              <LoadingScreen />
              {/* Sits behind the nav, in front of the page. Provides
                  consistent contrast for the cream nav links on light
                  pages (the About page portrait is mostly skin-tones)
                  while staying invisible on bg-jet pages — darkening
                  100% black with 55% black is still 100% black. */}
              <div
                aria-hidden
                className="from-jet/55 via-jet/20 pointer-events-none fixed inset-x-0 top-0 z-40 h-28 bg-gradient-to-b to-transparent"
              />
              <Nav locale={locale} />
              {children}
              <Footer locale={locale} />
              <AmbientAudio src="/audio/cyberpunk.mp3" volume={0.35} />
            </LenisProvider>
          </GsapProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
