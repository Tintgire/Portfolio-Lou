import { getTranslations } from 'next-intl/server';
import { Hero } from '@/components/home/Hero';
import { ScrollVideo } from '@/components/home/ScrollVideo';
import { AlternatingProject } from '@/components/home/AlternatingProject';
import { ProjectGrid } from '@/components/home/ProjectGrid';
import { Marquee } from '@/components/ui/Marquee';
import { getAllWorks, type Locale } from '@/lib/works';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFr = locale === 'fr';
  return {
    title: 'LOU STUDIO — ' + (isFr ? 'Maquillage & Stylisme' : 'Makeup & Stylism'),
    description: isFr
      ? 'Portfolio de Lou Boidin — maquillage et stylisme éditorial à Paris.'
      : 'Portfolio of Lou Boidin — editorial makeup and stylism in Paris.',
    alternates: { canonical: `/${locale}`, languages: { fr: '/fr', en: '/en' } },
    openGraph: { title: 'LOU STUDIO', images: ['/og/home.jpg'], locale, type: 'website' },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const works = await getAllWorks(locale as Locale);
  const t = await getTranslations('Home');

  return (
    <main className="relative">
      <Hero />
      <Marquee items={['LOU', 'MAKEUP', 'STYLISM', 'PARIS', 'EDITORIAL']} duration={42} />

      {/* Scroll-driven cinematic — scrubs the video frame-by-frame as you scroll */}
      <ScrollVideo src="/videos/scroll-makeup.mp4" trackVh={300} />

      {/* Alternating cards — one right, one left, one right, one left… */}
      {works.map((work, i) => (
        <AlternatingProject
          key={work.slug}
          work={work}
          index={i}
          total={works.length}
          side={i % 2 === 0 ? 'right' : 'left'}
          locale={locale}
        />
      ))}

      {/* Finale: every project as a grid card */}
      <ProjectGrid works={works} locale={locale} title={t('allWorks')} />

      <Marquee items={['SELECTED WORKS', '2025', 'PORTFOLIO', 'VOL.01']} duration={52} reverse />
    </main>
  );
}
