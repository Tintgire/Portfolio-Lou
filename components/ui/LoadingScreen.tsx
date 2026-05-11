'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * First-paint cinematic intro: black panel covers the viewport, the three LOU
 * letters slide up from below with stagger, then the whole panel slides off
 * the top, revealing the hero underneath.
 *
 * Total runtime: ~1.6s. Only fires once per session (no localStorage gate yet
 * — every full page load gets the intro).
 */
export function LoadingScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // give the LOU stagger time to play (3 * 0.12s delay + 0.6s anim ≈ 0.96s)
    // then let it sit for a beat before lifting off
    const t = window.setTimeout(() => setDone(true), 1400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          aria-hidden
          className="bg-jet pointer-events-none fixed inset-0 z-[200] grid place-items-center"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="text-brutal text-cream flex overflow-hidden text-[24vw] leading-none">
            {['L', 'O', 'U'].map((char, i) => (
              <motion.span
                key={char}
                className="inline-block"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.15 + i * 0.12,
                  ease: [0.76, 0, 0.24, 1],
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
