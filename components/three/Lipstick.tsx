'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping, Group, Texture, Vector2 } from 'three';
import { useDragRotate } from './useDragRotate';

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
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.42, 0.45, 1.0, 64]} />
        <meshStandardMaterial color="#ff3b00" metalness={0.1} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0, 1.4, 0]}>
        <coneGeometry args={[0.42, 0.5, 64]} />
        <meshStandardMaterial color="#ff3b00" metalness={0.1} roughness={0.3} />
      </mesh>
    </group>
  );
}
