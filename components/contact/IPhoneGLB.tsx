'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { DecalGeometry } from 'three/examples/jsm/geometries/DecalGeometry.js';
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

/**
 * Builds a CanvasTexture for the iPhone screen: the IG screenshot is
 * cover-fitted into the decal's aspect ratio, drawn on a black
 * background and clipped to a rounded rectangle. The black background
 * blends seamlessly with the iPhone's black bezel where the decal
 * projects past the rounded screen corners.
 */
function makeScreenCanvasTexture(
  img: HTMLImageElement,
  decalAspect: number,
  cornerRadiusFraction: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const HEIGHT = 2048;
  canvas.height = HEIGHT;
  canvas.width = Math.round(HEIGHT * decalAspect);
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const r = canvas.width * cornerRadiusFraction;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(canvas.width - r, 0);
  ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
  ctx.lineTo(canvas.width, canvas.height - r);
  ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
  ctx.lineTo(r, canvas.height);
  ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.save();
  ctx.clip();

  // Cover-fit the IG image inside the rounded rect.
  const imgAspect = img.width / img.height;
  const canvasAspect = canvas.width / canvas.height;
  let drawW: number, drawH: number, drawX: number, drawY: number;
  if (imgAspect > canvasAspect) {
    drawH = canvas.height;
    drawW = drawH * imgAspect;
    drawX = (canvas.width - drawW) / 2;
    drawY = 0;
  } else {
    drawW = canvas.width;
    drawH = drawW / imgAspect;
    drawX = 0;
    drawY = (canvas.height - drawH) / 2;
  }
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function Device({ modelUrl, screenImageUrl }: { modelUrl: string; screenImageUrl?: string }) {
  const { scene } = useGLTF(modelUrl) as unknown as { scene: Group };
  const { viewport } = useThree();

  // Load the IG image manually so we can composite it on a canvas with
  // rounded corners. useTexture would hand us a Three texture wrapping
  // the raw image, but we need pixel-level control for the rounded mask.
  const [igImage, setIgImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!screenImageUrl) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setIgImage(img);
    img.src = screenImageUrl;
  }, [screenImageUrl]);

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

  // Find the iPhone mesh in the loaded scene — single-mesh model so
  // the first hit is always the body.
  const targetMesh = useMemo<Mesh | null>(() => {
    if (!scene) return null;
    const meshes: Mesh[] = [];
    scene.traverse((obj) => {
      const m = obj as Mesh;
      if (m.isMesh) meshes.push(m);
    });
    return meshes[0] ?? null;
  }, [scene]);

  // Build the rounded-corner screen texture from the IG image. The
  // decal area is 93% × 98% of the iPhone bbox (calibrated visually);
  // 18% corner radius matches the iPhone 14 Pro screen curvature.
  const screenTexture = useMemo(() => {
    if (!igImage) return null;
    const decalAspect = (0.93 * 0.0836) / (0.98 * 0.171);
    return makeScreenCanvasTexture(igImage, decalAspect, 0.18);
  }, [igImage]);

  // Project the screen texture onto the iPhone mesh via DecalGeometry.
  // The decal is computed from the mesh's actual surface, so it
  // literally IS part of the iPhone's geometry — no parallax, no
  // "sticker on top" feel when the device rotates. The decal mesh is
  // attached as a child of the target mesh so it inherits every
  // transform (group rotation, scale, OrbitControls drag).
  useEffect(() => {
    if (!targetMesh || !screenTexture) return;

    targetMesh.updateMatrixWorld(true);

    if (!targetMesh.geometry.boundingBox) {
      targetMesh.geometry.computeBoundingBox();
    }
    const localBbox = targetMesh.geometry.boundingBox!;
    const localCentre = new THREE.Vector3();
    const localSize = new THREE.Vector3();
    localBbox.getCenter(localCentre);
    localBbox.getSize(localSize);

    // Screen face sits at the most -Z point of the mesh (model's
    // native orientation faces -Z).
    const localFront = new THREE.Vector3(
      localCentre.x,
      localCentre.y,
      localCentre.z - localSize.z / 2,
    );
    const worldFront = localFront.clone().applyMatrix4(targetMesh.matrixWorld);

    // Orientation = mesh's world rotation, so the decal projects along
    // the mesh's local -Z direction (the screen normal).
    const meshRotation = new THREE.Quaternion();
    const meshTranslation = new THREE.Vector3();
    const meshScale = new THREE.Vector3();
    targetMesh.matrixWorld.decompose(meshTranslation, meshRotation, meshScale);
    const orientation = new THREE.Euler().setFromQuaternion(meshRotation);

    // Decal volume in WORLD space, with depth large enough to catch
    // every triangle of the front face regardless of subtle Z variation.
    const decalSize = new THREE.Vector3(
      localSize.x * meshScale.x * 0.93,
      localSize.y * meshScale.y * 0.98,
      localSize.z * meshScale.z * 1.5,
    );

    const decalGeo = new DecalGeometry(targetMesh, worldFront, orientation, decalSize);

    const decalMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });

    const decal = new THREE.Mesh(decalGeo, decalMat);
    decal.name = '__ig_decal';
    targetMesh.add(decal);

    return () => {
      targetMesh.remove(decal);
      decalGeo.dispose();
      decalMat.dispose();
    };
  }, [targetMesh, screenTexture]);

  if (!layout) return null;

  return (
    <group rotation={[0, Math.PI - 0.4, 0]} scale={layout.scale}>
      <group position={layout.sceneOffset}>
        <primitive object={scene} />
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
