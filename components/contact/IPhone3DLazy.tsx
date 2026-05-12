'use client';

import dynamic from 'next/dynamic';

// `ssr: false` with next/dynamic is only allowed inside Client Components
// (Next.js 16). The contact page itself is a Server Component (no use
// client), so we wrap the dynamic import in this tiny client island.
const IPhone3DInternal = dynamic(() => import('./IPhone3D').then((m) => m.IPhone3D), {
  ssr: false,
});

interface Props {
  photoUrl: string;
}

export function IPhone3DLazy(props: Props) {
  return <IPhone3DInternal {...props} />;
}
