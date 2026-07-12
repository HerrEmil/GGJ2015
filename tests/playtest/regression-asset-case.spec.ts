import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Regression: the night ambience was referenced as
// `new Audio("amb/138288__kangarooVindaloo__desert-at-night")` (capital V) while
// the file on disk is `...kangaroovindaloo...` (lowercase). macOS's case-insensitive
// filesystem hides this locally, but S3/CloudFront (case-sensitive) 404s it.
// This test resolves every statically-referenced asset with EXACT case, so a
// case typo fails regardless of the host filesystem. Pre-fix: FAILS on the capital-V
// key; post-fix: PASSES.

const SRC = path.resolve(process.cwd(), "src");

/** True only if every path segment exists with exact case under `root`. */
function existsExactCase(root: string, relPath: string): boolean {
  const segments = relPath.split("/").filter(Boolean);
  let dir = root;
  for (let i = 0; i < segments.length; i++) {
    let entries: string[];
    try {
      entries = fs.readdirSync(dir);
    } catch {
      return false;
    }
    if (!entries.includes(segments[i])) return false;
    dir = path.join(dir, segments[i]);
  }
  return true;
}

const scriptSource = fs
  .readdirSync(path.join(SRC, "scripts"))
  .filter((f) => f.endsWith(".js"))
  .map((f) => fs.readFileSync(path.join(SRC, "scripts", f), "utf8"))
  .join("\n");
const htmlSource = fs.readFileSync(path.join(SRC, "index.html"), "utf8");

/** Every asset relative path the source STATICALLY references (relative to src/). */
function referencedAssets(): string[] {
  const assets = new Set<string>();
  const both = `${scriptSource}\n${htmlSource}`;

  // new Audio("key") -> snd/key.mp3 and snd/key.ogg  (string literals only)
  for (const m of both.matchAll(/new Audio\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
    assets.add(`snd/${m[1]}.mp3`);
    assets.add(`snd/${m[1]}.ogg`);
  }
  // importSVG("images/...svg", ...)  (string literals only)
  for (const m of both.matchAll(/importSVG\(\s*["']([^"']+)["']/g)) {
    assets.add(m[1]);
  }
  // url(images/...svg) / url(bubbles/...svg) — only from index.html's inline
  // styles. (Scanning JS would pick up the dynamic `bubble-${id}.svg` template
  // and code comments, which are not static asset paths.)
  for (const m of htmlSource.matchAll(/url\((?:["']?)((?:images|bubbles)\/[^"')]+)(?:["']?)\)/g)) {
    assets.add(m[1]);
  }

  // Drop any dynamic path (should not occur after the above, but be safe).
  return [...assets].filter((p) => !p.includes("${"));
}

test("every statically-referenced asset resolves with exact case", () => {
  const assets = referencedAssets();
  expect(assets.length).toBeGreaterThan(0); // guard: the extraction actually found refs

  const missing = assets.filter((rel) => !existsExactCase(SRC, rel));
  expect(missing, `assets referenced in source but missing (exact-case) under src/:\n${missing.join("\n")}`).toEqual([]);
});
