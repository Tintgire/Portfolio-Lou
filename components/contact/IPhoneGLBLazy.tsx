'use client';

import dynamic from 'next/dynamic';

// `ssr: false` with next/dynamic requires a Client Component host.
const IPhoneGLBInternal = dynamic(() => import('./IPhoneGLB').then((m) => m.IPhoneGLB), {
  ssr: false,
});

interface Props {
  photoUrl: string;
  modelUrl?: string;
  screenMeshHint?: string;
}

export function IPhoneGLBLazy(props: Props) {
  return <IPhoneGLBInternal {...props} />;
}
