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
