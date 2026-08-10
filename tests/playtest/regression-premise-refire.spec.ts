import { test, expect } from "@playwright/test";
import { bootGame, clearBubbles } from "./helpers";

// Regression: a premise-gated story step must fire its success set exactly ONCE.
//
// Contract (`clickHandler`, src/scripts/clicks.js): a step's own `fulfilled` flag
// suppresses every repeat firing of its success bubbles and its `nextScene`
// arming; only the locked hint may repeat. Pre-fix the premise-gated path read
// only the *premise's* flag -- it wrote `obj.fulfilled = true` but never read it --
// so once the prerequisite was met, every further click on that target re-fired
// the whole success set: duplicate success bubbles, and (for a step with
// `nextScene`) a repeated `switchScene(...)` + ambience re-trigger.
//
// These tests are proven to FAIL pre-fix and PASS post-fix.

test("a fulfilled premise-gated step does not re-fire its success bubbles on repeat clicks", async ({ page }) => {
  await bootGame(page);

  const counts = await page.evaluate(() => {
    const w = window as any;
    // Fulfill the premise "clicking tent" so the dead tree ("getting a club",
    // premise: "clicking tent", success: ["10","11"], no nextScene/sound) unlocks.
    w.clickHandler("tent");
    // Clean slate so we count only what the gated step creates.
    document.querySelectorAll(".bubble").forEach((b) => b.remove());

    // First click: premise met, step not yet fulfilled -> success fires ONCE (2 art bubbles).
    w.clickHandler("dead_x5F_tree_3_");
    const afterFirst = document.querySelectorAll(".bubble").length;

    // Four more clicks after fulfilment. Pre-fix each re-fires ["10","11"] (+2/click
    // -> 10 total); post-fix the guard makes them no-ops.
    for (let i = 0; i < 4; i++) w.clickHandler("dead_x5F_tree_3_");
    const afterRepeat = document.querySelectorAll(".bubble").length;

    return { afterFirst, afterRepeat };
  });

  // Success set (ids "10","11") fires exactly once.
  expect(counts.afterFirst).toBe(2);
  // The core regression: repeat clicks create no further bubbles (pre-fix this was 10).
  expect(counts.afterRepeat).toBe(counts.afterFirst);
});

test("a fulfilled premise-gated step does not re-arm its nextScene transition", async ({ page }) => {
  await bootGame(page);

  const sceneCalls = await page.evaluate(() => {
    const w = window as any;
    // Spy on switchScene (a global function decl) so it counts invocations without
    // actually switching scenes. The initial load-time switchScene('day') already
    // ran before this replacement, so it is not counted.
    let calls = 0;
    w.switchScene = () => {
      calls += 1;
    };

    // Fulfil the chain up to "sleeping in tent" (id "tent", premise "getting a club",
    // success "08", nextScene "night"): clicking tent fulfils "clicking tent", then
    // the dead tree fulfils "getting a club".
    w.clickHandler("tent");
    w.clickHandler("dead_x5F_tree_3_");
    document.querySelectorAll(".bubble").forEach((b) => b.remove());

    // Click the tent three times. Each success bubble's dismissal fires its
    // onComplete -> the armed `() => switchScene("night")`. Pre-fix all three clicks
    // re-arm it (calls -> 3); post-fix only the first fires (calls -> 1).
    for (let i = 0; i < 3; i++) {
      w.clickHandler("tent");
      Array.from(document.querySelectorAll<HTMLDivElement>(".bubble"))
        .filter((b) => b.style.display !== "none")
        .forEach((b) => b.click());
    }

    return calls;
  });

  expect(sceneCalls).toBe(1);
});

test("the guard does not over-gate: locked hint still shows until the premise is met", async ({ page }) => {
  await bootGame(page);
  await clearBubbles(page);

  const result = await page.evaluate(() => {
    const w = window as any;
    // Premise "clicking tent" NOT yet met -> dead tree shows its locked text hint,
    // and the success art bubbles ("10","11") must NOT appear.
    w.clickHandler("dead_x5F_tree_3_");
    const bubbles = Array.from(document.querySelectorAll<HTMLDivElement>(".bubble"));
    const lockedText = bubbles.some(
      (b) => b.querySelector(".bubble__text")?.textContent === "It´s a tree.",
    );
    const successArt = bubbles.some((b) =>
      /bubbles\/bubble-1[01]\.svg/.test(b.style.backgroundImage),
    );

    // Now meet the premise and click once -> the success set DOES fire (2 bubbles),
    // proving the added guard only suppresses re-fires, not the first legitimate one.
    w.clickHandler("tent");
    document.querySelectorAll(".bubble").forEach((b) => b.remove());
    w.clickHandler("dead_x5F_tree_3_");
    const afterUnlock = document.querySelectorAll(".bubble").length;

    return { lockedText, successArt, afterUnlock };
  });

  expect(result.lockedText).toBe(true);
  expect(result.successArt).toBe(false);
  expect(result.afterUnlock).toBe(2);
});
