import Image from 'next/image';
import type { Work } from '@/lib/works';

export function Cover({ work }: { work: Work }) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Image
        src={work.cover}
        alt=""
        fill
        priority
        className="object-cover"
        style={{ viewTransitionName: `cover-${work.slug}` }}
      />
      <div className="from-jet/80 absolute inset-0 flex flex-col justify-end bg-gradient-to-t to-transparent p-10">
        <h1 className="text-brutal text-7xl md:text-[12vw]">{work.title}</h1>
        <span className="text-meta mt-4 opacity-80">
          {work.role} · {work.location} · {new Date(work.date).getFullYear()}
        </span>
      </div>
    </section>
  );
}
