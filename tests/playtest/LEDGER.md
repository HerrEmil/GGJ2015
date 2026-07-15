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

## 2026-07-15 — run seed base `20260715` (playtest-sweep pick: oldest ledger)

Selected GGJ2015 this run — it held the **oldest ledger entry** of the five games
(2026-07-12) and was burn-free (GameLand + LegendaryJourney had concurrent burn tasks
this window, so their trees were off-limits). A fresh headless fuzz (seed base
`20260715`: out-of-order clicks, full day→night story, layer-nav + blind-click fuzz,
resize) surfaced **three new real defects**; the two clean, low-risk ones were fixed
this run. (Boot OK, no console/asset/NaN/resize issues; the 2026-07-12 fixes still hold
— existing 3 regressions green.)

**Defects fixed & regressed (2):**

1. **Night scene un-pannable on arrival — `switchScene` never re-bound the pan
   controller (logic/state).** `makeSceneMovable` (`src/scripts/makeSceneMovable.js`)
   keeps a single module-level `_sceneState`. `switchLayer` re-calls it on every layer
   change (`scripts.js:88`), but `switchScene` (`scripts.js:4`) only toggled `.hidden`
   and reassigned `dayOrNight` — it never rebound. So once the story turned day→night,
   the drag / arrow-key controller kept moving the now-**hidden** day layers while the
   visible night layers stayed frozen; the night scene (half the game, whose core
   interaction is drag-to-explore parallax) was dead-on-arrival until an up/down press
   happened to rebind it via `switchLayer`. Reproduced headless: a real `page.mouse`
   drag in the night scene moved the hidden `day-*` layers, not the visible `night-*`.
   *Root-cause fix:* `switchScene` now queries the newly-visible scene's active layers
   (`.layer--half/--normal/--twice`, exactly as `setupDay`/`setupNight` do) and calls
   `makeSceneMovable(newScene, layers)` after unhiding. DOM-truth based, so it's robust
   to the separate latent `currentLayer`/`dayOrNight` desync (see follow-ups).
   (`src/scripts/scripts.js`)
   *Regression test:* `regression-night-scene-pannable.spec.ts` — drives day→night, then
   a real drag, asserting the visible night layers move and the hidden day layers do not
   (+ a guard that switching back to day rebinds to day). Proven **FAIL pre-fix**
   (`nightMoved` false), **PASS post-fix**.

2. **Dead OGG audio fallback — the `<source type=audio/ogg>` pointed at the `.mp3`
   file (typo).** `src/scripts/sound.js` built `srcOGG` with `snd/${key}.mp3` while
   typing it `audio/ogg; codecs="vorbis"`, so both `<source>`s referenced the MP3. On
   any engine without MP3 decode the "fallback" was an MP3 relabeled as OGG → decode
   fail → silent, and the shipped `.ogg` twins (all 7 present, 200) were never requested.
   *Root-cause fix:* one char — `.mp3` → `.ogg` on the OGG source. (`src/scripts/sound.js`)
   *Regression test:* `regression-audio-ogg-source.spec.ts` — asserts the wrapper's
   `audio/ogg` source ends `.ogg` and `audio/mpeg` ends `.mp3`, plus a deploy-safety
   guard that the `.ogg` twin returns 200. Proven **FAIL pre-fix**, **PASS post-fix**.

**Deferred (not this run, on purpose — semantics-changing / higher risk):**
- **Bubble DOM leak + duplicate locked-bubble stacking.** `bubbleOnce` (`bubble.js:46`)
  only `display:none`s dismissed bubbles (never `remove()`), so `.bubble` nodes — each
  retaining a 300–388 KB SVG background — grow monotonically; and spam-clicking a
  not-yet-unlocked target stacks N identical locked bubbles to dismiss. Real leak +
  annoyance but not a hard softlock; the fix changes `bubbleOnce` "show-once" semantics
  and would need `clickHandler` (`clicks.js:14`) to guard re-issue, so it interacts with
  the existing bubble regressions — left for a focused pass.
- **`currentLayer` / `dayOrNight` module-global singletons never reset on scene change**
  (`scripts.js:1-2`). Latent, not reproduced this run (the sleep-click only fires at
  `currentLayer===5`, which matches night's initial HTML classes), but fragile if a
  future path ever switches scenes at a non-5 layer.

**Gate:** `npx playwright test` → **7 passed** (3 prior + 2 night-scene + 2 audio-ogg).
No lighthouserc/size/html-validate config in this repo, so the perf/lint gate remains
N/A here; the only CI workflow is the S3 `deploy.yml` (serves `src/`, unaffected by the
`tests/` additions).
