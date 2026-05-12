import dynamic from 'next/dynamic';
import { locales } from '@/i18n';

// 3D scene is a client-only island — Suspense + Canvas don't SSR cleanly
// and there's no SEO benefit to rendering an iPhone on the server.
const IPhone3D = dynamic(() => import('@/components/contact/IPhone3D').then((m) => m.IPhone3D), {
  ssr: false,
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: 'Contact — LOU STUDIO',
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { fr: '/fr/contact', en: '/en/contact' },
    },
  };
}

export default function ContactPage() {
  return (
    <main className="bg-jet text-cream relative min-h-screen overflow-hidden px-6 pt-32 pb-16 md:px-20">
      <div className="grid min-h-[calc(100vh-12rem)] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-8">
        {/* Left column — title + the two contact endpoints */}
        <div>
          <h1 className="text-brutal mb-12 text-7xl leading-none md:text-[10vw]">CONTACT.</h1>
          <a
            href="mailto:hello@loustudio.fr"
            className="text-brutal hover:text-signal mb-8 block text-3xl uppercase transition-colors md:text-5xl"
          >
            HELLO@LOUSTUDIO.FR
          </a>
          <a
            href="https://www.instagram.com/lou.boidin/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-meta inline-block opacity-80 transition-opacity hover:opacity-100"
          >
            @LOU.BOIDIN →
          </a>
        </div>

        {/* Right column — 3D iPhone displaying one of Lou's shots */}
        <div className="relative h-[60vh] w-full md:h-[80vh]">
          <IPhone3D photoUrl="/gallery/01.jpg" />
        </div>
      </div>
    </main>
  );
}
