import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LangSwitcher } from './LangSwitcher';

export function Nav({ locale }: { locale: string }) {
  const t = useTranslations('Nav');
  return (
    <nav className="text-cream fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 mix-blend-difference">
      <Link href={`/${locale}`} className="text-meta">
        LOU.STUDIO
      </Link>
      <ul className="text-meta flex list-none gap-6">
        <li>
          <Link href={`/${locale}/about`}>{t('about')}</Link>
        </li>
        <li>
          <Link href={`/${locale}/contact`}>{t('contact')}</Link>
        </li>
      </ul>
      <LangSwitcher locale={locale} />
    </nav>
  );
}
