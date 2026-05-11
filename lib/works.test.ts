import { describe, it, expect } from 'vitest';
import { getAllWorks, getWorkBySlug } from './works';

const FIXTURES = 'tests/fixtures/works';

describe('getAllWorks', () => {
  it('returns FR works sorted by order then date desc', async () => {
    const works = await getAllWorks('fr', FIXTURES);
    expect(works).toHaveLength(1);
    expect(works[0]?.slug).toBe('example');
    expect(works[0]?.title).toBe('Exemple Série');
  });

  it('returns EN works with English content', async () => {
    const works = await getAllWorks('en', FIXTURES);
    expect(works[0]?.title).toBe('Exemple Série');
  });
});

describe('getWorkBySlug', () => {
  it('returns the work for a valid slug + locale', async () => {
    const work = await getWorkBySlug('example', 'fr', FIXTURES);
    expect(work).not.toBeNull();
    expect(work?.team.photographer).toBe('Jane Doe');
    expect(work?.media).toHaveLength(1);
  });

  it('returns null for missing slug', async () => {
    const work = await getWorkBySlug('does-not-exist', 'fr', FIXTURES);
    expect(work).toBeNull();
  });
});

describe('Integration', () => {
  it('reads real content/works directory', async () => {
    const works = await getAllWorks('fr');
    expect(works.length).toBeGreaterThanOrEqual(2);
    expect(works.map((w) => w.slug)).toContain('bold-lipstick');
  });
});
