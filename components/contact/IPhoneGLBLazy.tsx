'use client';

import dynamic from 'next/dynamic';

// `ssr: false` with next/dynamic requires a Client Component host.
const IPhoneGLBInternal = dynamic(() => import('./IPhoneGLB').then((m) => m.IPhoneGLB), {
  ssr: false,
});

interface Props {
  modelUrl?: string;
  screenImageUrl?: string;
  /** If provided, clicking the iPhone's screen opens this URL in a new tab. */
  screenLink?: string;
}

export function IPhoneGLBLazy(props: Props) {
  return <IPhoneGLBInternal {...props} />;
}
