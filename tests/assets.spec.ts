import { test, expect } from '@playwright/test';
import { mockImages } from './mockImages';

test('visual tests retain the real local navigation logo', async ({ page }) => {
  await mockImages(page);
  await page.goto('/now');
  const logo = page.locator('#logo img');
  await expect(logo).toBeVisible();
  await expect.poll(() => logo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
});
