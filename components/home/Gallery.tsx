'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useTranslations } from 'next-intl';

interface Photo {
  src: string;
  w: number;
  h: number;
}

// 20 archive photos — natural dimensions kept so next/image emits the
// right intrinsic ratio.
const PHOTOS: Photo[] = [
  { src: '/gallery/01.jpg', w: 1440, h: 1796 },
  { src: '/gallery/02.jpg', w: 1440, h: 1439 },
  { src: '/gallery/03.jpg', w: 1440, h: 1439 },
  { src: '/gallery/04.jpg', w: 1440, h: 1535 },
  { src: '/gallery/05.jpg', w: 1371, h: 1462 },
  { src: '/gallery/06.jpg', w: 1440, h: 1800 },
  { src: '/gallery/07.jpg', w: 1165, h: 1165 },
  { src: '/gallery/08.jpg', w: 1440, h: 1440 },
  { src: '/gallery/09.jpg', w: 1440, h: 1440 },
  { src: '/gallery/10.jpg', w: 1440, h: 1440 },
  { src: '/gallery/11.jpg', w: 1440, h: 1440 },
  { src: '/gallery/12.jpg', w: 1422, h: 1714 },
  { src: '/gallery/13.jpg', w: 1440, h: 1796 },
  { src: '/gallery/14.jpg', w: 1109, h: 1202 },
  { src: '/gallery/15.jpg', w: 1440, h: 1560 },
  { src: '/gallery/16.jpg', w: 1440, h: 1559 },
  { src: '/gallery/17.jpg', w: 1440, h: 1440 },
  { src: '/gallery/18.jpg', w: 1179, h: 1461 },
  { src: '/gallery/19.jpg', w: 1440, h: 1918 },
  { src: '/gallery/20.jpg', w: 888, h: 888 },
];

// Per-photo scroll length. 30vh × 20 = 600vh.
const PHOTO_VH = 30;
const TOTAL = PHOTOS.length;

/**
 * Cinematic sticky-pinned slideshow. The section is `TOTAL × PHOTO_VH`
 * tall; an inner `position: sticky` container fills the viewport. As
 * the user scrolls, we derive a single `activeIndex` from progress and
 * mount ONLY that slide via `AnimatePresence mode="wait"` — so no two
 * photos ever coexist in the DOM, and no crossfade can leak a previous
 * shot behind the current one. The active slide runs a continuous slow
 * Ken-Burns push-in while mounted.
 */
export function Gallery() {
  const t = useTranslations('Home');
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  // Caption + slide both read from a single React state value, kept in
  // sync with scrollYProgress via useMotionValueEvent. floor(progress *
  // TOTAL) flips at slot boundaries — same boundary the slide animation
  // will swap on, so number and image are always 1:1.
  const indexFloat = useTransform(scrollYProgress, [0, 1], [0, TOTAL]);
  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(indexFloat, 'change', (latest) => {
    const next = Math.min(TOTAL - 1, Math.max(0, Math.floor(latest)));
    setActiveIndex(next);
  });

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + TOTAL) % TOTAL)),
    [],
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % TOTAL)),
    [],
  );

  const activePhoto = PHOTOS[activeIndex]!;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="gallery-heading"
      className="bg-jet relative"
      style={{ height: `${TOTAL * PHOTO_VH}vh` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Ambient blurred background — persistent <Image> whose src
            swaps as activePhoto changes. The browser caches the decoded
            bitmap, so this update is instant. No animation queueing. */}
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={activePhoto.src}
            alt=""
            fill
            sizes="100vw"
            priority
            className="scale-110 object-cover opacity-30 blur-3xl"
          />
        </div>

        {/* Foreground — keyed on activeIndex so each photo runs its
            own slide-in. No AnimatePresence: the previous foreground
            is unmounted instantly at swap time, so React never queues
            animations and no slide can ever be skipped on fast scroll. */}
        <Slide key={activeIndex} photo={activePhoto} onOpen={() => openLightbox(activeIndex)} />

        {/* Top corner header — always visible above slides */}
        <div
          aria-hidden
          className="from-jet/80 pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b to-transparent px-6 pt-10 pb-20 md:px-16 md:pt-14"
        >
          <p className="text-meta text-cream/50 mb-2">{t('gallerySubtitle')}</p>
          <h2
            id="gallery-heading"
            className="text-brutal text-cream text-4xl leading-none md:text-6xl lg:text-7xl"
          >
            {t('gallery')}
          </h2>
        </div>

        {/* Numeral caption — also AnimatePresence-driven on activeIndex */}
        <ActiveCaption index={activeIndex} />

        <span
          aria-hidden
          className="text-meta text-cream/40 absolute right-6 bottom-12 z-10 md:right-16"
        >
          CLICK FOR FULLSCREEN
        </span>

        <ProgressBar progress={scrollYProgress} />
      </div>

      <Lightbox
        photos={PHOTOS}
        active={lightboxIndex}
        onClose={closeLightbox}
        onPrev={prev}
        onNext={next}
        labels={{
          close: t('galleryClose'),
          prev: t('galleryPrev'),
          next: t('galleryNext'),
        }}
      />
    </section>
  );
}

