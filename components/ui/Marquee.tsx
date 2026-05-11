'use client';

import { motion } from 'motion/react';

interface Props {
  /** Words rendered in the band. Repeated indefinitely. */
  items: string[];
  /** Seconds for a full loop. Lower = faster. Default 38s gives a cinematic crawl. */
  duration?: number;
  /** Reverse direction. */
  reverse?: boolean;
  className?: string;
}

/**
 * Infinite horizontal marquee. Duplicates the list once so the loop can wrap
 * seamlessly via `x: 0 → -50%` translation.
 */
export function Marquee({ items, duration = 38, reverse = false, className }: Props) {
  return (
    <div
      className={`border-cream/15 relative overflow-hidden border-y py-6 ${className ?? ''}`}
      aria-hidden
    >
      <motion.div
        className="flex w-max gap-16 whitespace-nowrap will-change-transform"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
      >
        {[...items, ...items].map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="text-brutal text-cream/70 text-[12vw] leading-none md:text-[10vw]"
          >
            {item}
            <span className="text-signal mx-8">·</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
