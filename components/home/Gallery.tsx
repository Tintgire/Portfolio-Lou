'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useTranslations } from 'next-intl';

interface Photo {
  src: string;
  w: number;
  h: number;
}

// 20 archive photos — natural dimensions kept so next/image emits the
// right intrinsic ratio and the masonry doesn't shift after load.
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

/**
 * Editorial photo archive. CSS-multi-column masonry on the home page,
 * each photo revealing on a scroll-driven cascade (no IntersectionObserver
 * — same robust pattern as the AlternatingProject covers, since Lenis
 * sometimes starves the observer). Click anywhere on a photo to open a
 * full-bleed lightbox with prev/next + keyboard nav + swipe.
 */
export function Gallery() {
  const t = useTranslations('Home');
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const [active, setActive] = useState<number | null>(null);
  const open = useCallback((i: number) => setActive(i), []);
  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? null : (i - 1 + PHOTOS.length) % PHOTOS.length)),
    [],
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % PHOTOS.length)),
    [],
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="gallery-heading"
      className="bg-jet relative px-6 py-32 md:px-16 md:py-40"
    >
      <header className="mb-16 flex items-end justify-between gap-6 md:mb-24">
        <div>
          <p className="text-meta text-cream/50 mb-4">
            {String(PHOTOS.length).padStart(2, '0')} — {t('gallerySubtitle')}
          </p>
          <h2
            id="gallery-heading"
            className="text-brutal text-cream text-6xl leading-[0.9] md:text-8xl lg:text-9xl"
          >
            {t('gallery')}
          </h2>
        </div>
        <span aria-hidden className="text-meta text-cream/40 hidden md:block">
          ↓ DRAG · CLICK · SCROLL
        </span>
      </header>

      {/* CSS multi-column masonry — photos retain their natural aspect
          ratio and slot in column-first. Gap is handled via column-gap
          and a manual bottom-margin on each cell (break-inside avoid
          keeps a cell from being sliced across columns). */}
      <div className="gap-x-4 [column-fill:_balance] sm:columns-2 md:columns-3 md:gap-x-6 lg:columns-4">
        {PHOTOS.map((photo, i) => (
          <PhotoCell
            key={photo.src}
            photo={photo}
            index={i}
            total={PHOTOS.length}
            progress={scrollYProgress}
            onOpen={() => open(i)}
          />
        ))}
      </div>

      <Lightbox
        photos={PHOTOS}
        active={active}
        onClose={close}
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

interface PhotoCellProps {
  photo: Photo;
  index: number;
  total: number;
  progress: MotionValue<number>;
  onOpen: () => void;
}

function PhotoCell({ photo, index, total, progress, onOpen }: PhotoCellProps) {
  // Cascade-reveal driven by section progress. Each photo enters in a
  // narrow window staggered by its index — all 20 are fully visible by
  // ~45 % of section scroll, which gives the eye time to register the
  // wave without making the user wait too long at the bottom.
  const start = (index / total) * 0.35;
  const end = start + 0.1;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y = useTransform(progress, [start, end], [60, 0]);

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      style={{ opacity, y }}
      className="group relative mb-4 block w-full break-inside-avoid overflow-hidden md:mb-6"
      aria-label={`Open photo ${index + 1} of ${total}`}
    >
      <Image
        src={photo.src}
        alt=""
        width={photo.w}
        height={photo.h}
        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw"
        className="h-auto w-full object-cover grayscale-[15%] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
      />
      {/* hover tint — adds a faint cream wash + the photo index in the
          corner. mix-blend-difference keeps the index readable on any
          tonal range without a hard contrast plate. */}
      <span
        aria-hidden
        className="from-jet/40 absolute inset-0 bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="text-meta text-cream/0 group-hover:text-cream/80 absolute bottom-3 left-3 mix-blend-difference transition-colors duration-500"
      >
        {String(index + 1).padStart(2, '0')}
      </span>
    </motion.button>
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
  // Lock body scroll while the lightbox is open + bind keyboard nav.
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
          {/* photo crossfade keyed on index */}
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

          {/* top bar — count + close */}
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

          {/* prev / next */}
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
