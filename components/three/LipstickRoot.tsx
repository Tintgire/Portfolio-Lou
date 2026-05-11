'use client';

import { usePathname } from 'next/navigation';
import { LipstickCanvas } from './LipstickCanvas';

export function LipstickRoot() {
  const pathname = usePathname();
  const isHome = /^\/(fr|en)\/?$/.test(pathname);
  return (
    <div
      className="fixed inset-0 z-0 transition-opacity duration-300"
      style={{ opacity: isHome ? 1 : 0, pointerEvents: isHome ? 'auto' : 'none' }}
      aria-hidden
    >
      <LipstickCanvas />
    </div>
  );
}
