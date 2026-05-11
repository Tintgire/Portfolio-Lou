'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * Tap-to-enter splash. The three LOU letters slide up from below with
 * a stagger; once they settle (~1.1s) a discreet "ENTER" cue fades in
 * and the panel becomes clickable. Any click or Enter/Space keypress
 * lifts the panel off the top and — crucially — serves as the user
 * gesture that unlocks the ambient audio (the AmbientAudio component
 * listens for any window pointerdown/keydown and starts playback the
 * moment one fires).
 *
 * Browsers (Chrome, Safari, Firefox) all block audio playback without
 * a user activation gesture — a splash that explicitly waits for a tap
 * is the only way to make music feel like it starts "the moment you
 * arrive". After the first visit, browsers grant the origin media-
 * engagement credit and the audio actually does start on its own.
 */
export function LoadingScreen() {
  const [done, setDone] = useState(false);
  const [cueReady, setCueReady] = useState(false);

  useEffect(() => {
    // Let the LOU stagger play out (3 letters × 0.12s + 0.7s ≈ 1.06s)
    // before inviting the user to enter.
    const t = window.setTimeout(() => setCueReady(true), 1100);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') setDone(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          aria-label="Tap to enter"
          role="button"
          tabIndex={0}
          onClick={() => setDone(true)}
          className="bg-jet fixed inset-0 z-[200] grid cursor-pointer place-items-center"
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

          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={cueReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="text-meta text-cream/60 absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            ↵ ENTER · TAP ANYWHERE
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
