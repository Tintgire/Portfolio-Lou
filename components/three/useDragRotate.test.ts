import { describe, it, expect } from 'vitest';
import { applyDragDelta } from './useDragRotate';

describe('applyDragDelta', () => {
  it('converts pixel delta to radians and accumulates', () => {
    const next = applyDragDelta({ x: 0, y: 0 }, [100, 50]);
    expect(next.y).toBeCloseTo(100 * 0.005);
    expect(next.x).toBeCloseTo(50 * 0.005);
  });

  it('clamps X rotation to ±π/2', () => {
    const next = applyDragDelta({ x: 0, y: 0 }, [0, 1000]);
    expect(next.x).toBeCloseTo(Math.PI / 2);
  });
});
