import Link from 'next/link';
import type { Work } from '@/lib/works';

export function NextProject({ work, locale }: { work: Work; locale: string }) {
  if (!work.nextSlug) return null;
  return (
    <section className="border-cream/20 border-t px-6 py-32 md:px-20">
      <Link href={`/${locale}/works/${work.nextSlug}`} className="group block">
        <span className="text-meta opacity-60">NEXT</span>
        <h2 className="text-brutal group-hover:text-signal mt-4 text-6xl transition-colors md:text-9xl">
          {work.nextSlug.replace(/-/g, ' ')} →
        </h2>
      </Link>
    </section>
  );
}
