import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LangSwitcher } from './LangSwitcher';
import { TextScramble } from '@/components/home/TextScramble';

const HOVER_SCRAMBLE_MS = 450;

// At rest each link is dimmed to 50% under mix-blend-difference — same
// resting tone as the inactive locale in LangSwitcher (EN when FR is
// selected). On hover/focus we go to full opacity + mix-blend-normal +
// the scroll-cue drop-shadow recipe, so the active label pops as a
// true-cream tone instead of inverting against the photo behind it.
const NAV_LINK =
  'mix-blend-difference opacity-50 hover:mix-blend-normal hover:opacity-100 hover:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] focus-visible:mix-blend-normal focus-visible:opacity-100 focus-visible:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transition-[filter,opacity] duration-200';

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
