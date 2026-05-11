'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { TextScramble } from './TextScramble';

/**
 * Editorial hero with a cursor-driven spotlight that reveals an image
 * underneath a dark blurred overlay. Falls back to a static dimmed image on
 * touch devices and when prefers-reduced-motion is set.
 */
export function SpotlightHero() {
  const t = useTranslations('Home');
  const sectionRef = useRef<HTMLElement>(null);

  const [isTouch] = useState(
    () =>
      typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
  );
  const [reduceMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [active, setActive] = useState(false);

  // Mouse position as motion values (no React state churn).
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const smoothX = useSpring(mx, { stiffness: 250, damping: 30, mass: 0.4 });
  const smoothY = useSpring(my, { stiffness: 250, damping: 30, mass: 0.4 });

  // Spotlight radius is its own spring so the dilation feels intentional.
  const radius = useMotionValue(0);
  const smoothRadius = useSpring(radius, { stiffness: 180, damping: 24 });

  useEffect(() => {
    radius.set(active && !isTouch && !reduceMotion ? 260 : 0);
  }, [active, isTouch, reduceMotion, radius]);

  const maskImage = useMotionTemplate`radial-gradient(circle ${smoothRadius}px at ${smoothX}px ${smoothY}px, transparent 0%, transparent 55%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.95) 100%)`;

  function onMouseMove(e: React.MouseEvent) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className="bg-jet relative h-screen w-full overflow-hidden"
    >
      {/* photo underneath */}
      <Image
        src="/images/hero/portrait.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* dark blurred overlay with a hole punched by the cursor spotlight */}
      <motion.div
        aria-hidden
        className="bg-jet/92 absolute inset-0 backdrop-blur-[6px]"
        style={
          isTouch || reduceMotion
            ? undefined
            : {
                WebkitMaskImage: maskImage,
                maskImage,
              }
        }
      />

      {/* meta corners */}
      <span className="text-meta text-cream/80 absolute top-6 left-6 z-10 mix-blend-difference">
        <TextScramble text={t('tagline')} duration={1100} />
      </span>
      <span className="text-meta text-cream/80 absolute right-6 bottom-6 z-10 mix-blend-difference">
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
      <span className="text-meta text-cream/80 absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-pulse mix-blend-difference">
        ↓ {t('scroll')}
      </span>
    </section>
  );
}
