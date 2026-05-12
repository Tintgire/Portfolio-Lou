import { test, expect } from '@playwright/test';

test('root redirects to a locale and the brutalist LOU is rendered', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBeLessThan(400);
  // next-intl middleware picks the locale from Accept-Language; either /fr or /en is valid.
  await expect(page).toHaveURL(/\/(fr|en)$/);
  // The hero H1 is labelled "LOU" (the visible text is split into characters)
  await expect(page.locator('h1[aria-label="LOU"]')).toBeVisible();
});

test('home FR renders French nav (direct navigation)', async ({ page }) => {
  await page.goto('/fr');
  await expect(page.locator('nav')).toContainText('À propos');
});

test('home EN renders English nav', async ({ page }) => {
  await page.goto('/en');
  await expect(page.locator('nav')).toContainText('About');
});

test('project page accessible', async ({ page }) => {
  await page.goto('/fr/works/carmin');
  await expect(page.locator('h1')).toContainText('Carmin');
});
