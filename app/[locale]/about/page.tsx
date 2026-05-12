import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { locales } from '@/i18n';
import { getAbout } from '@/lib/about';
import type { Locale } from '@/lib/works';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: 'About — LOU STUDIO',
    alternates: {
      canonical: `/${locale}/about`,
      languages: { fr: '/fr/about', en: '/en/about' },
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const about = await getAbout(locale as Locale);
  return (
    <main className="bg-jet text-cream relative">
      {/* Top fade behind the nav. The portrait at the top of this page
          is mostly skin-tones / cream, which sinks the cream nav links
          into the background. A subtle dark wash (jet/55 → transparent
          over 112px) restores contrast without touching any other page
          where bg-jet already provides it for free. */}
      <div
        aria-hidden
        className="from-jet/55 via-jet/20 pointer-events-none fixed inset-x-0 top-0 z-40 h-28 bg-gradient-to-b to-transparent"
      />
      <section className="relative h-screen">
        <Image
          src={about.data.portrait}
          alt={about.data.name}
          fill
          priority
          className="object-cover"
        />
        <h1 className="text-brutal absolute bottom-10 left-10 text-7xl md:text-[10vw]">
          {about.data.name}
        </h1>
      </section>
      <section className="px-6 py-24 md:px-20">
        <div className="font-display max-w-3xl text-3xl leading-tight md:text-5xl">
          <MDXRemote source={about.bodyMdx} />
        </div>
      </section>
      <section className="border-cream/20 border-t px-6 py-16 md:px-20">
        <ul className="text-meta grid grid-cols-2 gap-4 md:grid-cols-4">
          <li>MAKEUP</li>
          <li>STYLISM</li>
          <li>EDITORIAL</li>
          <li>RUNWAY</li>
        </ul>
      </section>
    </main>
  );
}
