'use client';

import { Environment } from '@react-three/drei';

export function Stage() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 3, -3]} intensity={0.4} color="#ff3b00" />
      <Environment preset="studio" environmentIntensity={0.4} />
    </>
  );
}
