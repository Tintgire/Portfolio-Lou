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
 * `<video>`. Every frame is preloaded as a decoded `<img>` and drawn into a
 * `<canvas>` based on scroll progress. Because the browser only has to
 * `drawImage()` an already-decoded bitmap (no video decode pipeline), the
 * swap is sub-millisecond and the scrub is butter-smooth even on mid-range
 * laptops.
 *
 * Trade-offs vs. a scrubbed video:
 * - Bandwidth: 200 WebP frames @ 1280px ≈ 6 MB total, lighter than an
 *   equivalent all-intra MP4 (~15 MB).
 * - Decode: image decode happens once on load, vs. on every seek for video.
 * - Latency: zero seek delay; frame swap is one drawImage call.
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
  const [firstReady, setFirstReady] = useState(false);

  // Preload every frame as an Image. The browser caches the decoded bitmap
  // so subsequent drawImage calls are instant.
  useEffect(() => {
    const arr: (HTMLImageElement | null)[] = new Array(count).fill(null);
    let alive = true;

    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.decoding = 'async';
      // i is 0-based; filenames are 1-based, zero-padded to 3 digits
      img.src = `/videos/frames/f-${String(i + 1).padStart(3, '0')}.webp`;
      img.onload = () => {
        if (!alive) return;
        arr[i] = img;
        // As soon as the first frame is ready, paint it so the canvas isn't blank
        if (i === 0) {
          setFirstReady(true);
        }
      };
      // we tolerate per-frame onerror silently — drawing logic guards on null
    }
    framesRef.current = arr;
    return () => {
      alive = false;
    };
  }, [count]);

  // rAF loop reads scrollYProgress and paints the matching frame at most once
  // per refresh. Skips paint when the resolved frame index hasn't changed.
  useEffect(() => {
    if (!firstReady) return;
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
          if (img && img.complete) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            lastIndex = idx;
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [firstReady, progress, count]);

  return (
    <canvas
      ref={canvasRef}
      width={frameWidth}
      height={frameHeight}
      className={className}
      aria-hidden
    />
  );
}
