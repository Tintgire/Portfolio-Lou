import { SpotlightHero } from '@/components/home/SpotlightHero';
import { FullBleedSlide } from '@/components/home/FullBleedSlide';
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
  return (
    <main className="relative">
      <SpotlightHero />
      <Marquee items={['LOU', 'MAKEUP', 'STYLISM', 'PARIS', 'EDITORIAL']} duration={42} />
      {works.map((work, i) => (
        <FullBleedSlide
          key={work.slug}
          work={work}
          index={i}
          total={works.length}
          locale={locale}
        />
      ))}
      <Marquee items={['SELECTED WORKS', '2025', 'PORTFOLIO', 'VOL.01']} duration={52} reverse />
    </main>
  );
}
