'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/cn';
import type { Work } from '@/lib/works';
import { NumberCounter } from './NumberCounter';

interface Props {
  work: Work;
  index: number;
  total: number;
  /** Which column the photo lives in. Alternated R/L by the parent. */
  side: 'left' | 'right';
  locale: string;
}

// 200×200 SVG with feTurbulence noise — base64-encoded once and reused as a tiled bg.
// Gives the section a subtle film-grain texture without a network round-trip.
const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>\")";

/**
 * Premium two-column project card. The photo takes ~7/12 of the row width;
 * the opposite ~4-5/12 hosts a typographic composition (ghost number, live
 * counter, title char-stagger, excerpt, meta, CTA). A film-grain texture and
 * a side-aware gradient keep the previously-empty side alive.
 *
 * Alternates which column the photo occupies via the `side` prop.
 */
export function AlternatingProject({ work, index, total, side, locale }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  // First paragraph of the MDX body, trimmed. Used as the card excerpt.
  const excerpt =
    work.bodyMdx
      .split(/\n\n+/)
      .find((p) => p.trim().length > 0)
      ?.trim()
      .slice(0, 240) ?? '';

  const viewport = { once: true, margin: '-15%' };
  const ease = [0.76, 0, 0.24, 1] as const;

  const imageColumn = (
    <Link href={`/${locale}/works/${work.slug}`} className="group block">
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
            sizes="(min-width: 1024px) 60vw, 100vw"
          />
        </motion.div>
      </motion.div>
    </Link>
  );

  const textColumn = (
    <div className="relative flex flex-col gap-8">
      {/* Massive ghosted number sitting behind the composition */}
      <span
        aria-hidden
        className="text-brutal text-cream/[0.04] pointer-events-none absolute -top-16 -left-8 -z-10 text-[32vw] leading-none select-none md:-top-20 md:text-[26vw]"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* live counter + total */}
      <div className="text-meta text-cream/80 flex items-baseline gap-3">
        <NumberCounter
          value={index + 1}
          className="text-brutal text-cream text-6xl leading-none md:text-7xl"
        />
        <span className="text-cream/40">/ {String(total).padStart(2, '0')}</span>
      </div>

      {/* title — char-stagger reveal */}
      <div className="overflow-hidden">
        <motion.h2
          initial={{ y: '110%' }}
          whileInView={{ y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
          className="text-brutal text-cream text-5xl md:text-6xl lg:text-7xl"
        >
          {work.title}
        </motion.h2>
      </div>

      {/* excerpt */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-cream/70 max-w-md text-base leading-relaxed md:text-lg"
      >
        {excerpt}
      </motion.p>

      {/* meta line */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: 0.8, delay: 0.55 }}
        className="text-meta text-cream/60"
      >
        {work.role} · {work.location} · {new Date(work.date).getFullYear()}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={viewport}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Link
          href={`/${locale}/works/${work.slug}`}
          className="text-meta text-cream hover:text-signal group inline-flex items-center gap-3 transition-colors"
        >
          <span className="bg-cream/40 group-hover:bg-signal h-px w-12 transition-colors" />
          VIEW PROJECT
          <motion.span
            aria-hidden
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block"
          >
            →
          </motion.span>
        </Link>
      </motion.div>
    </div>
  );

  // The slow vertical scrolling label rides the edge OPPOSITE the photo, so
  // the typographic side always has a tactile motion accent. CSS
  // writing-mode handles the vertical orientation; the @keyframes animation
  // is set inline via Framer Motion's y motion value.
  const verticalLabel = (
    <motion.div
      aria-hidden
      animate={{ y: ['0%', '-50%'] }}
      transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
      className={cn(
        'pointer-events-none absolute top-0 flex flex-col gap-12 will-change-transform',
        side === 'right' ? 'right-2 md:right-6' : 'left-2 md:left-6',
      )}
      style={{ writingMode: 'vertical-rl' }}
    >
      {[
        ...Array(2)
          .fill(
            `${work.title.toUpperCase()}  ·  ${work.role.toUpperCase()}  ·  ${work.location.toUpperCase()}  ·  ${new Date(work.date).getFullYear()}  ·  `,
          )
          .flatMap((s, i) => [
            <span key={`vm-${i}`} className="text-meta text-cream/25 whitespace-nowrap">
              {s}
            </span>,
          ]),
      ]}
    </motion.div>
  );

  return (
    <section
      ref={ref}
      aria-labelledby={`project-${work.slug}`}
      className="relative grid min-h-screen grid-cols-12 items-center gap-6 px-6 py-24 md:gap-8 md:px-16 md:py-32"
    >
      {/* subtle warm gradient on the text side */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 -z-20',
          side === 'right'
            ? 'from-stone-1/40 via-jet to-jet bg-gradient-to-r'
            : 'from-stone-1/40 via-jet to-jet bg-gradient-to-l',
        )}
      />
      {/* film grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_SVG, backgroundSize: '200px 200px' }}
      />

      {verticalLabel}

      {side === 'right' ? (
        <>
          <div className="relative col-span-12 md:col-span-5 md:col-start-1 lg:col-span-4 lg:col-start-1">
            {textColumn}
          </div>
          <div className="col-span-12 md:col-span-7 md:col-start-6 lg:col-span-7 lg:col-start-6">
            {imageColumn}
          </div>
        </>
      ) : (
        <>
          <div className="col-span-12 row-start-2 md:col-span-7 md:col-start-1 md:row-start-1 lg:col-span-7">
            {imageColumn}
          </div>
          <div className="relative col-span-12 row-start-1 md:col-span-5 md:col-start-8 md:row-start-1 lg:col-span-4 lg:col-start-9">
            {textColumn}
          </div>
        </>
      )}
    </section>
  );
}
