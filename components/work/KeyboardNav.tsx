'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
  nextHref?: string;
  prevHref?: string;
}

export function KeyboardNav({ nextHref, prevHref }: Props) {
  const router = useRouter();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && nextHref) router.push(nextHref);
      if (e.key === 'ArrowLeft' && prevHref) router.push(prevHref);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router, nextHref, prevHref]);
  return null;
}
