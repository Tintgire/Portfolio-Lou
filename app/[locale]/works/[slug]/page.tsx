import { notFound } from 'next/navigation';
import { getAllWorks, getWorkBySlug, type Locale } from '@/lib/works';
import { locales } from '@/i18n';
import { Cover } from '@/components/work/Cover';
import { Intro } from '@/components/work/Intro';
import { Credits } from '@/components/work/Credits';
import { MediaBlock } from '@/components/work/MediaBlock';

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const works = await getAllWorks(locale);
    for (const w of works) params.push({ locale, slug: w.slug });
  }
  return params;
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const work = await getWorkBySlug(slug, locale as Locale);
  if (!work) notFound();
  return (
    <main className="bg-jet text-cream relative">
      <Cover work={work} />
      <Intro body={work.bodyMdx} />
      {work.media.length > 0 && (
        <section className="grid grid-cols-12 gap-2 px-2 md:px-4">
          {work.media.map((m, i) => (
            <MediaBlock key={`${m.src}-${i}`} media={m} />
          ))}
        </section>
      )}
      <Credits work={work} />
    </main>
  );
}
