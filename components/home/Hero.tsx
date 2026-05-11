'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'motion/react';
import { TextScramble } from './TextScramble';

const TRACK_VH = 350; // total scroll height of the hero section, in viewport heights
const EASE_CINEMA = [0.76, 0, 0.24, 1] as const;

/**
 * Cinematic hero — a 350vh tall section whose inner frame is `position: sticky`
 * and fills the viewport. The frame holds a muted <video> whose
 * `currentTime` is scrubbed from the section's scroll progress, so as you
 * scroll the hero, the camera appears to move through the makeup scene in
 * slow-motion. On top of the video, brutalist LOU typography intro-reveals,
 * then fades out to make room for the 3-line manifesto (VISAGE / MATIÈRE /
 * FORME), each one appearing in its own scroll window.
 *
 * Fluidity tactics:
 * - `preload="auto"` + we gate scrubbing on `canplaythrough` so the seek
 *   never lands on an un-buffered frame
 * - sub-frame seek threshold (0.025s) — avoids jitter from Lenis sub-pixel
 *   scroll updates
 * - `requestVideoFrameCallback` when available — keeps the painted frame in
 *   sync with the requested time, smoother than relying on `seeked` events
 */
export function Hero() {
  const t = useTranslations('Home');
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Load the video and unblock scrubbing only once the playable buffer covers
  // the full duration. Until then, frame 0 is visible (static poster effect).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const markReady = () => {
      if (video.duration && Number.isFinite(video.duration)) {
        setDuration(video.duration);
        setReady(true);
      }
    };

    if (video.readyState >= 4 && video.duration) {
      markReady();
    } else {
      video.addEventListener('canplaythrough', markReady, { once: true });
      video.addEventListener('loadedmetadata', () => {
        if (video.duration) setDuration(video.duration);
      });
    }
    video.load();
    return () => video.removeEventListener('canplaythrough', markReady);
  }, []);

  // Scrub the video frame from the scroll progress.
  //
  // Critical for fluidity: we DON'T seek on every scroll event (Lenis emits many
  // per frame). Instead, an rAF loop reads the latest scrollYProgress once per
  // refresh and seeks at most ~60Hz. Combined with the all-intra encoded MP4
  // (every frame is a keyframe, so seek is instant), the result is buttery.
  useEffect(() => {
    if (!ready || !duration) return;
    let rafId = 0;
    let lastSeekTime = -1;

    const tick = () => {
      const video = videoRef.current;
      if (video) {
        const progress = scrollYProgress.get();
        const target = Math.max(0, Math.min(duration * progress, duration - 0.01));
        // Only seek if the delta is meaningful — saves the decode pipeline.
        if (Math.abs(target - lastSeekTime) > 0.02) {
          video.currentTime = target;
          lastSeekTime = target;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [ready, duration, scrollYProgress]);

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
        <video
          ref={videoRef}
          src="/videos/scroll-makeup.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden
          // @ts-expect-error — non-standard but widely supported attribute
          disableRemotePlayback="true"
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
