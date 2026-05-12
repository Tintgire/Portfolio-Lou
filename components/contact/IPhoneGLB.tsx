'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Group, Material, Mesh, MeshStandardMaterial } from 'three';

interface Props {
  /** Path to the glTF/GLB iPhone model under /public. */
  modelUrl?: string;
  /** Optional screenshot/image displayed on the iPhone's screen. */
  screenImageUrl?: string;
}

const MODEL_URL_DEFAULT = '/models/iphone_14_pro.glb';

/**
 * Normalises every material in a loaded glTF/GLB scene:
 *   - `transparent: false` + `depthWrite: true` — kills the alphaMode-
 *     BLEND see-through that the Sketchfab exporter sometimes leaves on.
 *   - `side: FrontSide` so we never see geometry from the inside.
 *   - Roughness ≥ 0.5 and metalness ≤ 0.6 — flattens the glossy HDRI
 *     reflections that otherwise make the textures shimmer on rotate.
 */
/**
 * Builds a rounded-rect ShapeGeometry sized in the local XY plane so it
 * matches the iPhone's actual visible screen area (rounded corners and
 * all). UVs are remapped so the supplied texture covers the full
 * bounding rectangle from (0,0) to (1,1) — the rounded corners simply
 * mask the texture's edges.
 */
function makeRoundedScreenGeometry(width: number, height: number, radius: number) {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w * 0.99, h * 0.99);

  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);

  const geometry = new THREE.ShapeGeometry(shape, 24);

  // Default ShapeGeometry UVs map vertex world-space positions directly,
  // which doesn't fit our (0..1) texture. Remap so each vertex's UV is
  // its position within the bounding rect.
  const positions = geometry.attributes.position!;
  const uvs = new Float32Array(positions.count * 2);
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    uvs[i * 2] = (x + w) / width;
    uvs[i * 2 + 1] = (y + h) / height;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

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
      if (typeof std.roughness === 'number') std.roughness = Math.max(std.roughness, 0.5);
      if (typeof std.metalness === 'number') std.metalness = Math.min(std.metalness, 0.6);
      mat.needsUpdate = true;
    });
  });
}

function Device({ modelUrl, screenImageUrl }: { modelUrl: string; screenImageUrl?: string }) {
  const { scene } = useGLTF(modelUrl) as unknown as { scene: Group };
  const { viewport } = useThree();
  // Hooks rules require the texture hook to run unconditionally. We pass
  // an empty placeholder when no screen image is configured; the plane
  // itself is conditionally rendered below.
  const screenTexture = useTexture(screenImageUrl ?? '/contact/.placeholder.png', () => undefined);

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
      // Sketchfab's iPhone bbox is slightly inflated relative to the
      // visible device (the model's bezels/glass overlay puff up size.x
      // by ~7-8% over the real device width). To match the actual
      // visible screen area we need conservative inset percentages:
      // ~76% × 84% rather than the textbook iPhone 14 Pro screen ratio
      // of 84.5% × 88.6%. Positioned at the very front face so a side
      // view sees the plane edge-on, flush with the device. PolygonOffset
      // on the material handles z-fighting against the baked pixels.
      screenWidth: size.x * 0.76,
      screenHeight: size.y * 0.85,
      screenRadius: size.x * 0.07,
      screenZ: -size.z / 2,
      screenAspect: (size.x * 0.76) / (size.y * 0.85),
    };
  }, [bbox, viewport.height]);

  // Configure the screen texture once it's loaded + once we know the
  // screen aspect ratio: sRGB colour, centre-crop to fit the screen
  // dimensions so the IG screenshot isn't squashed.
  useEffect(() => {
    if (!layout || !screenImageUrl) return;
    /* eslint-disable react-hooks/immutability */
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.center.set(0.5, 0.5);
    screenTexture.wrapS = THREE.ClampToEdgeWrapping;
    screenTexture.wrapT = THREE.ClampToEdgeWrapping;
    const img = screenTexture.image as { width?: number; height?: number } | null | undefined;
    const photoAspect = (img?.width ?? 1170) / (img?.height ?? 2532);
    if (photoAspect > layout.screenAspect) {
      const cover = layout.screenAspect / photoAspect;
      screenTexture.repeat.set(cover, 1);
      screenTexture.offset.set((1 - cover) / 2, 0);
    } else {
      const cover = photoAspect / layout.screenAspect;
      screenTexture.repeat.set(1, cover);
      screenTexture.offset.set(0, (1 - cover) / 2);
    }
    screenTexture.needsUpdate = true;
    /* eslint-enable react-hooks/immutability */
  }, [screenTexture, layout, screenImageUrl]);

  // Rounded-rect geometry for the screen overlay — recomputed when the
  // layout changes (i.e. on viewport resize) so the corner radius stays
  // proportional to the device.
  const screenGeometry = useMemo(() => {
    if (!layout) return null;
    return makeRoundedScreenGeometry(layout.screenWidth, layout.screenHeight, layout.screenRadius);
  }, [layout]);

  if (!layout) return null;

  // The iPhone model's screen natively faces -Z. The outer group adds
  // Math.PI to flip it toward the camera + a -0.4 rad clockwise tilt.
  // The overlay sits inside the recentred inner group at the screen-
  // face position; its own local rotation Math.PI around Y flips its
  // native +Z normal to -Z so it ends up coplanar with the device's
  // front face after the outer transforms.
  return (
    <group rotation={[0, Math.PI - 0.4, 0]} scale={layout.scale}>
      <group position={layout.sceneOffset}>
        <primitive object={scene} />
        {screenImageUrl && screenGeometry && (
          <mesh
            geometry={screenGeometry}
            position={[0, 0, layout.screenZ]}
            rotation={[0, Math.PI, 0]}
          >
            <meshBasicMaterial
              map={screenTexture}
              toneMapped={false}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

export function IPhoneGLB({ modelUrl = MODEL_URL_DEFAULT, screenImageUrl }: Props) {
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
        <Device modelUrl={modelUrl} screenImageUrl={screenImageUrl} />
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

useGLTF.preload(MODEL_URL_DEFAULT);
