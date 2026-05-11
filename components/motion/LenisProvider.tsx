'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Wraps the entire app with Lenis-driven smooth scrolling and bridges Lenis →
 * GSAP ScrollTrigger so the existing scroll-driven reveal animations stay in
 * sync with the eased scroll position.
 *
 * Duration tuning: 0.9s with an expo-out curve. Most of the motion happens in
 * the first 30% of the ease, so the perceived "tail" after the user stops
 * scrolling is ~0.2s — fast enough that the frame-sequence scrub doesn't
 * appear to keep advancing on its own. Going much shorter (<0.6s) starts to
 * feel like raw wheel input; going longer (>1.2s) makes the hero video
 * "ghost forward" after stop.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
