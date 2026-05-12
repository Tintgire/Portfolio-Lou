'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales } from '@/i18n';

export function LangSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const stripped = pathname.replace(/^\/(fr|en)/, '');
  return (
    <div className="text-meta flex gap-2">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden>/</span>}
          <Link
            href={`/${l}${stripped}`}
            className={`transition-[text-shadow,opacity,color] duration-300 hover:text-white hover:opacity-100 hover:[text-shadow:0_0_20px_rgba(255,255,255,0.7)] focus-visible:text-white focus-visible:opacity-100 focus-visible:[text-shadow:0_0_20px_rgba(255,255,255,0.7)] ${
              l === locale ? 'opacity-100' : 'opacity-50'
            }`}
            aria-current={l === locale ? 'page' : undefined}
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
