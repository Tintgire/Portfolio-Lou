import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Locale } from '@/i18n';

export type { Locale };

export interface Media {
  type: 'image' | 'video';
  src: string;
  poster?: string;
  layout: 'full' | 'grid-left' | 'grid-right';
}

export interface Work {
  slug: string;
  title: string;
  date: string;
  order?: number;
  location: string;
  role: string;
  team: { photographer?: string; model?: string; [key: string]: string | undefined };
  cover: string;
  media: Media[];
  nextSlug?: string;
  bodyMdx: string;
}

const DEFAULT_DIR = 'content/works';

// gray-matter parses bare YAML dates (e.g. 2025-09-12) as JS Date objects.
// We normalise to YYYY-MM-DD strings so Work.date is always a string.
function normaliseDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().split('T')[0]!;
  return String(value ?? '');
}

async function readWorkFile(filePath: string): Promise<Work | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const { data, content } = matter(raw);
    return {
      slug: data.slug,
      title: data.title,
      date: normaliseDate(data.date),
      order: data.order,
      location: data.location,
      role: data.role,
      team: data.team ?? {},
      cover: data.cover,
      media: data.media ?? [],
      nextSlug: data.nextSlug,
      bodyMdx: content,
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function getAllWorks(locale: Locale, dir = DEFAULT_DIR): Promise<Work[]> {
  const entries = await fs.readdir(dir);
  const slugs = new Set<string>();
  for (const entry of entries) {
    const match = entry.match(/^(.+)\.(fr|en)\.mdx$/);
    if (match && match[2] === locale) slugs.add(match[1]!);
  }
  const works = await Promise.all(
    [...slugs].map((slug) => readWorkFile(path.join(dir, `${slug}.${locale}.mdx`))),
  );
  return works
    .filter((w): w is Work => w !== null)
    .sort((a, b) => {
      if (a.order != null && b.order != null) return a.order - b.order;
      if (a.order != null) return -1;
      if (b.order != null) return 1;
      return b.date.localeCompare(a.date);
    });
}

export async function getWorkBySlug(
  slug: string,
  locale: Locale,
  dir = DEFAULT_DIR,
): Promise<Work | null> {
  return readWorkFile(path.join(dir, `${slug}.${locale}.mdx`));
}
