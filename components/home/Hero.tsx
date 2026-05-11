'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'motion/react';
import { TextScramble } from './TextScramble';
import { ScrollFrames } from './ScrollFrames';

const TRACK_VH = 600; // total scroll height of the hero section, in viewport heights
const FRAME_COUNT = 200; // matches the WebP frames extracted under /videos/frames/
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

  // Manifesto: three lines, each with its own slice of the track.
  const op1 = useTransform(scrollYProgress, [0.18, 0.28, 0.42, 0.5], [0, 1, 1, 0]);
  const op2 = useTransform(scrollYProgress, [0.45, 0.56, 0.68, 0.76], [0, 1, 1, 0]);
  const op3 = useTransform(scrollYProgress, [0.72, 0.82, 0.95, 1], [0, 1, 1, 1]);
  const y1 = useTransform(scrollYProgress, [0.18, 0.28], ['10%', '0%']);
  const y2 = useTransform(scrollYProgress, [0.45, 0.56], ['10%', '0%']);
  const y3 = useTransform(scrollYProgress, [0.72, 0.82], ['10%', '0%']);

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

        {/* mid-tone dim so the brutalist typography stays readable on any frame */}
        <div aria-hidden className="bg-jet/45 absolute inset-0" />

        {/* meta corners */}
        <span className="text-meta text-cream/90 absolute top-6 left-6 z-10 mix-blend-difference">
          <TextScramble text={t('tagline')} duration={1100} delay={1400} />
        </span>
        <span className="text-meta text-cream/90 absolute right-6 bottom-6 z-10 mix-blend-difference">
          2025 — {t('vol')}
        </span>

        {/* LOU brutaliste — char stagger on mount, fades out as scroll progresses */}
        <motion.h1
          aria-label="LOU"
          style={{ opacity: louOpacity, scale: louScale }}
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
                  ease: EASE_CINEMA,
                }}
              >
                {c}
              </motion.span>
            ))}
          </span>
        </motion.h1>

        {/* Manifesto — 3 stacked lines, each in its own scroll window */}
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-6">
          <div className="flex flex-col items-center text-center">
            <div className="overflow-hidden">
              <motion.h2
                style={{ opacity: op1, y: y1 }}
                className="text-brutal text-cream text-[14vw] leading-none mix-blend-difference md:text-[12vw]"
              >
                {t('manifestoLine1')}
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2
                style={{ opacity: op2, y: y2 }}
                className="text-brutal text-cream text-[14vw] leading-none mix-blend-difference md:text-[12vw]"
              >
                {t('manifestoLine2')}
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2
                style={{ opacity: op3, y: y3 }}
                className="text-brutal text-cream text-[14vw] leading-none mix-blend-difference md:text-[12vw]"
              >
                {t('manifestoLine3')}
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
          className="text-meta text-cream/90 absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-pulse mix-blend-difference"
        >
          ↓ {t('scroll')}
        </motion.span>
      </div>
    </section>
  );
}
