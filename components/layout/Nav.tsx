import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LangSwitcher } from './LangSwitcher';
import { TextScramble } from '@/components/home/TextScramble';

const HOVER_SCRAMBLE_MS = 450;

// Each link sits on mix-blend-difference at rest (so the label adapts
// to whatever photo it's over). On hover/focus the blend is dropped
// and a drop-shadow is applied — same recipe as the "↓ Faire défiler"
// cue, so the active label reads as a clean true-cream tone.
const NAV_LINK =
  'mix-blend-difference hover:mix-blend-normal focus-visible:mix-blend-normal hover:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] focus-visible:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transition-[filter] duration-200';

export function Nav({ locale }: { locale: string }) {
  const t = useTranslations('Nav');
  return (
    <nav className="text-cream fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4">
      <Link href={`/${locale}`} className={`text-meta ${NAV_LINK}`}>
        <TextScramble text="LOU.STUDIO" trigger="hover" duration={HOVER_SCRAMBLE_MS} />
      </Link>
      <ul className="text-meta flex list-none gap-6">
        <li>
          <Link href={`/${locale}/about`} className={NAV_LINK}>
            <TextScramble text={t('about')} trigger="hover" duration={HOVER_SCRAMBLE_MS} />
          </Link>
        </li>
        <li>
          <Link href={`/${locale}/contact`} className={NAV_LINK}>
            <TextScramble text={t('contact')} trigger="hover" duration={HOVER_SCRAMBLE_MS} />
          </Link>
        </li>
      </ul>
      <LangSwitcher locale={locale} />
    </nav>
  );
}
