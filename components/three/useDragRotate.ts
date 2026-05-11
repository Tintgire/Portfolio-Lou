'use client';

import { useRef } from 'react';
import { useDrag } from '@use-gesture/react';

export interface Rotation {
  x: number;
  y: number;
}

const PIXEL_TO_RAD = 0.005;
const X_CLAMP = Math.PI / 2;

export function applyDragDelta(current: Rotation, [dx, dy]: [number, number]): Rotation {
  return {
    y: current.y + dx * PIXEL_TO_RAD,
    x: Math.max(-X_CLAMP, Math.min(X_CLAMP, current.x + dy * PIXEL_TO_RAD)),
  };
}

export function useDragRotate() {
  const target = useRef<Rotation>({ x: 0, y: 0 });
  const smoothed = useRef<Rotation>({ x: 0, y: 0 });

  const bind = useDrag(({ delta }) => {
    target.current = applyDragDelta(target.current, delta as [number, number]);
  });

  function lerpToward(factor: number, targetX?: number, targetY?: number): Rotation {
    const toX = targetX ?? target.current.x;
    const toY = targetY ?? target.current.y;
    smoothed.current.x += (toX - smoothed.current.x) * factor;
    smoothed.current.y += (toY - smoothed.current.y) * factor;
    return smoothed.current;
  }

  return { bind, target, smoothed, lerpToward };
}
