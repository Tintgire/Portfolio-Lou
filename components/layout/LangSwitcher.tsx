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
            className={l === locale ? 'opacity-100' : 'opacity-50 hover:opacity-100'}
            aria-current={l === locale ? 'page' : undefined}
          >
            {l.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
