import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Locale } from '@/i18n';

export interface About {
  bodyMdx: string;
  data: { name: string; portrait: string };
}

export async function getAbout(locale: Locale): Promise<About> {
  const raw = await fs.readFile(path.join('content', `about.${locale}.mdx`), 'utf-8');
  const { data, content } = matter(raw);
  return {
    bodyMdx: content,
    data: { name: String(data.name ?? ''), portrait: String(data.portrait ?? '') },
  };
}
