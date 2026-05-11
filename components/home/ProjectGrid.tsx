'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import type { Work } from '@/lib/works';

interface Props {
  works: Work[];
  locale: string;
  /** Section heading. Localised by the parent. */
  title: string;
}

/**
 * Final section of the home page: every project landed as a grid card. Each
 * card fades + rises into place with a stagger delay so the grid "lands" piece
 * by piece. Image hover scales subtly; clicking goes to the project page.
 *
 * NOTE: only the AlternatingProject cards carry the `view-transition-name`
 * for the cover handoff — a name can only appear on one element per page.
 */
export function ProjectGrid({ works, locale, title }: Props) {
  return (
    <section className="bg-jet relative px-6 py-32 md:px-16">
      <div className="mb-16 overflow-hidden">
        <motion.h2
          initial={{ y: '110%' }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          className="text-brutal text-cream text-7xl leading-none md:text-[12vw]"
        >
          {title}
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {works.map((work, i) => (
          <motion.div
            key={work.slug}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-5%' }}
            transition={{
              duration: 0.8,
              delay: i * 0.08,
              ease: [0.22, 0.61, 0.36, 1],
            }}
          >
            <Link href={`/${locale}/works/${work.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={work.cover}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <h3 className="text-brutal text-cream group-hover:text-signal text-2xl transition-colors md:text-3xl">
                  {work.title}
                </h3>
                <span className="text-meta text-cream/60 shrink-0">
                  {new Date(work.date).getFullYear()}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
