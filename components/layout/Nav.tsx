import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LangSwitcher } from './LangSwitcher';
import { TextScramble } from '@/components/home/TextScramble';

// Short scramble pass — long enough to register as a glitch, short
// enough that quick mouse passes feel snappy. Matches the editorial
// feel of the Hero tagline's mount-time scramble.
const HOVER_SCRAMBLE_MS = 450;

export function Nav({ locale }: { locale: string }) {
  const t = useTranslations('Nav');
  return (
    <nav className="text-cream fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 mix-blend-difference">
      <Link href={`/${locale}`} className="text-meta">
        <TextScramble text="LOU.STUDIO" trigger="hover" duration={HOVER_SCRAMBLE_MS} />
      </Link>
      <ul className="text-meta flex list-none gap-6">
        <li>
          <Link href={`/${locale}/about`}>
            <TextScramble text={t('about')} trigger="hover" duration={HOVER_SCRAMBLE_MS} />
          </Link>
        </li>
        <li>
          <Link href={`/${locale}/contact`}>
            <TextScramble text={t('contact')} trigger="hover" duration={HOVER_SCRAMBLE_MS} />
          </Link>
        </li>
      </ul>
      <LangSwitcher locale={locale} />
    </nav>
  );
}
