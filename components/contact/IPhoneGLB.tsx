'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Group } from 'three';

interface Props {
  /** Path to the glTF/GLB iPhone model under /public. */
  modelUrl?: string;
}

const MODEL_URL_DEFAULT = '/models/iphone_14_pro.glb';

/**
 * iPhone 14 Pro by "mister dude" (CC-BY 4.0 — see contact page footer).
 *
 * The model ships with its own baked textures (frame, screen wallpaper,
 * camera bump) that already look gorgeous, so we render it as-is: no
 * overlay, no auto-rotation, no idle bobbing. The user takes over via
 * <OrbitControls> — click & drag to rotate, controls release on pointer-
 * up. Zoom and pan are disabled to keep the device locked at a sensible
 * size in the page composition.
 */
function Device({ modelUrl }: Required<Props>) {
  const { scene } = useGLTF(modelUrl) as unknown as { scene: Group };
  const { viewport } = useThree();

  const bbox = useMemo(() => {
    if (!scene) return null;
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);
    return { size, centre };
  }, [scene]);

  const layout = useMemo(() => {
    if (!bbox) return null;
    const { size, centre } = bbox;
    const targetHeight = viewport.height * 0.85;
    const longest = Math.max(size.x, size.y, size.z);
    return {
      scale: targetHeight / longest,
      sceneOffset: [-centre.x, -centre.y, -centre.z] as [number, number, number],
    };
  }, [bbox, viewport.height]);

  if (!layout) return null;

  return (
    <group rotation={[0, -0.45, 0]} scale={layout.scale}>
      {/* Recentre the scene so OrbitControls rotates around the device
          centre, not around its origin corner. */}
      <group position={layout.sceneOffset}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

export function IPhoneGLB({ modelUrl = MODEL_URL_DEFAULT }: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 32 }} dpr={[1, 2]} shadows gl={{ antialias: true }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 4]} intensity={1.5} castShadow />
      <directionalLight position={[-4, -1, -2]} intensity={0.55} color="#9aa6b2" />

      <Suspense fallback={null}>
        <Device modelUrl={modelUrl} />
        <Environment preset="studio" />
      </Suspense>

      {ready && (
        <ContactShadows position={[0, -2, 0]} opacity={0.45} scale={6} blur={2.8} far={2.5} />
      )}

      {/* Click & drag to rotate. Zoom + pan disabled so the user can't
          accidentally throw the iPhone off-screen. Damping gives the
          rotation a slight inertia after release, which feels premium. */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(2 * Math.PI) / 3}
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL_DEFAULT);
