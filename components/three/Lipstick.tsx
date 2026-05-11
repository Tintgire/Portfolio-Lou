'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import {
  TextureLoader,
  RepeatWrapping,
  Group,
  Texture,
  Vector2,
  Color,
  MeshStandardMaterial,
} from 'three';
import { useDragRotate } from './useDragRotate';
import { useScrollProgress } from './useScrollProgress';

function configureNormalMap(texture: Texture) {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 2);
}

export function Lipstick() {
  const group = useRef<Group>(null!);
  const normalMap = useLoader(TextureLoader, '/textures/concrete-normal.jpg', (loader) => {
    const originalLoad = loader.load.bind(loader);
    loader.load = (url, onLoad, onProgress, onError) =>
      originalLoad(
        url,
        (t) => {
          configureNormalMap(t);
          onLoad?.(t);
        },
        onProgress,
        onError,
      );
  });

  const { bind, target, lerpToward } = useDragRotate();
  const pointer = useRef({ x: 0, y: 0 });
  const progress = useScrollProgress();
  const targetColor = useRef(new Color('#ff3b00'));
  const altColor = useRef(new Color('#d6f700'));
  const stickMaterial = useMemo(
    () => new MeshStandardMaterial({ color: '#ff3b00', metalness: 0.1, roughness: 0.3 }),
    [],
  );

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) return;
    const handler = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.current.y = nx * 0.25;
      pointer.current.x = ny * 0.15;
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const blendedX = target.current.x + pointer.current.x * 0.3;
    const blendedY = target.current.y + pointer.current.y * 0.3;
    const rot = lerpToward(0.08, blendedX, blendedY);
    const idle = Math.sin(t * 0.6) * 0.05;
    group.current.rotation.x = rot.x;
    group.current.rotation.y = rot.y + idle;

    const p = progress.current;
    group.current.scale.y = 1.2 - p * 0.1;
    group.current.position.y = -p * 0.5;
    group.current.rotation.z = p * 0.2;

    const c = targetColor.current.clone().lerp(altColor.current, p);
    stickMaterial.color.copy(c);
  });

  return (
    <group ref={group} {...bind()} position={[0, 0, 0]} scale={1.2}>
      <mesh castShadow receiveShadow position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.2, 64]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.85}
          metalness={0.05}
          normalMap={normalMap}
          normalScale={new Vector2(0.6, 0.6)}
        />
      </mesh>
      <mesh castShadow position={[0, 0.05, 0]}>
        <torusGeometry args={[0.5, 0.05, 16, 64]} />
        <meshStandardMaterial color="#cccccc" metalness={1} roughness={0.15} />
      </mesh>
      <mesh castShadow position={[0, 0.7, 0]} material={stickMaterial}>
        <cylinderGeometry args={[0.42, 0.45, 1.0, 64]} />
      </mesh>
      <mesh castShadow position={[0, 1.4, 0]} material={stickMaterial}>
        <coneGeometry args={[0.42, 0.5, 64]} />
      </mesh>
    </group>
  );
}
