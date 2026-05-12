import { notFound } from 'next/navigation';
import { getAllWorks, getWorkBySlug, type Locale } from '@/lib/works';
import { locales } from '@/i18n';
import { Cover } from '@/components/work/Cover';
import { Intro } from '@/components/work/Intro';
import { Credits } from '@/components/work/Credits';
import { MediaBlock } from '@/components/work/MediaBlock';
import { NextProject } from '@/components/work/NextProject';
import { KeyboardNav } from '@/components/work/KeyboardNav';

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const works = await getAllWorks(locale);
    for (const w of works) params.push({ locale, slug: w.slug });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const work = await getWorkBySlug(slug, locale as Locale);
  if (!work) return {};
  return {
    title: `${work.title} — LOU STUDIO`,
    description: `${work.role} · ${work.location} · ${new Date(work.date).getFullYear()}`,
    alternates: {
      canonical: `/${locale}/works/${slug}`,
      languages: { fr: `/fr/works/${slug}`, en: `/en/works/${slug}` },
    },
    openGraph: { title: work.title, images: [work.cover], locale, type: 'article' },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const work = await getWorkBySlug(slug, locale as Locale);
  if (!work) notFound();

  const all = await getAllWorks(locale as Locale);
  const idx = all.findIndex((w) => w.slug === slug);
  const prev = idx > 0 ? all[idx - 1] : undefined;
  const next = work.nextSlug ? await getWorkBySlug(work.nextSlug, locale as Locale) : undefined;

  return (
    <main className="bg-jet text-cream relative">
      {/* Top fade behind the nav. The cover image at the top of each
          project page can be bright or skin-toned, sinking the cream
          nav links into the background. Same recipe as the About
          page — invisible on bg-jet, restores contrast on light
          covers. */}
      <div
        aria-hidden
        className="from-jet/55 via-jet/20 pointer-events-none fixed inset-x-0 top-0 z-40 h-28 bg-gradient-to-b to-transparent"
      />
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
      <NextProject work={work} locale={locale} />
      <KeyboardNav
        nextHref={next ? `/${locale}/works/${next.slug}` : undefined}
        prevHref={prev ? `/${locale}/works/${prev.slug}` : undefined}
      />
    </main>
  );
}
