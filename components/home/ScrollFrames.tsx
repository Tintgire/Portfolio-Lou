'use client';

import { useEffect, useRef, useState } from 'react';
import type { MotionValue } from 'motion/react';

interface Props {
  /** Motion value 0→1 representing scroll progress over the parent section. */
  progress: MotionValue<number>;
  /** Number of frames in the sequence. They must live at /videos/frames/f-{001..count}.webp */
  count: number;
  /** Native pixel width of each frame. Used to size the canvas backing store. */
  frameWidth?: number;
  /** Native pixel height of each frame. */
  frameHeight?: number;
  className?: string;
}

/**
 * Frame-sequence scroll player — the Awwwards-tier alternative to scrubbing a
 * `<video>`. Every frame is preloaded **and** GPU-decoded (via `Image.decode()`)
 * before scrub is enabled. After that, paint is just `drawImage()` on an
 * already-decoded bitmap (~0.3ms) — no decoder restarts, no keyframe rolls,
 * no Lenis-induced thrashing.
 *
 * Why we wait for ALL frames before allowing scrub:
 *   If we start scrubbing while frames are still streaming in, the user can
 *   easily scroll past unloaded frames. drawImage() is gated on
 *   `img.complete`, so it silently keeps the last good frame — looks frozen,
 *   reads as "choppy". By gating the rAF loop on `decoded === count`, we
 *   guarantee every scrub position lands on a paintable frame.
 */
export function ScrollFrames({
  progress,
  count,
  frameWidth = 1280,
  frameHeight = 720,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const [decoded, setDecoded] = useState(0);
  const [firstReady, setFirstReady] = useState(false);

  const ready = decoded >= count;

  // Preload every frame *and force-decode it* so the first drawImage on each
  // frame doesn't trigger a synchronous decode (which would micro-stutter).
  useEffect(() => {
    const arr: (HTMLImageElement | null)[] = new Array(count).fill(null);
    framesRef.current = arr;
    let alive = true;
    let count_ready = 0;

    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = `/videos/frames/f-${String(i + 1).padStart(3, '0')}.webp`;
      // Force decode (returns a Promise). When it resolves, the bitmap is
      // ready for drawImage with zero latency on first paint.
      img
        .decode()
        .then(() => {
          if (!alive) return;
          arr[i] = img;
          count_ready++;
          setDecoded(count_ready);
          if (i === 0) setFirstReady(true);
        })
        .catch(() => {
          // some images may fail to decode (e.g. cancelled mid-flight); tolerate
          if (!alive) return;
          count_ready++;
          setDecoded(count_ready);
        });
    }
    return () => {
      alive = false;
    };
  }, [count]);

  // Paint the first frame as soon as it's decoded so the section isn't blank
  // while we wait for the rest to come in.
  useEffect(() => {
    if (!firstReady) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const first = framesRef.current[0];
    if (canvas && ctx && first) {
      ctx.drawImage(first, 0, 0, canvas.width, canvas.height);
    }
  }, [firstReady]);

  // rAF scrub loop — only runs once ALL frames are decoded. Each tick paints
  // the matching frame at most once per refresh; skips when the resolved
  // frame index hasn't changed.
  useEffect(() => {
    if (!ready) return;
    let rafId = 0;
    let lastIndex = -1;

    const tick = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        const p = Math.max(0, Math.min(progress.get(), 1));
        const idx = Math.min(count - 1, Math.floor(p * count));
        if (idx !== lastIndex) {
          const img = framesRef.current[idx];
          if (img) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            lastIndex = idx;
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [ready, progress, count]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={frameWidth}
        height={frameHeight}
        className={className}
        aria-hidden
      />
      {/* Subtle bottom-edge loading bar while the sequence preloads. Disappears
          the moment everything is decoded and the scrub is active. */}
      {!ready && (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 z-10 h-px w-full bg-white/10"
        >
          <div
            className="bg-cream h-full transition-[width] duration-200 ease-out"
            style={{ width: `${(decoded / count) * 100}%` }}
          />
        </div>
      )}
    </>
  );
}
