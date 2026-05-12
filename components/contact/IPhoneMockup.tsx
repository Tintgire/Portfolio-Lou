'use client';

import Image from 'next/image';
import { motion } from 'motion/react';

interface Props {
  /** Photo displayed inside the iPhone's screen. Served from /public. */
  photoUrl: string;
  /** Photo intrinsic width — used by next/image for the right ratio. */
  photoWidth: number;
  /** Photo intrinsic height. */
  photoHeight: number;
  /** Instagram handle shown over the photo. */
  handle?: string;
}

/**
 * High-fidelity CSS iPhone mockup. The "3D" comes from a single
 * `rotateY` perspective transform on the outermost element — every
 * inner layer (frame, screen, glass) inherits the same tilt so the
 * whole device reads as one rigid object. Soft drop-shadow underneath
 * + a thin specular highlight on the leading edge give the depth that
 * the from-scratch three.js model couldn't deliver.
 *
 * No three.js, no Suspense, no async hydration — instant paint and a
 * fraction of the bundle.
 */
export function IPhoneMockup({ photoUrl, photoWidth, photoHeight, handle = '@lou.boidin' }: Props) {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ perspective: 1600 }}>
      <motion.div
        initial={{ rotateY: -32, rotateX: 4, y: 16, opacity: 0 }}
        animate={{ rotateY: -22, rotateX: 4, y: [0, -8, 0], opacity: 1 }}
        transition={{
          rotateY: { duration: 1.4, ease: [0.76, 0, 0.24, 1] },
          rotateX: { duration: 1.4, ease: [0.76, 0, 0.24, 1] },
          opacity: { duration: 0.9 },
          y: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative aspect-[9/19.5] h-[min(82vh,720px)] max-h-[82vh]"
      >
        {/* Soft drop-shadow that sits under the phone, scaled and blurred */}
        <div
          aria-hidden
          className="absolute -bottom-6 left-1/2 -z-10 h-12 w-[70%] -translate-x-1/2 rounded-full bg-black/60 blur-2xl"
        />

        {/* Outer titanium frame — metallic gradient + thin specular edge */}
        <div
          className="relative h-full w-full overflow-hidden rounded-[14%/6.5%] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)_inset]"
          style={{
            background:
              'linear-gradient(135deg, #5d5d63 0%, #2a2a2e 18%, #18181b 50%, #0f0f12 82%, #3a3a3f 100%)',
          }}
        >
          {/* Screen bezel — slim dark border around the actual content */}
          <div className="absolute inset-[2.2%] overflow-hidden rounded-[12%/6%] bg-black">
            {/* The photo itself, covering the screen */}
            <Image
              src={photoUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 35vw, 80vw"
              priority
              className="object-cover"
            />

            {/* Status bar (faint) — 9:41, signal, battery */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-2 text-[10px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <span>9:41</span>
              <span className="flex items-center gap-1.5">
                <span className="opacity-90">●●●●</span>
                <span className="opacity-90">5G</span>
                <span
                  aria-hidden
                  className="ml-1 inline-block h-2 w-4 rounded-[2px] border border-white/80 px-[1px] py-[1px]"
                >
                  <span className="block h-full w-full rounded-[1px] bg-white/90" />
                </span>
              </span>
            </div>

            {/* Dynamic Island — black pill near the top, slightly below status bar */}
            <div
              aria-hidden
              className="absolute top-[2%] left-1/2 z-20 h-[3.2%] w-[33%] -translate-x-1/2 rounded-full bg-black"
            />

            {/* Instagram-style nav bar pinned at top */}
            <div className="absolute inset-x-0 top-[7%] z-10 flex items-center justify-between bg-gradient-to-b from-black/55 to-transparent px-4 pt-4 pb-6">
              <span className="text-sm font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                {handle}
              </span>
              <span aria-hidden className="text-base leading-none text-white/90">
                ⋯
              </span>
            </div>

            {/* Bottom IG action row — heart / comment / share / save */}
            <div className="absolute inset-x-0 bottom-[3.5%] z-10 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent px-4 pt-8 pb-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-4 text-lg leading-none">
                <span aria-hidden>♡</span>
                <span aria-hidden>○</span>
                <span aria-hidden>↗</span>
              </div>
              <span aria-hidden className="text-lg leading-none">
                ◫
              </span>
            </div>

            {/* Subtle glass reflection — diagonal cream highlight */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-br from-white/10 via-transparent to-transparent mix-blend-overlay"
            />
          </div>

          {/* Right-edge specular highlight — sells the metallic frame */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[6%] right-0 bottom-[6%] w-[0.8%] bg-gradient-to-b from-transparent via-white/40 to-transparent"
          />

          {/* Left-edge subtle highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[12%] bottom-[12%] left-0 w-[0.4%] bg-gradient-to-b from-transparent via-white/20 to-transparent"
          />
        </div>

        {/* Hidden alt for screen readers — the iPhone is decorative, the
            real link lives in the left column of the contact page. */}
        <span className="sr-only">
          {handle} — preview of Lou&apos;s Instagram on an iPhone screen
        </span>

        {/* Photo dims passed for next/image — strictly typed away */}
        <span className="hidden" data-w={photoWidth} data-h={photoHeight} aria-hidden />
      </motion.div>
    </div>
  );
}
