import { test, expect } from "@playwright/test";

// Regression: switching scenes (day -> night) must re-bind the drag / arrow-key
// pan controller to the newly-visible scene. makeSceneMovable keeps a single
// module-level _sceneState; switchLayer re-calls it on every layer change, but
// switchScene never did. So once the story turned day -> night, the controller
// kept moving the now-HIDDEN day layers while the visible night layers stayed
// frozen -- the night scene (half the game, whose core interaction is
// drag-to-explore parallax) was un-pannable until an up/down press happened to
// rebind it. Pre-fix this FAILS (night layers don't move, hidden day ones do);
// post-fix it PASSES.

const readLefts = (page: import("@playwright/test").Page) =>
  page.evaluate(() => {
    const left = (id: string) =>
      parseFloat(document.getElementById(id)!.style.left || "0");
    return {
      night: [left("night-4"), left("night-5"), left("night-6")],
      day: [left("day-4"), left("day-5"), left("day-6")],
    };
  });

test("night scene is pannable immediately after switchScene (controller rebinds)", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => (window as any).dismissIntro?.());

  // Enter the night scene the way the story does.
  await page.evaluate(() => (window as any).switchScene("night"));

  // Sanity: we actually switched scenes.
  await expect(page.locator("#night")).not.toHaveClass(/hidden/);
  await expect(page.locator("#day")).toHaveClass(/hidden/);

  // Clear the arrival bubble(s) so the drag lands cleanly on the scene body.
  await page.evaluate(() =>
    document.querySelectorAll(".bubble").forEach((b) => b.remove())
  );

  const before = await readLefts(page);

  // A real horizontal drag across the scene body. Starting pan ratio is the
  // resize-independent default (-1, mid-range), so this move is never clamped.
  await page.mouse.move(640, 400);
  await page.mouse.down();
  await page.mouse.move(340, 400, { steps: 12 });
  await page.mouse.up();

  const after = await readLefts(page);

  // The visible NIGHT layers must have moved -- the whole point of the scene.
  const nightMoved = before.night.some((v, i) => v !== after.night[i]);
  expect(nightMoved).toBe(true);

  // The hidden DAY layers must NOT move -- pre-fix the controller wrongly drove
  // them instead of the night scene.
  expect(after.day).toEqual(before.day);
});

// Guard: switching back night -> day re-binds to the day scene too, so the
// controller always follows the visible scene (not just the first switch).
test("switching back to day re-binds the controller to the day scene", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => (window as any).dismissIntro?.());

  await page.evaluate(() => (window as any).switchScene("night"));
  await page.evaluate(() => (window as any).switchScene("day"));
  await page.evaluate(() =>
    document.querySelectorAll(".bubble").forEach((b) => b.remove())
  );

  const before = await readLefts(page);
  await page.mouse.move(640, 400);
  await page.mouse.down();
  await page.mouse.move(340, 400, { steps: 12 });
  await page.mouse.up();
  const after = await readLefts(page);

  const dayMoved = before.day.some((v, i) => v !== after.day[i]);
  expect(dayMoved).toBe(true);
  expect(after.night).toEqual(before.night);
});
