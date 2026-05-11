import { test, expect } from '@playwright/test';

test('root redirects to a locale and the lipstick canvas mounts', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBeLessThan(400);
  // next-intl middleware picks the locale from Accept-Language; either /fr or /en is valid.
  await expect(page).toHaveURL(/\/(fr|en)$/);
  // Allow time for the client-side dynamic import of the 3D lipstick
  await page.waitForTimeout(1500);
  const canvasCount = await page.locator('canvas').count();
  expect(canvasCount).toBeGreaterThanOrEqual(1);
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
  await page.goto('/fr/works/bold-lipstick');
  await expect(page.locator('h1')).toContainText('Bold Lipstick');
});
