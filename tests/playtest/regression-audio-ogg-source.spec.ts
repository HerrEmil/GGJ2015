import { test, expect } from "@playwright/test";

// Regression: the sound.js Audio() wrapper builds two <source>s for MP3/OGG
// fallback, but the OGG source's `src` pointed at the ".mp3" file while being
// typed `audio/ogg`. On any engine without MP3 decode the "fallback" handed it
// an MP3 relabeled as OGG -> decode fails -> silent, and the deliberately-shipped
// .ogg twins were never requested (dead weight). Pre-fix FAILS (ogg src ends
// .mp3); post-fix PASSES.
//
// That the .ogg twin actually exists on disk, with exact case, is covered for
// every `new Audio()` key by regression-asset-case.spec.ts.

test("Audio() OGG fallback source points at the .ogg file, MP3 at .mp3", async ({ page }) => {
  // Plain load, not bootGame: this test only inspects the Audio wrapper, and
  // dismissing the intro would fetch the intro music + ambience for nothing.
  await page.goto("/");

  const sources = await page.evaluate(() => {
    // sound.js overrides the global Audio with its <audio>-building wrapper.
    const el = (window as any).Audio("Intro1") as HTMLAudioElement;
    return Array.from(el.querySelectorAll("source")).map((s) => ({
      type: s.getAttribute("type") || "",
      src: s.getAttribute("src") || "",
    }));
  });

  const mp3 = sources.find((s) => s.type.includes("audio/mpeg"));
  const ogg = sources.find((s) => s.type.includes("audio/ogg"));

  // Both a real MP3 and a real OGG source, each pointing at its own file type.
  expect(mp3?.src).toBe("snd/Intro1.mp3");
  expect(ogg?.src).toBe("snd/Intro1.ogg");
});
