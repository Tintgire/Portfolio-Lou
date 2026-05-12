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
 * Builds a CanvasTexture: IG screenshot cover-fitted into the decal's
 * aspect ratio, drawn on a black background and clipped to a rounded
 * rectangle. The black background blends seamlessly with the iPhone's
 * black bezel where the decal projects past the rounded screen corners.
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
  // Flip horizontally to compensate the projector orientation: the
  // mesh's world rotation (Math.PI around Y) mirrors the projector's
  // local X, so the UVs come out reversed. Pre-flipping the canvas
  // image cancels that out and renders the IG screenshot the right way.
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
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
  const topScene = useThree((s) => s.scene);
  const { viewport } = useThree();

  // Load the IG image manually — we need pixel-level control to clip
  // it to a rounded rect before turning it into a Three texture.
  const [igImage, setIgImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!screenImageUrl) return;
    const img = new window.Image();
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

  const targetMesh = useMemo<Mesh | null>(() => {
    if (!scene) return null;
    const meshes: Mesh[] = [];
    scene.traverse((obj) => {
      const m = obj as Mesh;
      if (m.isMesh) meshes.push(m);
    });
    return meshes[0] ?? null;
  }, [scene]);

  const screenTexture = useMemo(() => {
    if (!igImage || !bbox) return null;
    // Decal area aspect = 93% width / 98% height of iPhone bbox.
    const decalAspect = (bbox.size.x * 0.93) / (bbox.size.y * 0.98);
    return makeScreenCanvasTexture(igImage, decalAspect, 0.18);
  }, [igImage, bbox]);

  // Project the screen texture onto the iPhone screen with DecalGeometry.
  //
  // DecalGeometry outputs vertices in WORLD space (DecalGeometry.js:173
  // only applies projectorMatrix, not mesh.matrixWorld.invert()). So the
  // decal mesh must be added to a parent with identity matrixWorld —
  // top-level scene. Adding it as a child of `targetMesh` (a previous
  // mistake) double-applied the mesh transforms, sending the decal off-
  // screen and producing a blank iPhone.
  useEffect(() => {
    if (!targetMesh || !screenTexture || !layout) return;

    // Force the entire scene graph's matrices up to date BEFORE we read
    // matrixWorld — R3F applies prop changes during commit but defers
    // matrix updates to the next frame.
    topScene.updateMatrixWorld(true);

    if (!targetMesh.geometry.boundingBox) {
      targetMesh.geometry.computeBoundingBox();
    }
    const localBbox = targetMesh.geometry.boundingBox!;
    const localCentre = new THREE.Vector3();
    const localSize = new THREE.Vector3();
    localBbox.getCenter(localCentre);
    localBbox.getSize(localSize);

    // The iPhone model's screen face is at mesh local -Z. The projector
    // sits flush with that face.
    const localFront = new THREE.Vector3(
      localCentre.x,
      localCentre.y,
      localCentre.z - localSize.z / 2,
    );
    const worldFront = localFront.clone().applyMatrix4(targetMesh.matrixWorld);

    // Projector orientation = the mesh's world rotation, so the
    // projector's local axes line up with the iPhone's local axes in
    // world space. This makes the clipping volume aligned to the screen.
    const meshRotation = new THREE.Quaternion();
    const meshTranslation = new THREE.Vector3();
    const meshScale = new THREE.Vector3();
    targetMesh.matrixWorld.decompose(meshTranslation, meshRotation, meshScale);
    const orientation = new THREE.Euler().setFromQuaternion(meshRotation);

    // Projector volume in WORLD scale. Width/height cover 93%×98% of the
    // iPhone bbox; Z extent is only 30% of the device depth so we catch
    // the front face triangles without scraping the back face.
    const decalSize = new THREE.Vector3(
      localSize.x * meshScale.x * 0.93,
      localSize.y * meshScale.y * 0.98,
      localSize.z * meshScale.z * 0.3,
    );

    const decalGeo = new DecalGeometry(targetMesh, worldFront, orientation, decalSize);

    // MeshBasicMaterial keeps the screen content at uniform brightness
    // regardless of viewing angle — exactly what a real OLED does. The
    // iPhone body around it darkens/lightens with the scene lighting
    // (it's PBR), and that contrast is what reads as "real screen behind
    // glass" rather than "matte sticker". PolygonOffset wins the depth
    // test against the baked screen pixels underneath.
    const decalMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });

    const decal = new THREE.Mesh(decalGeo, decalMat);
    decal.name = '__ig_decal';

    // World-space vertices → top-level scene (identity matrixWorld).
    topScene.add(decal);

    return () => {
      topScene.remove(decal);
      decalGeo.dispose();
      decalMat.dispose();
    };
  }, [targetMesh, screenTexture, layout, topScene]);

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
