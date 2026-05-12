import { useTranslations } from 'next-intl';

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();
  return (
    <footer className="border-cream/20 text-meta grid grid-cols-1 gap-6 border-t px-6 py-10 md:grid-cols-3">
      <div>© {year} LOU STUDIO</div>
      <div className="text-center">
        <a
          href="https://www.instagram.com/lou.boidin/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-[text-shadow,color] duration-300 hover:text-white hover:[text-shadow:0_0_20px_rgba(255,255,255,0.7)]"
        >
          {t('instagram')}
        </a>
      </div>
      <div className="text-right opacity-60">
        {t('rights')} · {locale.toUpperCase()}
      </div>
    </footer>
  );
}
