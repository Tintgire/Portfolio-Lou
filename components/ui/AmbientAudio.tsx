'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  /** 0..1, default 0.35 — background music should sit comfortably under the UI. */
  volume?: number;
}

/**
 * Background music that starts on the first user gesture and can be
 * toggled via a bottom-left chip.
 *
 * Why play/pause instead of muted/unmuted? Setting `audio.muted = false`
 * doesn't auto-resume a paused element — and the optimistic muted
 * autoplay we attempt at mount may be silently rejected by the browser,
 * leaving the element paused. In that case unmuting later would just
 * flip a flag without producing any sound. Driving everything off
 * play()/pause() (and the audio element's `play`/`pause` events as the
 * canonical state source) means whenever the chip says SOUND, the audio
 * is actually playing.
 *
 * Two safeguards keep the chip predictable:
 *   1. The window-level "first gesture" listener checks event.target
 *      and bails on anything inside the chip — the chip's onClick is
 *      then the only handler that fires, no unmute-then-mute race.
 *   2. `userActedRef` latches once the user has expressed any intent,
 *      so a scroll after a manual pause never overrides the user.
 */
export function AmbientAudio({ src, volume = 0.35 }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const userActedRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.loop = true;

    // Canonical state source: the audio element itself.
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    // Optimistic play — succeeds when the origin already has media-
    // engagement credit (subsequent visits). Silently rejected on a
    // cold visit; the gesture listener below picks up the slack.
    audio.play().catch(() => {});

    const start = (e: Event) => {
      if (userActedRef.current) return;
      const btn = buttonRef.current;
      // Bail on gestures that land on the chip — its onClick handles
      // them directly. Firing here too would race the click handler.
      if (btn && e.target instanceof Node && btn.contains(e.target)) return;
      userActedRef.current = true;
      audio.play().catch(() => {});
    };

    window.addEventListener('pointerdown', start);
    window.addEventListener('keydown', start);
    window.addEventListener('touchstart', start);
    window.addEventListener('wheel', start);
    window.addEventListener('scroll', start);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      window.removeEventListener('touchstart', start);
      window.removeEventListener('wheel', start);
      window.removeEventListener('scroll', start);
    };
  }, [volume]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    userActedRef.current = true;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  };

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" loop playsInline />
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Couper le son' : 'Activer le son'}
        aria-pressed={playing}
        className={`fixed bottom-6 left-6 z-40 flex items-center gap-2.5 rounded-full border px-3 py-2 backdrop-blur-sm transition-colors ${
          playing
            ? 'border-cream/30 bg-jet/40 text-cream/90 hover:border-cream/60'
            : 'border-cream/10 bg-jet/30 text-cream/40 hover:text-cream/70'
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