function Slide({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, x: 24, scale: 1 }}
      animate={{ opacity: 1, x: 0, scale: 1.05 }}
      transition={{
        opacity: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
        x: { duration: 0.4, ease: [0.76, 0, 0.24, 1] },
        scale: { duration: 6, ease: 'linear' },
      }}
      className="absolute inset-0 grid w-full place-items-center p-6 md:p-16"
      aria-label="Open photo fullscreen"
    >
      <Image
        src={photo.src}
        alt=""
        width={photo.w}
        height={photo.h}
        sizes="(min-width: 1024px) 70vw, 90vw"
        priority
        className="max-h-[78vh] w-auto object-contain shadow-[0_30px_120px_rgba(0,0,0,0.7)]"
      />
    </motion.button>
  );
}

function ActiveCaption({ index }: { index: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-10 left-6 z-10 md:bottom-14 md:left-16"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
          className="flex items-end gap-4"
        >
          <span className="text-brutal text-cream text-7xl leading-none md:text-9xl">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="pb-3 md:pb-5">
            <p className="text-meta text-cream/40">— {String(TOTAL).padStart(2, '0')}</p>
            <p className="text-meta text-cream/70 mt-1">MAKEUP · STYLISM</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProgressBar({ progress }: { progress: MotionValue<number> }) {
  const scaleX = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div className="bg-cream/10 absolute right-0 bottom-0 left-0 z-10 h-px">
      <motion.div style={{ scaleX }} className="bg-cream/70 h-full origin-left" />
    </div>
  );
}

interface LightboxProps {
  photos: Photo[];
  active: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  labels: { close: string; prev: string; next: string };
}

function Lightbox({ photos, active, onClose, onPrev, onNext, labels }: LightboxProps) {
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [active, onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      {active !== null && photos[active] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
          className="bg-jet/95 fixed inset-0 z-[300] backdrop-blur-md"
          onClick={onClose}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
              className="pointer-events-none absolute inset-0 grid place-items-center p-6 md:p-16"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[active].src}
                alt=""
                width={photos[active].w}
                height={photos[active].h}
                priority
                sizes="100vw"
                className="pointer-events-auto h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain"
              />
            </motion.div>
          </AnimatePresence>

          <div className="text-cream/80 absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-6 md:p-8">
            <span className="text-meta">
              {String(active + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-meta hover:text-cream group inline-flex items-center gap-2 transition-colors"
              aria-label={labels.close}
            >
              <span>{labels.close.toUpperCase()}</span>
              <span
                aria-hidden
                className="bg-cream/40 group-hover:bg-cream h-px w-8 transition-colors"
              />
              <span aria-hidden>×</span>
            </button>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="text-cream/60 hover:text-cream text-meta absolute top-1/2 left-4 z-10 -translate-y-1/2 px-3 py-3 transition-colors md:left-8"
            aria-label={labels.prev}
          >
            ← {labels.prev.toUpperCase()}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="text-cream/60 hover:text-cream text-meta absolute top-1/2 right-4 z-10 -translate-y-1/2 px-3 py-3 transition-colors md:right-8"
            aria-label={labels.next}
          >
            {labels.next.toUpperCase()} →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
