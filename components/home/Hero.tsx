'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'motion/react';
import { TextScramble } from './TextScramble';
import { ScrollFrames } from './ScrollFrames';

const TRACK_VH = 200; // total scroll height of the hero section, in viewport heights
const FRAME_COUNT = 192; // matches the WebP frames extracted under /videos/frames/
const EASE_CINEMA = [0.76, 0, 0.24, 1] as const;

/**
 * Cinematic hero — 600vh tall section whose inner frame is `position: sticky`
 * and fills the viewport. The visual layer is a frame-sequence player
 * (`ScrollFrames`) that swaps pre-decoded WebPs in a `<canvas>` based on
 * scroll progress, giving a perfectly fluid scrub (no video decoder in the
 * loop). On top, the brutalist LOU intro-reveals then steps aside for a
 * three-line manifesto that crossfades with the scroll.
 */
export function Hero() {
  const t = useTranslations('Home');
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // LOU title is fully visible during the intro window, then fades out so the
  // manifesto can take centre stage.
  const louOpacity = useTransform(scrollYProgress, [0, 0.1, 0.22], [1, 1, 0]);
  const louScale = useTransform(scrollYProgress, [0, 0.22], [1, 0.94]);

  // Manifesto: two bookend lines that cross-fade so STYLISM lands the moment
  // MAKEUP starts leaving. STYLISM then holds all the way to the end of the
  // hero so a fast scroller can't miss it.
  //   MAKEUP   visible: 25-55%
  //   STYLISM  visible: 50%→100% (5% crossfade with MAKEUP, then 45% hold)
  const op1 = useTransform(scrollYProgress, [0.25, 0.34, 0.46, 0.55], [0, 1, 1, 0]);
  const op2 = useTransform(scrollYProgress, [0.5, 0.6, 0.95, 1], [0, 1, 1, 1]);
  const y1 = useTransform(scrollYProgress, [0.25, 0.34], ['10%', '0%']);
  const y2 = useTransform(scrollYProgress, [0.5, 0.6], ['10%', '0%']);

  // Scroll cue fades out as soon as the user starts scrolling.
  const cueOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative w-full"
      style={{ height: `${TRACK_VH}vh` }}
    >
      <div className="bg-jet sticky top-0 h-screen w-full overflow-hidden">
        {/* frame-sequence layer */}
        <ScrollFrames
          progress={scrollYProgress}
          count={FRAME_COUNT}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* mid-tone dim + top/bottom vignette so the typography stays readable on any frame */}
        <div
          aria-hidden
          className="from-jet/60 via-jet/15 to-jet/70 absolute inset-0 bg-gradient-to-b"
        />

        {/* meta corners — solid cream, no blend tricks (artefacts on skin tones) */}
        <span className="text-meta text-cream absolute top-6 left-6 z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          <TextScramble text={t('tagline')} duration={1100} delay={1400} />
        </span>
        <span className="text-meta text-cream absolute right-6 bottom-6 z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          2025 — {t('vol')}
        </span>

        {/* LOU brutaliste — outline-only ("magazine cover" look). Char stagger on
            mount, fades out as the scroll progresses. The transparent fill lets
            you see THROUGH the letters — the photo becomes part of the type. */}
        <motion.h1
          aria-label="LOU"
          style={{
            opacity: louOpacity,
            scale: louScale,
            color: 'transparent',
            WebkitTextStroke: '2px var(--color-cream)',
          }}
          className="text-brutal pointer-events-none absolute inset-0 z-10 grid place-items-center text-[28vw] leading-none select-none"
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
                  ease: EASE_CINEMA,
                }}
              >
                {c}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        {/* Manifesto — two bookend lines (MAKEUP early, STYLISM late). Solid
            cream over the vignette + drop-shadow for edge contrast. */}
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-6">
          <div className="flex flex-col items-center text-center">
            <div className="overflow-hidden">
              <motion.h2
                style={{ opacity: op1, y: y1 }}
                className="text-brutal text-cream text-[14vw] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] md:text-[12vw]"
              >
                {t('manifestoLine1')}
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2
                style={{ opacity: op2, y: y2 }}
                className="text-brutal text-cream text-[14vw] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] md:text-[12vw]"
              >
                {t('manifestoLine2')}
              </motion.h2>
            </div>
          </div>
        </div>

        {/* scroll cue */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.6 }}
          style={{ opacity: cueOpacity }}
          className="text-meta text-cream absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-pulse drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
        >
          ↓ {t('scroll')}
        </motion.span>
      </div>
    </section>
  );
}
