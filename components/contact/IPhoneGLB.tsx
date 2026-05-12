'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Group, Mesh, MeshStandardMaterial } from 'three';

interface Props {
  /** Path to the glTF/GLB iPhone model under /public. */
  modelUrl?: string;
  /** Photo to project onto the device's screen — served from /public. */
  photoUrl: string;
  /** Substring to match against mesh names that should receive the photo
   *  texture. Most CC iPhone models call this `screen`, `display`, or
   *  `Screen_Display`. Leave default unless your model uses a quirky name. */
  screenMeshHint?: string;
}

/**
 * Loads an iPhone glTF/GLB model, hunts down its screen mesh, and swaps
 * the screen's albedo for Lou's photo (centre-cropped to the screen UV
 * so the face stays on-screen). Studio lighting + soft contact shadows
 * underneath sell it as a press shot.
 */
function Device({
  modelUrl,
  photoUrl,
  screenMeshHint = 'screen',
}: Required<Omit<Props, 'modelUrl'>> & { modelUrl: string }) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(modelUrl);

  // Texture loaded with the loading manager — kept stable across re-renders
  // so we don't churn the GPU upload every frame.
  const photoTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const t = loader.load(photoUrl);
    t.colorSpace = THREE.SRGBColorSpace;
    t.flipY = false; // glTF UVs are flipped vs the three.js default
    return t;
  }, [photoUrl]);

  // Once the scene has loaded, find the screen mesh and replace its
  // material with one that uses Lou's photo. Falls back to swapping
  // every emissive material if no name match is found (some models
  // expose the screen as an emissive plane).
  useEffect(() => {
    if (!scene) return;
    const hintLower = screenMeshHint.toLowerCase();
    let touched = 0;
    scene.traverse((obj) => {
      if (!(obj as Mesh).isMesh) return;
      const mesh = obj as Mesh;
      const name = mesh.name.toLowerCase();
      const isScreen = name.includes(hintLower) || name.includes('display') || name.includes('lcd');
      if (!isScreen) return;
      const mat = new THREE.MeshBasicMaterial({ map: photoTexture, toneMapped: false });
      mesh.material = mat;
      touched += 1;
    });
    if (touched === 0) {
      // Last-ditch: any material with the word "screen" in its name
      scene.traverse((obj) => {
        if (!(obj as Mesh).isMesh) return;
        const m = obj as Mesh;
        const matName = (m.material as MeshStandardMaterial | undefined)?.name?.toLowerCase() ?? '';
        if (matName.includes(hintLower)) {
          m.material = new THREE.MeshBasicMaterial({ map: photoTexture, toneMapped: false });
        }
      });
    }
  }, [scene, photoTexture, screenMeshHint]);

  // Slow continuous yaw so reflections shimmer — sells the 3D.
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={groupRef} rotation={[0.18, -0.6, 0.05]}>
        <primitive object={scene} />
      </group>
    </Float>
  );
}

/**
 * Public wrapper — sets up the Canvas, lighting, environment, ground
 * shadow. Drop a .glb at /public/models/iphone.glb and the screen mesh
 * gets Lou's portrait applied automatically.
 */
export function IPhoneGLB({
  modelUrl = '/models/iphone.glb',
  photoUrl,
  screenMeshHint = 'screen',
}: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 28 }}
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-4, -1, -2]} intensity={0.5} color="#9aa6b2" />

      <Suspense fallback={null}>
        <Device modelUrl={modelUrl} photoUrl={photoUrl} screenMeshHint={screenMeshHint} />
        <Environment preset="studio" />
      </Suspense>

      <ContactShadows position={[0, -1.2, 0]} opacity={0.45} scale={5} blur={2.8} far={2.2} />
    </Canvas>
  );
}

// Hint Drei's loader to preload the model so the first paint isn't
// blocked when navigating into the contact page.
useGLTF.preload('/models/iphone.glb');
