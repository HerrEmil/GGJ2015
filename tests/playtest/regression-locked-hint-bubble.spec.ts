import { test, expect } from "@playwright/test";
import { bootGame } from "./helpers";

// Regression: clicking the dead tree BEFORE the tent hits story `getting a club`'s
// `locked: "It´s a tree."` branch. That hint is plain text, not an SVG id, so the
// old bubble code built `url(bubbles/bubble-It´s a tree..svg)` (invalid unquoted
// url with spaces — dropped by the CSS parser) and `z-index: 100 - "It´s a tree."`
// = NaN, producing an invisible, art-less bubble that never showed the hint.
// After the fix, a non-numeric bubble id renders as a legible text bubble with a
// valid z-index. Pre-fix this test FAILS (empty z-index, no hint text); post-fix it PASSES.
test("locked text hint renders as a legible bubble, not a broken one", async ({ page }) => {
  const failedRequests: string[] = [];
  page.on("requestfailed", (r) => failedRequests.push(r.url()));
  page.on("response", (r) => {
    if (r.status() >= 400) failedRequests.push(`${r.status()} ${r.url()}`);
  });

  await bootGame(page);

  // Click the dead tree before the tent -> locked "It´s a tree." hint.
  const bubble = await page.evaluate(() => {
    (window as any).clickHandler("dead_x5F_tree_3_");
    const bubbles = Array.from(document.querySelectorAll<HTMLDivElement>(".bubble"));
    const last = bubbles[bubbles.length - 1];
    return {
      zIndex: last?.style.zIndex ?? "",
      text: last?.querySelector<HTMLElement>(".bubble__text")?.textContent ?? "",
      backgroundImage: last?.style.backgroundImage ?? "",
    };
  });

  // z-index must be a real finite number (NaN/empty means the old broken bubble).
  expect(Number.isFinite(Number(bubble.zIndex))).toBe(true);
  expect(bubble.zIndex).not.toBe("");
  // The hint text is actually shown to the player.
  expect(bubble.text).toBe("It´s a tree.");
  // No malformed asset request was made for the text hint.
  expect(failedRequests.filter((u) => u.includes("bubble-It"))).toEqual([]);
});

// Guard: the normal numeric-id bubble path (SVG art) is unchanged by the fix.
test("numeric bubble ids still render their SVG art with a valid z-index", async ({ page }) => {
  await bootGame(page);

  // Clicking the tent matches two story entries (`clicking tent` -> success "05"
  // and `sleeping in tent` -> locked "06"), so several numeric-id bubbles appear.
  const bubbles = await page.evaluate(() => {
    (window as any).clickHandler("tent");
    return Array.from(document.querySelectorAll<HTMLDivElement>(".bubble"))
      .filter((b) => !b.classList.contains("bubble--text") && b.style.display !== "none")
      .map((b) => ({ zIndex: b.style.zIndex, backgroundImage: b.style.backgroundImage }));
  });

  expect(bubbles.length).toBeGreaterThan(0);
  for (const b of bubbles) {
    expect(Number.isFinite(Number(b.zIndex))).toBe(true);
    expect(b.zIndex).not.toBe("");
    expect(b.backgroundImage).toMatch(/bubbles\/bubble-\d+\.svg/);
  }
  // The expected success bubble ("05") is among them.
  expect(bubbles.some((b) => b.backgroundImage.includes("bubbles/bubble-05.svg"))).toBe(true);
});
