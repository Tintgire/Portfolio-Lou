'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';

interface Props {
  /** Path to the MP4 (web-optimised, faststart). */
  src: string;
  /**
   * Total scroll-track length, expressed in screen-heights. The video scrubs
   * frame-by-frame across this distance while a sticky frame keeps it in
   * view. 300vh ≈ 3× viewport tall = a comfortable scrub on a typical mouse
   * wheel + Lenis ease.
   */
  trackVh?: number;
}

/**
 * Awwwards-style scroll-driven video. The wrapper section is 300vh tall; the
 * inner frame is `position: sticky` and fills the viewport. As you scroll
 * through the section, the video's `currentTime` is bound to scroll progress
 * — giving the illusion of a camera moving through a 3D scene while in
 * reality it's just a pre-baked clip being scrubbed.
 *
 * A 3-line brutalist manifesto overlays the frame; each line rises into view
 * at a different scroll progress so the text reads in sync with the visuals.
 */
export function ScrollVideo({ src, trackVh = 300 }: Props) {
  const t = useTranslations('Home');
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Wire the metadata listener once
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onMeta = () => {
      setDuration(video.duration || 0);
      setReady(true);
    };
    if (video.readyState >= 1 && video.duration) {
      onMeta();
    } else {
      video.addEventListener('loadedmetadata', onMeta);
      video.addEventListener('loadeddata', onMeta);
    }
    // Try to nudge iOS Safari into actually buffering the frames
    video.load();
    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('loadeddata', onMeta);
    };
  }, []);

  // Scrub the video frame from the scroll progress (rAF-batched).
  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const video = videoRef.current;
    if (!video || !ready || !duration) return;
    const target = Math.max(0, Math.min(duration * progress, duration - 0.01));
    // Only seek when the delta is non-trivial — avoids jitter from sub-pixel scroll updates.
    if (Math.abs(video.currentTime - target) > 0.03) {
      video.currentTime = target;
    }
  });

  // Each manifesto line opacity-pulses over a different slice of the track.
  const opacity1 = useTransform(scrollYProgress, [0.05, 0.18, 0.32, 0.42], [0, 1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.35, 0.48, 0.62, 0.72], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.65, 0.78, 0.92, 1], [0, 1, 1, 1]);
  const y1 = useTransform(scrollYProgress, [0.05, 0.18], ['8%', '0%']);
  const y2 = useTransform(scrollYProgress, [0.35, 0.48], ['8%', '0%']);
  const y3 = useTransform(scrollYProgress, [0.65, 0.78], ['8%', '0%']);

  return (
    <section
      ref={sectionRef}
      aria-label="Scroll-driven cinematic"
      className="relative w-full"
      style={{ height: `${trackVh}vh` }}
    >
      <div className="bg-jet sticky top-0 h-screen w-full overflow-hidden">
        {/* the video */}
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          aria-hidden
          // `disableRemotePlayback` keeps AirPlay icons off iOS
          // @ts-expect-error — non-standard but widely supported attribute
          disableRemotePlayback="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* mid-tone dim so the type stays readable on any frame */}
        <div aria-hidden className="bg-jet/45 absolute inset-0" />

        {/* manifesto */}
        <div className="absolute inset-0 grid place-items-center px-6">
          <div className="flex flex-col items-center text-center">
            <div className="overflow-hidden">
              <motion.h2
                style={{ opacity: opacity1, y: y1 }}
                className="text-brutal text-cream text-[14vw] leading-none mix-blend-difference md:text-[12vw]"
              >
                {t('manifestoLine1')}
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2
                style={{ opacity: opacity2, y: y2 }}
                className="text-brutal text-cream text-[14vw] leading-none mix-blend-difference md:text-[12vw]"
              >
                {t('manifestoLine2')}
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2
                style={{ opacity: opacity3, y: y3 }}
                className="text-brutal text-cream text-[14vw] leading-none mix-blend-difference md:text-[12vw]"
              >
                {t('manifestoLine3')}
              </motion.h2>
            </div>
          </div>
        </div>

        {/* corner labels for the cinematic feel */}
        <span className="text-meta text-cream/80 absolute top-6 left-6 z-10 mix-blend-difference">
          ↓ {t('scroll')}
        </span>
        <span className="text-meta text-cream/80 absolute right-6 bottom-6 z-10 mix-blend-difference">
          REEL — 2025
        </span>
      </div>
    </section>
  );
}
