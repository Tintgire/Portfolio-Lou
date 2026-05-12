'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, RoundedBox, useTexture } from '@react-three/drei';
import type { Group, Mesh } from 'three';
import * as THREE from 'three';

interface Props {
  /** Path to the photo to display on the screen (served from /public). */
  photoUrl: string;
}

/**
 * iPhone 15 Pro–style device modelled with @react-three/drei primitives:
 *   - Titanium frame: RoundedBox with metalness + low roughness PBR material
 *   - Screen: textured plane with the supplied photo
 *   - Dynamic Island, side buttons, camera bump
 *
 * The whole device sits inside a <Float> wrapper so it breathes gently
 * (subtle rotation + bobbing) without ever drifting from the heavy
 * initial tilt that gives the side-on, editorial feel the user asked for.
 */
function Device({ photoUrl }: Props) {
  const groupRef = useRef<Group>(null);
  const photo = useTexture(photoUrl);
  // The gallery photos are portrait (~0.80 aspect) but the phone screen
  // plane is even more portrait (~0.46), so without cropping the photo
  // would be horizontally squashed. We compute the centre-crop window
  // once and stash it on the texture itself — three.js textures are
  // designed to be mutated post-load, so the eslint immutability rule
  // is a false positive here.
  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    photo.center.set(0.5, 0.5);
    photo.wrapS = THREE.ClampToEdgeWrapping;
    photo.wrapT = THREE.ClampToEdgeWrapping;
    photo.colorSpace = THREE.SRGBColorSpace;
    const screenAspect = 0.92 / 2.0;
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
    photo.needsUpdate = true;
    /* eslint-enable react-hooks/immutability */
  }, [photo]);

  // Very slow continuous yaw drift so reflections move — sells the 3D.
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
      <group ref={groupRef} rotation={[0.18, -0.78, 0.05]}>
        {/* Body — titanium-like frame */}
        <RoundedBox
          args={[1, 2.08, 0.115]}
          radius={0.13}
          smoothness={6}
          creaseAngle={0.4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="#222226" metalness={0.85} roughness={0.32} />
        </RoundedBox>

        {/* Screen — photo texture */}
        <mesh position={[0, 0, 0.0585]}>
          <planeGeometry args={[0.92, 2.0]} />
          <meshBasicMaterial map={photo} toneMapped={false} />
        </mesh>

        {/* Screen bezel — a slightly recessed black surround behind the photo */}
        <mesh position={[0, 0, 0.058]}>
          <planeGeometry args={[0.94, 2.02]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Dynamic Island */}
        <mesh position={[0, 0.93, 0.0595]}>
          <planeGeometry args={[0.3, 0.06]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Glass overlay — a faint glossy reflection plane on top of the screen */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[0.92, 2.0]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.08}
            roughness={0.05}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.05}
            transmission={0.4}
          />
        </mesh>

        {/* Side buttons — left (volume up, down, action) */}
        <Button position={[-0.51, 0.55, 0]} length={0.18} />
        <Button position={[-0.51, 0.32, 0]} length={0.18} />
        <Button position={[-0.51, 0.05, 0]} length={0.12} />
        {/* Right (power) */}
        <Button position={[0.51, 0.3, 0]} length={0.32} />

        {/* Camera bump (back) — rounded square plate + 3 lenses */}
        <group position={[-0.28, 0.7, -0.062]}>
          <RoundedBox args={[0.36, 0.36, 0.025]} radius={0.06} smoothness={4}>
            <meshStandardMaterial color="#1c1c1f" metalness={0.7} roughness={0.45} />
          </RoundedBox>
          <Lens position={[-0.08, 0.08, 0.015]} />
          <Lens position={[0.08, 0.08, 0.015]} />
          <Lens position={[-0.08, -0.08, 0.015]} />
          {/* LED flash — small flat disc facing the camera */}
          <mesh position={[0.08, -0.08, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.01, 24]} />
            <meshStandardMaterial color="#fff8c4" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

function Button({ position, length }: { position: [number, number, number]; length: number }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.025, length, 0.06]} />
      <meshStandardMaterial color="#2c2c30" metalness={0.85} roughness={0.3} />
    </mesh>
  );
}

function Lens({ position }: { position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {/* Bezel ring — short cylinder with its flat face toward the camera */}
      <mesh>
        <cylinderGeometry args={[0.075, 0.075, 0.02, 32]} />
        <meshStandardMaterial color="#3a3a3f" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Glass element — sits a hair above the bezel */}
      <mesh ref={ref} position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.01, 32]} />
        <meshPhysicalMaterial
          color="#0a0a14"
          metalness={0.2}
          roughness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.02}
        />
      </mesh>
    </group>
  );
}

/**
 * Wraps the device in a <Canvas> with studio lighting + soft contact
 * shadows so it reads as a polished press shot instead of a flat CSS
 * mockup.
 */
export function IPhone3D({ photoUrl }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 28 }}
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-4, -1, -2]} intensity={0.5} color="#9aa6b2" />

      <Suspense fallback={null}>
        <Device photoUrl={photoUrl} />
        <Environment preset="studio" />
      </Suspense>

      <ContactShadows position={[0, -1.2, 0]} opacity={0.45} scale={5} blur={2.8} far={2.2} />
    </Canvas>
  );
}
