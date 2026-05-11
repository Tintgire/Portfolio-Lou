'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/cn';
import type { Work } from '@/lib/works';

interface Props {
  work: Work;
  index: number;
  total: number;
  /** Which half of the viewport the card lands on. Alternated R/L/R/L by the parent. */
  side: 'left' | 'right';
  locale: string;
}

/**
 * One project displayed as an editorial card occupying half the viewport
 * width, alternating sides as you scroll. On enter:
 * - Image clip-paths down from the top (mask reveal)
 * - Image has a slow parallax (scrolls past slower than the page)
 * - Title rises from below
 * - Meta line follows with a slight delay
 *
 * The image carries `view-transition-name: cover-${slug}` so the handoff to
 * `/works/[slug]` still flies the cover into place.
 */
export function AlternatingProject({ work, index, total, side, locale }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax: image translates -8% → +8% across the section's life in the viewport
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  const viewport = { once: true, margin: '-15%' };
  const ease = [0.76, 0, 0.24, 1] as const;

  return (
    <section
      ref={ref}
      aria-labelledby={`project-${work.slug}`}
      className={cn(
        'relative flex min-h-screen items-center px-6 py-32 md:px-16',
        side === 'right' ? 'justify-end' : 'justify-start',
      )}
    >
      <Link
        href={`/${locale}/works/${work.slug}`}
        className="group block w-full max-w-2xl md:w-3/5 lg:w-1/2"
      >
        <motion.div
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          whileInView={{ clipPath: 'inset(0 0 0 0)' }}
          viewport={viewport}
          transition={{ duration: 1.2, ease }}
          className="relative aspect-[4/5] overflow-hidden"
          style={{ viewTransitionName: `cover-${work.slug}` }}
        >
          <motion.div className="absolute inset-[-8%]" style={{ y: imageY }}>
            <Image
              src={work.cover}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 66vw, 100vw"
            />
          </motion.div>
        </motion.div>

        <div className="mt-8 overflow-hidden">
          <motion.h2
            id={`project-${work.slug}`}
            initial={{ y: '110%' }}
            whileInView={{ y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.9, ease, delay: 0.15 }}
            className="text-brutal text-cream group-hover:text-signal text-5xl transition-colors md:text-7xl"
          >
            {work.title}
          </motion.h2>
        </div>
        <div className="mt-3 overflow-hidden">
          <motion.span
            initial={{ y: '100%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={viewport}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-meta text-cream/70 block"
          >
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')} — {work.role} ·{' '}
            {work.location} · {new Date(work.date).getFullYear()}
          </motion.span>
        </div>
      </Link>
    </section>
  );
}
