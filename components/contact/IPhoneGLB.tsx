'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Group, Object3D } from 'three';

interface Props {
  /** Path to the glTF/GLB iPhone model under /public. */
  modelUrl?: string;
  /** Photo to project onto the device's screen — served from /public. */
  photoUrl: string;
}

const MODEL_URL_DEFAULT = '/models/iphone_14_pro.glb';

/**
 * iPhone 14 Pro by "mister dude" — single-mesh model with a baked texture
 * (no separable screen mesh), so we overlay a thin plane in front of the
 * device and apply Lou's photo there. The plane is sized from the model's
 * bounding box so it scales correctly regardless of the GLB's units.
 */
function Device({ modelUrl, photoUrl }: Required<Props>) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(modelUrl) as unknown as { scene: Group };
  const photo = useTexture(photoUrl);

  // Compute the bounding box once the scene is loaded so we can place
  // the screen plane in the right spot. The iPhone 14 Pro screen takes
  // ~92 % of the device width and ~94 % of its height — that fraction
  // is consistent across most CC iPhone models.
  const screenLayout = useMemo(() => {
    if (!scene) return null;
    const box = new THREE.Box3().setFromObject(scene as Object3D);
    const size = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centre);
    // Device sits along its longest axis = Y (height). The screen faces
    // +Z. Plane is placed slightly above the front face so it doesn't
    // z-fight with the baked screen pixels of the model.
    return {
      width: size.x * 0.92,
      height: size.y * 0.92,
      // 0.51 = half device depth + a small offset to clear z-fighting
      z: centre.z + size.z * 0.51,
      centre,
    };
  }, [scene]);

  // Configure the photo texture once it loads: SRGB colour, centre crop
  // to whatever aspect the screen plane needs.
  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    photo.colorSpace = THREE.SRGBColorSpace;
    photo.center.set(0.5, 0.5);
    if (screenLayout) {
      const screenAspect = screenLayout.width / screenLayout.height;
      const img = photo.image as { width?: number; height?: number } | null | undefined;
      const photoAspect = (img?.width ?? 1440) / (img?.height ?? 1796);
      if (photoAspect > screenAspect) {
        const cover = screenAspect / photoAspect;
        photo.repeat.set(cover, 1);
        photo.offset.set((1 - cover) / 2, 0);
      } else {
        const cover = photoAspect / screenAspect;
        photo.repeat.set(1, cover);
        photo.offset.set(0, (1 - cover) / 2);
      }
    }
    photo.needsUpdate = true;
    /* eslint-enable react-hooks/immutability */
  }, [photo, screenLayout]);

  // Slow continuous yaw so reflections shimmer.
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  if (!screenLayout) return null;

  return (
    <Float speed={1} rotationIntensity={0.12} floatIntensity={0.25}>
      <group ref={groupRef} rotation={[0, -0.45, 0]}>
        <primitive object={scene} />
        {/* Screen overlay — Lou's photo on a plane just in front of the
            device. Positioned via the model's bounding box so it scales
            with whatever units the GLB was authored in. */}
        <mesh position={[screenLayout.centre.x, screenLayout.centre.y, screenLayout.z]}>
          <planeGeometry args={[screenLayout.width, screenLayout.height]} />
          <meshBasicMaterial map={photo} toneMapped={false} />
        </mesh>
      </group>
    </Float>
  );
}

export function IPhoneGLB({ modelUrl = MODEL_URL_DEFAULT, photoUrl }: Props) {
  const [ready, setReady] = useState(false);
  // Drei's Canvas mounts synchronously but we want the contact-shadows
  // helper to wait until the model has loaded so the shadow doesn't
  // shift around on first paint.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 4.4], fov: 28 }}
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 4]} intensity={1.5} castShadow />
      <directionalLight position={[-4, -1, -2]} intensity={0.55} color="#9aa6b2" />

      <Suspense fallback={null}>
        <Device modelUrl={modelUrl} photoUrl={photoUrl} />
        <Environment preset="studio" />
      </Suspense>

      {ready && (
        <ContactShadows position={[0, -1.2, 0]} opacity={0.45} scale={5} blur={2.8} far={2.2} />
      )}
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL_DEFAULT);
