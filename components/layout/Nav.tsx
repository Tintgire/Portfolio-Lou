import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LangSwitcher } from './LangSwitcher';

// Soft white halo applied on hover/focus. mix-blend-difference is kept
// on the nav so the text stays legible on every background; the glow
// is a text-shadow on the same element, so it inherits the same blend
// and reads as a discreet light pulse on dark photos.
const HOVER_GLOW =
  'transition-[text-shadow,color] duration-300 hover:text-white focus-visible:text-white hover:[text-shadow:0_0_20px_rgba(255,255,255,0.7)] focus-visible:[text-shadow:0_0_20px_rgba(255,255,255,0.7)]';

export function Nav({ locale }: { locale: string }) {
  const t = useTranslations('Nav');
  return (
    <nav className="text-cream fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 mix-blend-difference">
      <Link href={`/${locale}`} className={`text-meta ${HOVER_GLOW}`}>
        LOU.STUDIO
      </Link>
      <ul className="text-meta flex list-none gap-6">
        <li>
          <Link href={`/${locale}/about`} className={HOVER_GLOW}>
            {t('about')}
          </Link>
        </li>
        <li>
          <Link href={`/${locale}/contact`} className={HOVER_GLOW}>
            {t('contact')}
          </Link>
        </li>
      </ul>
      <LangSwitcher locale={locale} />
    </nav>
  );
}
