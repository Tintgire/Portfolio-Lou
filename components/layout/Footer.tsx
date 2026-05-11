import { useTranslations } from 'next-intl';

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();
  return (
    <footer className="border-cream/20 text-meta grid grid-cols-1 gap-6 border-t px-6 py-10 md:grid-cols-3">
      <div>© {year} LOU STUDIO</div>
      <div className="text-center">
        <a href="https://instagram.com/loustudio" target="_blank" rel="noopener noreferrer">
          {t('instagram')}
        </a>
      </div>
      <div className="text-right opacity-60">
        {t('rights')} · {locale.toUpperCase()}
      </div>
    </footer>
  );
}
