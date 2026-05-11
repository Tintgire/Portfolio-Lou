'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Stage } from './Stage';
import { Lipstick } from './Lipstick';

export function LipstickScene() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4.5], fov: 32 }}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      shadows={!isMobile}
    >
      <Stage />
      <Lipstick />
    </Canvas>
  );
}
