'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Work } from '@/lib/works';

interface Props {
  work: Work;
  index: number;
  total: number;
  locale: string;
}

export function FullBleedSlide({ work, index, total, locale }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const img = el.querySelector('[data-img]');
      if (img) {
        gsap.from(img, {
          clipPath: 'inset(20%)',
          scale: 1.1,
          ease: 'power2.out',
          duration: 1,
          scrollTrigger: { trigger: el, start: 'top 70%' },
        });
      }
      const lines = el.querySelectorAll('[data-line]');
      if (lines.length > 0) {
        gsap.from(lines, {
          yPercent: 100,
          opacity: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 70%' },
        });
      }
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative h-screen w-full snap-start overflow-hidden"
      aria-labelledby={`slide-${work.slug}`}
    >
      <div data-img className="absolute inset-0">
        <Image src={work.cover} alt="" fill priority={index === 0} className="object-cover" />
      </div>
      <Link
        href={`/${locale}/works/${work.slug}`}
        className="group absolute inset-0 z-10 flex flex-col justify-end p-10"
      >
        <span className="text-meta mb-4 opacity-70">
          PROJECT {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <div className="overflow-hidden">
          <h2 id={`slide-${work.slug}`} data-line className="text-brutal text-7xl md:text-9xl">
            {work.title}
          </h2>
        </div>
        <div className="mt-3 overflow-hidden">
          <span data-line className="text-meta opacity-80">
            {work.role} · {work.location} · {new Date(work.date).getFullYear()}
          </span>
        </div>
      </Link>
    </section>
  );
}
