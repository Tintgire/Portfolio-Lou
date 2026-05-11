'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { LipstickFallback } from './LipstickFallback';

const Scene = dynamic(() => import('./LipstickScene').then((m) => m.LipstickScene), {
  ssr: false,
  loading: () => <LipstickFallback />,
});

function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getWebGLSupported(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!gl;
  } catch {
    return false;
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(getReducedMotion);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function useWebGL() {
  const [supported] = useState(getWebGLSupported);
  return supported;
}

export function LipstickCanvas() {
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  if (reduced || !webgl) return <LipstickFallback />;
  return (
    <Suspense fallback={<LipstickFallback />}>
      <Scene />
    </Suspense>
  );
}
