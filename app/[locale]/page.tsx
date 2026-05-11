import { Hero } from '@/components/home/Hero';
import { FullBleedSlide } from '@/components/home/FullBleedSlide';
import { getAllWorks, type Locale } from '@/lib/works';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const works = await getAllWorks(locale as Locale);
  return (
    <main className="relative h-screen snap-y snap-mandatory overflow-y-scroll">
      <Hero />
      {works.map((work, i) => (
        <FullBleedSlide
          key={work.slug}
          work={work}
          index={i}
          total={works.length}
          locale={locale}
        />
      ))}
    </main>
  );
}
