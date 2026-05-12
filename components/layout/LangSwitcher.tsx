'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales } from '@/i18n';
import { TextScramble } from '@/components/home/TextScramble';

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
            className={`mix-blend-difference transition-[filter,opacity] duration-300 hover:opacity-100 hover:mix-blend-normal hover:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] focus-visible:opacity-100 focus-visible:mix-blend-normal focus-visible:drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] ${
              l === locale ? 'opacity-100' : 'opacity-50'
            }`}
            aria-current={l === locale ? 'page' : undefined}
          >
            <TextScramble text={l.toUpperCase()} trigger="hover" duration={300} />
          </Link>
        </span>
      ))}
    </div>
  );
}
