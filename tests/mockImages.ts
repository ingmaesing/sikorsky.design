import type { Page, Route } from "@playwright/test";

export async function mockImages(page: Page) {
  await page.route("**/*.{png,jpg,jpeg,webp,svg,gif,ico,avif}", async (route: Route) => {
    // Keep local assets, including the navigation logo and optimized images.
    // Only external image services are mocked.
    if (new URL(route.request().url()).origin === new URL(page.url()).origin) {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      body: "",
      headers: {
        "Content-Type": "image/png",
      },
    });
  });
}