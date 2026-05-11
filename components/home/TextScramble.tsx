'use client';

import { useEffect, useRef, useState } from 'react';

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#@$%&';

interface Props {
  /** Final text to land on */
  text: string;
  /** Delay before scramble starts, in ms */
  delay?: number;
  /** Total duration of the scramble pass, in ms */
  duration?: number;
  className?: string;
}

/**
 * Cycles each character through random scramble chars before settling on the
 * target text. Inspired by 21st.dev's "Modern Animated Hero" — adapted to be
 * lighter and to respect prefers-reduced-motion.
 */
export function TextScramble({ text, delay = 0, duration = 900, className }: Props) {
  const [output, setOutput] = useState(text);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // output already initialised to text via useState — nothing to do when motion is suppressed
    if (prefersReduced) return;

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
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [text, delay, duration]);

  return (
    <span className={className} aria-label={text}>
      {output}
    </span>
  );
}
