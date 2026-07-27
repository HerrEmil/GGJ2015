import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { bootGame, clearBubbles, dragScene } from "./helpers";

// Regression: switching scenes (day -> night) must re-bind the drag / arrow-key
// pan controller to the newly-visible scene. makeSceneMovable keeps a single
// module-level _sceneState; switchLayer re-calls it on every layer change, but
// switchScene never did. So once the story turned day -> night, the controller
// kept moving the now-HIDDEN day layers while the visible night layers stayed
// frozen -- the night scene (half the game, whose core interaction is
// drag-to-explore parallax) was un-pannable until an up/down press happened to
// rebind it. Pre-fix this FAILS (night layers don't move, hidden day ones do);
// post-fix it PASSES.

const readLefts = (page: Page) =>
  page.evaluate(() => {
    const left = (id: string) =>
      parseFloat(document.getElementById(id)!.style.left || "0");
    return {
      night: [left("night-4"), left("night-5"), left("night-6")],
      day: [left("day-4"), left("day-5"), left("day-6")],
    };
  });

// The controller must follow the visible scene on every switch, not just the first.
const CASES = [
  { name: "night scene is pannable immediately after switchScene", switches: ["night"], moves: "night", frozen: "day" },
  { name: "switching back to day re-binds the controller to the day scene", switches: ["night", "day"], moves: "day", frozen: "night" },
] as const;

for (const { name, switches, moves, frozen } of CASES) {
  test(`${name} (controller rebinds)`, async ({ page }) => {
    await bootGame(page);

    // Enter the scene(s) the way the story does.
    for (const scene of switches) {
      await page.evaluate((s) => (window as any).switchScene(s), scene);
    }

    // Sanity: we actually landed on the scene under test.
    await expect(page.locator(`#${moves}`)).not.toHaveClass(/hidden/);
    await expect(page.locator(`#${frozen}`)).toHaveClass(/hidden/);

    // Clear the arrival bubble(s) so the drag lands cleanly on the scene body.
    await clearBubbles(page);

    // Starting pan ratio is the resize-independent default (-1, mid-range), so
    // this move is never clamped.
    const before = await readLefts(page);
    await dragScene(page);
    const after = await readLefts(page);

    // The visible layers must have moved -- the whole point of the scene.
    expect(before[moves].some((v, i) => v !== after[moves][i])).toBe(true);
    // The hidden layers must NOT move -- pre-fix the controller wrongly drove them.
    expect(after[frozen]).toEqual(before[frozen]);
  });
}
