import type { Page, Route } from "@playwright/test";

export async function mockImages(page: Page) {
  await page.route("**/*.{png,jpg,jpeg,webp,svg,gif,ico,avif}", async (route: Route) => {
    // Astro serves local optimized images at /_astro/ in production. Keep them
    // real, just like the /_image responses used by the development server.
    if (new URL(route.request().url()).pathname.startsWith("/_astro/")) {
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