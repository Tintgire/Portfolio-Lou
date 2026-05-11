'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  /** 0..1, default 0.35 — background music should sit comfortably under the UI. */
  volume?: number;
}

/**
 * Background music that starts the moment the page loads — muted — and
 * un-mutes on the very first user gesture (or via the chip).
 *
 * Why muted autoplay? Every major browser blocks autoplay of audible
 * media until the page has received a user gesture, but muted playback
 * is always allowed. So the audio element loops silently from t=0; on
 * the first pointer/key/touch/wheel/scroll anywhere on the page, we set
 * `audio.muted = false` and the user hears the music without any
 * perceived latency between their gesture and the sound starting.
 *
 * The chip in the bottom-left also toggles `audio.muted` — never
 * play/pause — so it shares a single source of truth with the auto-
 * unmute path. To avoid a race when the chip itself is the first
 * gesture, the global listener checks the event target and bails on
 * anything inside the button (the chip's onClick handles it instead).
 * A `userActedRef` flag latches once the user has expressed any intent,
 * so a scroll after a manual mute never unwinds the user's choice.
 */
export function AmbientAudio({ src, volume = 0.35 }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const userActedRef = useRef(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.loop = true;
    audio.muted = true;
    // Muted autoplay is universally allowed → audio is "running" from t=0.
    audio.play().catch(() => {});

    // The audio element is the single source of truth — sync React state
    // off `volumechange` so manual toggle, auto-unmute, and any future
    // path all funnel through the same channel.
    const sync = () => setMuted(audio.muted);
    audio.addEventListener('volumechange', sync);

    const unmute = (e: Event) => {
      if (userActedRef.current) return;
      const btn = buttonRef.current;
      // Bail on gestures that land on the chip — its onClick will do the
      // right thing; firing here too would cause an unmute-then-mute race.
      if (btn && e.target instanceof Node && btn.contains(e.target)) return;
      userActedRef.current = true;
      audio.muted = false;
    };

    window.addEventListener('pointerdown', unmute);
    window.addEventListener('keydown', unmute);
    window.addEventListener('touchstart', unmute);
    window.addEventListener('wheel', unmute);
    window.addEventListener('scroll', unmute);

    return () => {
      audio.removeEventListener('volumechange', sync);
      window.removeEventListener('pointerdown', unmute);
      window.removeEventListener('keydown', unmute);
      window.removeEventListener('touchstart', unmute);
      window.removeEventListener('wheel', unmute);
      window.removeEventListener('scroll', unmute);
    };
  }, [volume]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    userActedRef.current = true;
    audio.muted = !audio.muted;
    // volumechange handler will sync React state
  };

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" loop playsInline />
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={muted ? 'Activer le son' : 'Couper le son'}
        aria-pressed={!muted}
        className={`fixed bottom-6 left-6 z-40 flex items-center gap-2.5 rounded-full border px-3 py-2 backdrop-blur-sm transition-colors ${
          muted
            ? 'border-cream/10 bg-jet/30 text-cream/40 hover:text-cream/70'
            : 'border-cream/30 bg-jet/40 text-cream/90 hover:border-cream/60'
        }`}
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
                transform: muted ? 'scaleY(0.25)' : undefined,
                animation: muted
                  ? undefined
                  : `ambient-bar ${0.8 + i * 0.15}s ease-in-out ${i * 0.1}s infinite`,
                transition: 'transform 0.3s ease',
              }}
            />
          ))}
        </span>
        <span className="text-meta">{muted ? 'MUTED' : 'SOUND'}</span>
      </button>
    </>
  );
}
