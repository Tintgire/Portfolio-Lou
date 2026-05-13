import type { MetadataRoute } from 'next';
import { getAllWorks } from '@/lib/works';
import { locales } from '@/i18n';

const BASE = 'https://portfolio-lou-six.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    entries.push({ url: `${BASE}/${locale}`, changeFrequency: 'monthly', priority: 1 });
    entries.push({
      url: `${BASE}/${locale}/about`,
      changeFrequency: 'yearly',
      priority: 0.6,
    });
    entries.push({
      url: `${BASE}/${locale}/contact`,
      changeFrequency: 'yearly',
      priority: 0.6,
    });
    const works = await getAllWorks(locale);
    for (const w of works) {
      entries.push({
        url: `${BASE}/${locale}/works/${w.slug}`,
        lastModified: w.date,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }
  return entries;
}
