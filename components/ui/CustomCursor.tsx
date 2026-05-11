'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

/**
 * Floating cream dot that follows the mouse with a soft spring. Scales up on
 * `a`, `button`, and any element marked `data-cursor="hover"`. Hidden entirely
 * on touch devices.
 */
export function CustomCursor() {
  const [isTouch] = useState(
    () =>
      typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
  );
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.3 });

  useEffect(() => {
    if (isTouch) return;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX - 8);
      y.set(e.clientY - 8);
      if (!visible) setVisible(true);
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const interactive = t?.closest('a, button, [data-cursor="hover"]');
      setHovering(Boolean(interactive));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [isTouch, visible, x, y]);

  if (isTouch) return null;

  return (
    <motion.div
      aria-hidden
      className="bg-cream pointer-events-none fixed top-0 left-0 z-[100] h-4 w-4 rounded-full mix-blend-difference"
      style={{ x: sx, y: sy }}
      animate={{
        scale: hovering ? 3.5 : 1,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 280, damping: 22 },
        opacity: { duration: 0.2 },
      }}
    />
  );
}
