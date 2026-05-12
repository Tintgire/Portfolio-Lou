'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#@$%&';

interface Props {
  /** Final text to land on */
  text: string;
  /** Delay before scramble starts, in ms */
  delay?: number;
  /** Total duration of the scramble pass, in ms */
  duration?: number;
  className?: string;
  /**
   * When the scramble fires.
   * - 'mount' (default): runs once when the component mounts.
   * - 'hover': re-runs on every pointerenter / focus.
   */
  trigger?: 'mount' | 'hover';
}

/**
 * Cycles each character through random scramble chars before settling on the
 * target text. Inspired by 21st.dev's "Modern Animated Hero" — adapted to be
 * lighter and to respect prefers-reduced-motion.
 */
export function TextScramble({
  text,
  delay = 0,
  duration = 900,
  className,
  trigger = 'mount',
}: Props) {
  const [output, setOutput] = useState(text);
  const rafRef = useRef<number | null>(null);

  const run = useCallback(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // When motion is suppressed, leave `output` at whatever React renders
    // it to (initial `text` via useState, or last settled value).
    if (prefersReduced) return;
    // Cancel any in-flight pass so a rapid re-hover restarts cleanly.
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now + delay;
      const elapsed = now - start;
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      const settled = Math.floor(progress * text.length);
      let next = '';
      for (let i = 0; i < text.length; i++) {
        if (i < settled || text[i] === ' ') {
          next += text[i];
        } else {
          next += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      setOutput(next);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setOutput(text);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [text, delay, duration]);

  // For trigger='mount', the scramble pass schedules its first setState
  // via requestAnimationFrame inside `run` — i.e. always asynchronously,
  // so this useEffect itself never touches state synchronously.
  // For trigger='hover', the locale switch (which changes `text`) is a
  // full route change that remounts the component, so a stale `output`
  // is not a risk we need to guard against here.
  useEffect(() => {
    if (trigger === 'mount') run();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [trigger, run]);

  const hoverHandlers = trigger === 'hover' ? { onPointerEnter: run, onFocus: run } : undefined;

  return (
    <span className={className} aria-label={text} {...hoverHandlers}>
      {output}
    </span>
  );
}
