import type { Page } from "@playwright/test";

/**
 * Load the game and dismiss the intro bubble, leaving a clean interactive scene.
 * The page's scripts are plain synchronous <script> tags and the bootstrap runs
 * in a trailing inline script, so goto's default `load` wait already guarantees
 * the game is ready — no extra readiness poll needed.
 */
export async function bootGame(page: Page) {
  await page.goto("/");
  await page.evaluate(() => (window as any).dismissIntro());
}

/** Remove every bubble, so a following assertion counts only what it triggers. */
export function clearBubbles(page: Page) {
  return page.evaluate(() =>
    document.querySelectorAll(".bubble").forEach((b) => b.remove()),
  );
}

/** A real leftward horizontal drag across the scene body. */
export async function dragScene(page: Page) {
  await page.mouse.move(640, 400);
  await page.mouse.down();
  await page.mouse.move(340, 400, { steps: 12 });
  await page.mouse.up();
}
