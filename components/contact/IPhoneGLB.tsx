'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Float, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Group } from 'three';

interface Props {
  /** Path to the glTF/GLB iPhone model under /public. */
  modelUrl?: string;
  /** Photo to project onto the device's screen — served from /public. */
  photoUrl: string;
}

const MODEL_URL_DEFAULT = '/models/iphone_14_pro.glb';

/**
 * iPhone 14 Pro by "mister dude" — single-mesh model with a baked screen
 * (no separable screen mesh). Strategy: overlay a thin plane in front of
 * the device with Lou's photo on it. The plane is sized from the model's
 * own bounding box and the whole device is scaled to a fraction of the
 * canvas viewport, so the iPhone always fills the page regardless of
 * the GLB's authoring units (Sketchfab uploads vary wildly in scale).
 */
function Device({ modelUrl, photoUrl }: Required<Props>) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(modelUrl) as unknown as { scene: Group };
  const photo = useTexture(photoUrl);
  const { viewport } = useThree();

  // Measure the scene's bounding box once on load — independent of any
  // later viewport resize so we don't re-walk the scene graph on every
  // window change.
  const bbox = useMemo(() => {
    if (!scene) return null;
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);
    return { size, centre };
  }, [scene]);

  // Layout depends on both the bbox AND the current viewport — recomputed
  // cheaply on resize.
  const layout = useMemo(() => {
    if (!bbox) return null;
    const { size, centre } = bbox;
    // The iPhone's tallest axis fills 85 % of the canvas vertical world
    // units. viewport.height is the visible world-space height at z=0
    // for the active camera, so this scale is camera-aware.
    const targetHeight = viewport.height * 0.85;
    const longest = Math.max(size.x, size.y, size.z);
    return {
      scale: targetHeight / longest,
      sceneOffset: [-centre.x, -centre.y, -centre.z] as [number, number, number],
      planePos: [0, 0, size.z * 0.51] as [number, number, number],
      planeSize: [size.x * 0.92, size.y * 0.92] as [number, number],
      screenAspect: size.x / size.y,
    };
  }, [bbox, viewport.height]);

  // Configure the photo texture: sRGB + centre-crop to the screen aspect.
  useEffect(() => {
    if (!layout) return;
    /* eslint-disable react-hooks/immutability */
    photo.colorSpace = THREE.SRGBColorSpace;
    photo.center.set(0.5, 0.5);
    const img = photo.image as { width?: number; height?: number } | null | undefined;
    const photoAspect = (img?.width ?? 1440) / (img?.height ?? 1796);
    if (photoAspect > layout.screenAspect) {
      const cover = layout.screenAspect / photoAspect;
      photo.repeat.set(cover, 1);
      photo.offset.set((1 - cover) / 2, 0);
    } else {
      const cover = photoAspect / layout.screenAspect;
      photo.repeat.set(1, cover);
      photo.offset.set(0, (1 - cover) / 2);
    }
    photo.needsUpdate = true;
    /* eslint-enable react-hooks/immutability */
  }, [photo, layout]);

  // Slow continuous yaw so reflections shimmer — sells the 3D.
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  if (!layout) return null;

  return (
    <Float speed={1} rotationIntensity={0.12} floatIntensity={0.25}>
      <group ref={groupRef} rotation={[0, -0.45, 0]} scale={layout.scale}>
        {/* Inner group recentres the scene so the iPhone's geometric
            centre sits at origin — required for the outer rotate to
            spin around the device, not around its corner. */}
        <group position={layout.sceneOffset}>
          <primitive object={scene} />
        </group>
        {/* Screen overlay — sits at origin + halfDepth, i.e. flush with
            the device's front face after the recentring. */}
        <mesh position={layout.planePos}>
          <planeGeometry args={layout.planeSize} />
          <meshBasicMaterial map={photo} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

export function IPhoneGLB({ modelUrl = MODEL_URL_DEFAULT, photoUrl }: Props) {
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
        <Device modelUrl={modelUrl} photoUrl={photoUrl} />
        <Environment preset="studio" />
      </Suspense>

      {ready && (
        <ContactShadows position={[0, -2, 0]} opacity={0.45} scale={6} blur={2.8} far={2.5} />
      )}
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL_DEFAULT);
