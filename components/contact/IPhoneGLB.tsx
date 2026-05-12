'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Group, Material, Mesh, MeshStandardMaterial } from 'three';

interface Props {
  /** Path to the glTF/GLB iPhone model under /public. */
  modelUrl?: string;
}

const MODEL_URL_DEFAULT = '/models/iphone_14_pro.glb';

/**
 * Normalises every material in a loaded glTF/GLB scene so the model
 * renders predictably:
 *   - `transparent: false` + `depthWrite: true` — kills the alpha-mode-
 *     BLEND see-through that Sketchfab exporters sometimes leave on
 *     opaque objects (the iPhone's frame).
 *   - `side: FrontSide` so we never see geometry from the inside.
 *   - Roughness clamped to ≥ 0.5 and metalness ≤ 0.6 — flattens the
 *     glossy environment reflections that otherwise make the baked
 *     textures "shimmer" as the user rotates the device.
 */
function normaliseMaterials(scene: Group) {
  scene.traverse((obj) => {
    const mesh = obj as Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((mat: Material) => {
      mat.transparent = false;
      mat.depthWrite = true;
      mat.side = THREE.FrontSide;
      const std = mat as MeshStandardMaterial;
      if (typeof std.roughness === 'number') {
        std.roughness = Math.max(std.roughness, 0.5);
      }
      if (typeof std.metalness === 'number') {
        std.metalness = Math.min(std.metalness, 0.6);
      }
      mat.needsUpdate = true;
    });
  });
}

/**
 * iPhone 14 Pro by "mister dude" (CC-BY 4.0 — see contact page footer).
 *
 * Renders the model with its baked textures (frame finish, screen
 * wallpaper, camera bump) and exposes drag-to-rotate via OrbitControls.
 * No auto-motion. No overlay. The material normaliser runs once after
 * load so we get consistent, non-see-through surfaces regardless of
 * what the GLB exporter shipped.
 */
function Device({ modelUrl }: Required<Props>) {
  const { scene } = useGLTF(modelUrl) as unknown as { scene: Group };
  const { viewport } = useThree();

  useEffect(() => {
    if (scene) normaliseMaterials(scene);
  }, [scene]);

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

  // Default framing: screen facing the camera with a subtle tilt that
  // reveals the right-edge bezel — matches the reference screenshot.
  // `Math.PI` flips the model so its screen faces +Z (the model's
  // natural orientation has the screen on -Z, hence the bare-flip);
  // -0.15 on Y adds the small clockwise tilt.
  return (
    <group rotation={[0, Math.PI - 0.15, 0]} scale={layout.scale}>
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
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 4]} intensity={1.4} castShadow />
      <directionalLight position={[-4, -1, -2]} intensity={0.5} color="#9aa6b2" />

      <Suspense fallback={null}>
        <Device modelUrl={modelUrl} />
        <Environment preset="studio" />
      </Suspense>

      {ready && (
        <ContactShadows position={[0, -2, 0]} opacity={0.45} scale={6} blur={2.8} far={2.5} />
      )}

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

// Preload BOTH the GLB structure AND its embedded textures at module load
// time, so by the time the user navigates to /contact the GPU already
// has the bitmaps decoded. Drei's GLTFLoader handles the glb-embedded
// JPEG/PNGs internally via THREE.TextureLoader, so a single preload call
// covers everything.
useGLTF.preload(MODEL_URL_DEFAULT);
