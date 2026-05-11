'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'motion/react';

interface Props {
  /** Final integer value, e.g. 1, 2, 12 */
  value: number;
  /** Total digits (zero-padded). Defaults to 2. */
  digits?: number;
  /** Animation duration in seconds. */
  duration?: number;
  className?: string;
}

/**
 * Number counter that ticks 0 → value when the element scrolls into view.
 * Pads with leading zeros (e.g. value=1, digits=2 → "01"). Fires once.
 */
export function NumberCounter({ value, digits = 2, duration = 1.4, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [display, setDisplay] = useState<string>('0'.repeat(digits));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 0.61, 0.36, 1],
      onUpdate: (latest) => {
        setDisplay(Math.round(latest).toString().padStart(digits, '0'));
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, digits]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
