'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  /** 0..1, default 0.35 — background music should sit comfortably under the UI. */
  volume?: number;
}

/**
 * Background music with autoplay-policy fallback.
 *
 * Browsers (Chrome, Safari, Firefox) block audio.play() with sound until the
 * page has received a user gesture. We do an optimistic immediate play() on
 * mount — it succeeds when the origin already has media-engagement credit —
 * and if it rejects we arm one-time pointer/key/touch/wheel/scroll listeners
 * so the music starts on the very first interaction. Either way, a small
 * bottom-left chip with three animated bars gives the user explicit play/
 * pause control so this never feels invasive.
 */
export function AmbientAudio({ src, volume = 0.35 }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.loop = true;

    let cleaned = false;
    const start = () => {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    };
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      window.removeEventListener('pointerdown', armed);
      window.removeEventListener('keydown', armed);
      window.removeEventListener('touchstart', armed);
      window.removeEventListener('wheel', armed);
      window.removeEventListener('scroll', armed);
    };
    const armed = () => {
      start();
      cleanup();
    };

    audio.play().then(
      () => setPlaying(true),
      () => {
        window.addEventListener('pointerdown', armed, { once: true });
        window.addEventListener('keydown', armed, { once: true });
        window.addEventListener('touchstart', armed, { once: true });
        window.addEventListener('wheel', armed, { once: true });
        window.addEventListener('scroll', armed, { once: true });
      },
    );

    return cleanup;
  }, [volume]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" loop playsInline />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Couper le son' : 'Activer le son'}
        aria-pressed={playing}
        className="border-cream/15 bg-jet/40 text-cream/80 hover:border-cream/40 hover:text-cream fixed bottom-6 left-6 z-40 flex items-center gap-2.5 rounded-full border px-3 py-2 backdrop-blur-sm transition-colors"
      >
        <span className="flex h-3 items-end gap-[3px]">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="bg-current"
              style={{
                width: 3,
                height: '100%',
                transformOrigin: 'bottom',
                transform: playing ? undefined : 'scaleY(0.25)',
                animation: playing
                  ? `ambient-bar ${0.8 + i * 0.15}s ease-in-out ${i * 0.1}s infinite`
                  : undefined,
                transition: 'transform 0.3s ease',
              }}
            />
          ))}
        </span>
        <span className="text-meta">{playing ? 'SOUND' : 'MUTED'}</span>
      </button>
    </>
  );
}
