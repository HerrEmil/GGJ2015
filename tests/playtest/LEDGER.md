# GGJ2015 "Sand Grains" — Playtest Ledger

Cross-game self-play bug-hunt. Each run seeds fresh input ranges, plays headless,
mines for real defects, and fixes the root cause with a regression test.

## 2026-07-12 — run seed base `20260712065`

Playwright harness bootstrapped (`@playwright/test`, `playwright.config.ts` serving
`src/` via a dependency-free static server). Repo previously had ZERO tests.

**Defects found & fixed (2):**

1. **Broken text-hint bubble (logic/data).** Clicking the dead tree before the tent
   reaches story `getting a club` → `locked: "It´s a tree."`. That hint is plain
   text, but `bubbleOnce` only supported numeric SVG bubble ids: it built
   `url(bubbles/bubble-It´s a tree..svg)` (invalid unquoted url with spaces, dropped
   by the CSS parser) and `z-index: 100 - "It´s a tree."` = `NaN`. Result: an
   invisible, art-less bubble — the hint was never shown, and `has-bubble` was left
   toggled on an empty overlay.
   *Root-cause fix:* `bubbleOnce` now detects non-numeric ids and renders them as a
   legible text bubble (`.bubble--text`) with a valid z-index. Numeric-id art path
   unchanged. (`src/scripts/bubble.js`, `src/styles/styles.css`)
   *Regression test:* `regression-locked-hint-bubble.spec.ts` (+ guard that numeric
   art bubbles still render). Proven FAIL pre-fix, PASS post-fix.

2. **Case-sensitivity 404 (deploy-only).** Night ambience referenced
   `new Audio("amb/138288__kangarooVindaloo__desert-at-night")` (capital V) while the
   file is `...kangaroovindaloo...`. macOS's case-insensitive FS hides this; on the
   case-sensitive S3/CloudFront deploy it 404s and the night scene loses its ambience.
   *Root-cause fix:* corrected the reference to lowercase. (`src/scripts/scripts.js`)
   *Regression test:* `regression-asset-case.spec.ts` — resolves every statically
   referenced asset (`new Audio`, `importSVG`, inline `url()`) with exact case, so a
   case typo fails regardless of host FS. Proven FAIL pre-fix, PASS post-fix.

**Gate:** `npx playwright test` → 3 passed. No lighthouserc/size/html-validate in this
repo, so the perf/lint gate is N/A here.

**Play coverage this run:** intro dismissal; day scene click targets incl. out-of-order
tree/tent; layer up/down navigation; scene switch day→night; mobile 375×812 + desktop
resize; seeded click fuzz. No console errors or unhandled rejections observed post-fix.
