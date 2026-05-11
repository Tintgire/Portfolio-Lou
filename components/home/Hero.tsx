'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { TextScramble } from './TextScramble';

/**
 * Cinematic hero — full-bleed editorial makeup photo, brutalist LOU layered
 * over it with a char-by-char stagger reveal that fires once the loading
 * screen lifts (~1.5s in). The photo is the centrepiece; a soft top-to-bottom
 * gradient and `mix-blend-difference` on the type keep everything legible.
 */
export function Hero() {
  const t = useTranslations('Home');

  return (
    <section className="bg-jet relative h-screen w-full overflow-hidden">
      <Image
        src="/images/hero/portrait.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* subtle vignette so meta + LOU stay readable without killing the photo */}
      <div
        aria-hidden
        className="from-jet/70 via-jet/20 to-jet/60 absolute inset-0 bg-gradient-to-b"
      />

      {/* meta corners */}
      <span className="text-meta text-cream/90 absolute top-6 left-6 z-10 mix-blend-difference">
        <TextScramble text={t('tagline')} duration={1100} delay={1400} />
      </span>
      <span className="text-meta text-cream/90 absolute right-6 bottom-6 z-10 mix-blend-difference">
        2025 — {t('vol')}
      </span>

      {/* giant LOU — chars rise from below with stagger after the loading screen clears */}
      <h1
        aria-label="LOU"
        className="text-brutal text-cream pointer-events-none absolute inset-0 z-10 grid place-items-center text-[28vw] leading-none mix-blend-difference select-none"
      >
        <span className="flex overflow-hidden">
          {['L', 'O', 'U'].map((c, i) => (
            <motion.span
              key={c}
              className="inline-block"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.9,
                delay: 1.5 + i * 0.1,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              {c}
            </motion.span>
          ))}
        </span>
      </h1>

      {/* scroll cue */}
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 0.6 }}
        className="text-meta text-cream/90 absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-pulse mix-blend-difference"
      >
        ↓ {t('scroll')}
      </motion.span>
    </section>
  );
}
