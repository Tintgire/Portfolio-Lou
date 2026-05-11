import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('Home');
  return (
    <section className="relative h-screen w-full snap-start">
      {/* meta corners */}
      <span className="text-meta text-cream absolute top-6 left-6 z-10">{t('tagline')}</span>
      <span className="text-meta text-cream absolute right-6 bottom-6 z-10">2025 — {t('vol')}</span>

      {/* giant brutalist LOU — sits BEHIND meta but ABOVE lipstick canvas (which is z-0 fixed) */}
      <h1
        aria-label="LOU"
        className="text-brutal text-cream/[0.04] pointer-events-none absolute inset-0 z-0 grid place-items-center text-[28vw] select-none"
      >
        LOU
      </h1>

      {/* scroll cue */}
      <span className="text-meta text-cream absolute bottom-6 left-1/2 z-10 -translate-x-1/2 animate-pulse">
        ↓ {t('scroll')}
      </span>
    </section>
  );
}
