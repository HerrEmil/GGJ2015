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
- **Bubble DOM leak + ~~duplicate locked-bubble stacking~~.** `bubbleOnce` (`bubble.js:46`)
  only `display:none`s dismissed bubbles (never `remove()`), so `.bubble` nodes — ~~each
  retaining a 300–388 KB SVG background~~ — grow monotonically; ~~and spam-clicking a
  not-yet-unlocked target stacks N identical locked bubbles to dismiss.~~ Real leak +
  annoyance but not a hard softlock; ~~the fix changes `bubbleOnce` "show-once" semantics
  and would need `clickHandler` (`clicks.js:14`) to guard re-issue, so it interacts with
  the existing bubble regressions~~ — left for a focused pass.
  > **CORRECTED 2026-07-17 — the struck text is FALSE; see that entry.** (a) The SVG is
  > fetched **once per URL** and shared: 205 nodes over 2 URLs = **2** requests / 2
  > resource-timing entries. Real cost ≈ 205 empty divs, not 205 × 388 KB. (b) Locked
  > bubbles **do not stack** under real mouse input (peak simultaneously-visible = 2,
  > then strictly 1→0→1→0). (c) The fix is a **one-line** `el.remove()` and **does not**
  > interact with the bubble regressions — all 10 existing specs pass against it.
- **~~`currentLayer` / `dayOrNight` module-global singletons never reset on scene change~~**
  (`scripts.js:1-2`). ~~Latent, not reproduced this run (the sleep-click only fires at
  `currentLayer===5`, which matches night's initial HTML classes), but fragile if a
  future path ever switches scenes at a non-5 layer.~~
  > **CORRECTED 2026-07-17 — see that entry.** `dayOrNight` is **fine** (it IS reset at
  > `scripts.js:10`, and there is no night→day transition); only **`currentLayer`** is
  > defective. And it is **not latent** — it is player-reachable and CONFIRMED
  > (arrow keys are ungated behind a bubble). **Next GGJ2015 fix candidate.**

**Gate:** `npx playwright test` → **7 passed** (3 prior + 2 night-scene + 2 audio-ogg).
No lighthouserc/size/html-validate config in this repo, so the perf/lint gate remains
N/A here; the only CI workflow is the S3 `deploy.yml` (serves `src/`, unaffected by the
`tests/` additions).

## 2026-07-16 — fix: premise-gated steps re-fire on every click (playtest sweep)

**Selection:** cross-game fan-out this run (one headless subagent per game, fresh
disjoint seeds `2026071610`–`14`) found GGJ2015 holding the **only confirmed
fixable defect** — the premise re-fire flagged as "next GGJ2015 fix candidate" by
the 2026-07-16 recon in 2014-7DFPS's ledger. The other four were clean: 2014-7DFPS
(no new defect; the two known-deferred items — unbounded `triHexMeshes`, stale
`prevTime` horizontal teleport — reconfirmed, both out of scope / vendored),
GameLand (green across all 13 games — 0 NaN, no leaked rAF loops, best-score
persistence intact, known fixes hold), LegendaryJourney (invariants + NaN-freedom
hold; off-limits anyway — a concurrent burn task has its tree dirty; served its
existing `dist/` read-only, no rebuild), Sandpiper (frozen WASM, boots clean, all
loader+archive assets 200 exact-case — no fixable source surface). Note Sandpiper
is nominally the "fewest regression tests / oldest ledger" pick, but it has no
defect to fix, so the fix went to the one game that does.

**Defect (MEDIUM, confirmed).** A premise-gated story step re-fired its **entire
success set on every click** once its prerequisite was met. `clickHandler`
(`src/scripts/clicks.js`) has two branches: the non-premise `else` guards re-fires
with `if (!obj.fulfilled)` (`:17`), but the premise branch gated only on the
*premise's* flag (`story[obj.premise].fulfilled`) and never on the step's **own**
`obj.fulfilled` — it *wrote* `obj.fulfilled = true` (`:12`) but never *read* it (a
dead write). So after the prerequisite unlocked a target, each further click
re-ran `bubble(obj.success, …)` and re-armed the `nextScene` closure.
Reproduced headless (seed `2026071611`):
  * `#dead_x5F_tree_3_` ("getting a club", success `["10","11"]`): 5 post-unlock
    clicks created bubbles `[2,2,2,2,2]` instead of `[2,0,0,0,0]` — 10 duplicate
    success bubbles, none removed.
  * `#tent` ("sleeping in tent", success `"08"`, `nextScene:"night"`): each
    post-unlock click re-fired `switchScene('night')` (measured cumulative 1→2→3
    over 3 clicks) → a repeated night transition, `makeSceneMovable` re-run, and
    ambience (`amb/138288…desert-at-night` + `Mood1`) re-triggered.

*Root-cause fix* (`src/scripts/clicks.js`): wrap the premise branch's success path
in the symmetric `if (!obj.fulfilled)` guard, mirroring the non-premise branch
exactly. This makes a premise-gated step fire its success set (and arm `nextScene`)
**once**, then no-op on repeat clicks. It deliberately does **not** touch: the
locked path (`bubble(obj.locked)` still shows while the premise is unmet — the
deferred locked-bubble spam-stacking is untouched), bubble "show-once" semantics,
or the unconditional per-click SFX at `clicks.js:5–8` (`new Audio(story[key].sound)`
plays on any matching click, incl. locked ones — arguably intended click feedback,
separate from this bug, left as-is).

**Regression test:** `regression-premise-refire.spec.ts` (3 tests, all driving the
exposed `clickHandler` / `switchScene` globals):
1. *success set fires exactly once, no re-fire* — fulfil the premise, click the
   dead tree once (`.bubble` count → 2), then 4 more times; assert the count stays
   2. Proven **FAIL pre-fix** (count → 10), **PASS post-fix**.
2. *nextScene not re-armed* — spy on the global `switchScene`, fulfil the chain,
   click `#tent` ×3 (dismissing each success bubble to fire its onComplete);
   assert `switchScene` invoked once. Proven **FAIL pre-fix** (`expected 1,
   received 3`), **PASS post-fix**.
3. *guard is not over-broad* — clicking the dead tree while the premise is unmet
   still shows the locked text hint and fires no success art; after unlocking, the
   first click still fires the success set (2 bubbles). Passes both pre- and
   post-fix (characterization that the added guard only suppresses re-fires).

**Gate:** `npx playwright test` → **10 passed** (7 prior + 3 new). No
lighthouserc/size/html-validate config, so the perf/lint gate stays N/A; `.gitignore`
already covers `node_modules/`, `test-results/`, `playwright-report/`,
`.playwright-mcp/`. Deploy (`deploy.yml`, serves `src/`) unaffected by `tests/`.

**Still-deferred (unchanged, not this run):** the bubble DOM leak +
~~locked-bubble stacking~~ (`bubble.js` only `display:none`s dismissed bubbles — a
fuzz run this seed grew `.bubble` 6→22, `removed:0`), and the
`currentLayer`~~/`dayOrNight`~~ module-singleton non-reset. ~~Both are semantics-changing
and interact with the bubble regressions — a focused pass each.~~
> **CORRECTED 2026-07-17 — see that entry.** The `6→22` growth here is a **HARNESS
> ARTIFACT**: it was produced by driving the exposed `clickHandler` global directly,
> which bypasses the bubble overlay that a real mouse click lands on. Not
> player-reachable. Neither item is semantics-changing, and neither interacts with the
> bubble regressions (all 10 specs pass against both fixes).

## 2026-07-17 — RECON ONLY (no code fix; seeds `77020000`–`77029999`)

Sandpiper was this run's fix target (fewest specs + oldest ledger entry), so **GGJ2015
was not code-fixed**. This entry exists to make the findings durable — in particular to
**correct two ledger claims that were steering future runs wrong** (struck in place
above), and to hand the next run an execute-ready `currentLayer` fix.

### ⚠️ ROOT METHODOLOGICAL LESSON (this will recur — read before trusting any figure here)

**Findings driven through the exposed globals must be re-confirmed with real mouse input
before being believed.** The scariest number in this ledger — the `6→22` bubble growth
(2026-07-16), and the `total=24 visible=13` it reproduces as — is a **HARNESS ARTIFACT**.
It came from calling the exposed `clickHandler` global **directly**, which bypasses the
thing a real click actually hits.

Why the bypass matters: a `.bubble` is `position:absolute`, `100%×100%`, `z-index` 60-100,
appended to `<body>`; the scene lives in `.full` (`z-index:auto`). So **while any bubble is
showing it covers the entire viewport and intercepts the next click** — `clickHandler`
cannot be re-entered by a player. Driving it directly steps around the overlay and
manufactures states the game cannot reach.

Measured contrast, same 12 "clicks" on a locked target (seed `77020900`):

| driver | result |
|---|---|
| **real mouse** (`page.mouse.click` on the tent, panned on-screen) | peak simultaneously-visible = **2**, then strictly `1→0→1→0` |
| `clickHandler()` direct (what prior runs did) | `total=24`, `visible=13` — **not reachable** |

The `2` is the *legitimate* first click firing both matching story entries (`clicking tent`
success `"05"` z=95 + `sleeping in tent` locked `"06"` z=94). Bubbles never stack.

The existing 5 specs all drive `clickHandler`/`switchScene` — that is fine for asserting
*logic*, but any claim about **reachability, stacking, or interception** must be re-proven
with `page.mouse`.

**Method caveat (cost me time, will cost the next run too):** hit-testing **by coordinate
is unreliable here** — at the default pan ratio (`-1`) most targets sit outside the
viewport (the dead tree measured at `x=1732` in a 1280px view). That is the game working
as designed, not a defect. **Interactivity claims must use computed
`pointer-events`/`opacity`, which is pan-independent**; or pan the target on-screen first
and verify with `elementFromPoint`.

### NEXT FIX CANDIDATE — `currentLayer` desync on scene switch (MEDIUM, CONFIRMED player-reachable)

Disproves the 2026-07-15 "latent, not reproduced" note. **Observed headlessly, not inferred.**

**Root cause.** `scripts.js:1` — `var currentLayer = 5` is a module singleton. `switchScene`
(`scripts.js:4-33`) unhides the new scene and reassigns `dayOrNight` (`:10`) but **never
resets `currentLayer`** to 5, the value the scenes' authored HTML encodes
(`index.html:24-33`: `night-4` = `layer--half`, `night-5` = `layer--normal`, `night-6` =
`layer--twice`). Compounded by `switchLayer` (`scripts.js:71-76`), which removes only the
type class it *assumes* is present — so stale classes accumulate and are never cleaned:
**`night-4`'s `layer--half` is permanent**, because `night-4` is never a *leaving* layer
anywhere in the reachable range 3..5.

**Entry point — the ungated back door.** `arrowButtons.js:41-44` binds `keyup` 38/40 →
`switchLayer` with **no `has-bubble` gate**, while `styles.css:100-103`
(`body.has-bubble .nav-arrow { opacity:0; pointer-events:none }`) *deliberately* disables
the nav arrows during a bubble. **The keyboard is an ungated back door to exactly what the
CSS blocks.** (Verified: `armedBubbleState={hasBubble:true, navArrowPE:"none"}` while
ArrowUp still moved the layer.)

**Exact repro — pure real input** (seed `77020200`):
1. Click tent → ArrowUp → click dead tree → ArrowDown → click tent. This arms success
   bubble `"08"`, whose *dismissal* fires `switchScene("night")`.
2. **Press ArrowUp while bubble 08 is still on screen.** → `currentLayer` 5→4.
3. Dismiss the bubble. → `ARRIVAL: {scene:"night", currentLayer:4}` — night's DOM is
   authored for 5.
4. Press ArrowUp.

**Observed symptom** — synced vs desynced, *both at `currentLayer=3`* (seeds `77020600`/`77020601`):

| layer | synced (correct) | desynced (broken) |
|---|---|---|
| `night-3` | `layer--normal`, op=1, **pe=auto** | `layer--faded layer--normal`, op=**0**, pe=**none** |
| `night-4` | `layer--twice`, op=1 | **`layer--half layer--twice`**, pe=none |
| `night-6` | `layer--faded`, op=**0** | **`layer--twice`, op=1** — stuck visible at `scale(4)` |

→ **zero interactive layers** (every layer `pointer-events:none`) for **2 consecutive
layer transitions**, and screenshots show **the wolf gone** (the nominal middleground is
invisible) and **a stale foreground band drawn over the moon with a hard seam**. Both
symptoms at once: wrong scene art *and* dead click targets.

**MEDIUM, not HIGH — it SELF-HEALS.** A 12-step key tour (seed `77020301`) shows
`ArrowDown` ×2 drives `currentLayer` back to 5 and re-syncs; `bag` is reachable again
afterwards. So: a transient dead+corrupt scene, **not an unwinnable softlock**. (Also
worth knowing: only the `.layer--normal` layer is ever clickable, so each target has
exactly one live layer — `tent`@day-5 needs L5, `dead_x5F_tree_3_`@day-4 needs L4.)

**Fix — two variants, both empirically validated against patched copies** (patched under
a scratchpad, repo untouched):
- **Variant A (root, `scripts.js`, ~20 lines):** `switchScene` sets `currentLayer = 5` and
  calls a new `resetSceneLayers(sceneID)` that re-applies the authored baseline
  (`-2`/`-3` faded, `-4` half, `-5` normal, `-6` twice), clearing stale/conflicting classes.
- **Variant B (entry point, `arrowButtons.js`, 1 line):** `if
  (document.body.classList.contains("has-bubble")) return;` in the keyup handler.

| tree | candidate spec | existing 10 specs |
|---|---|---|
| base (unpatched) | **2 failed** | 10 passed |
| A | **2 passed** | **10 passed** |
| B | **2 passed** | **10 passed** |
| A+B | **2 passed** | **10 passed** |

**The existing 5 specs do NOT constrain either fix.** **Recommend A + B:** A restores the
invariant regardless of how a future path desyncs; B closes the only currently-reachable
entry and simply matches the intent the arrows' CSS already expresses. B alone would hide
this repro while leaving the singleton fragile.

**Regression test design** (proven FAIL pre-fix): after arrival **and after every arrow
press**, assert the set of layers with `pointer-events≠none && opacity≠0` equals exactly
`[night-<currentLayer>]`, and that no layer carries two of `half`/`normal`/`twice`.
Pre-fix output: `arrival currentLayer=4 interactive=["night-5"]`, then 8 problems
including `ArrowUp -> L3: interactive=[]` and
`night-4:layer layer--half layer--twice`.

### STILL OPEN — bubble DOM leak (LOW; tidiness, **not** a bug worth risk)

**Real:** `bubble.js:27` sets `display:none` and never `remove()`s. Real-mouse clicks on a
locked target grew `.bubble` 7→12 monotonically, `removed:0`; a **clean full playthrough
leaks 21 nodes** (seed `77020701`).

**Measured impact: none.** Dismissed bubbles do **not** intercept (`elementFromPoint` after
full dismissal returns the SVG `polygon`, not a bubble); `has-bubble` clears correctly;
**CLS = 0**; post-leak real click latency **10 ms**; 400 dismissals in **40 ms**; the SVG
resource is shared per URL (2 requests for 205 nodes), so there is no memory story.

**Fix is one line** (`el.style.display = "none"` → `el.remove()`) and all **10 existing
specs pass against it** — so the "interacts with the bubble regressions" concern is
retired. A regression test would assert `.bubble` returns to its pre-interaction baseline
after dismissal (FAILs pre-fix). **Verdict: fix it opportunistically if `bubble.js` is
open anyway; it does not justify a run of its own.**

### Clean / verified this run

**Seeds.** PRNG fuzz (mulberry32, **220 real-input steps each** — clicks, drags, arrow
keys, mobile 375×812 ↔ desktop 1280×800 resizes): `77020001`, `77021337`, `77023450`,
`77025000`, `77027700`, `77029999`. Scripted probe labels: `77020042` (story completion),
`77020100`/`101`/`102` (bubble leak), `77020200`/`201` (desync repro), `77020300`/`301`
(softlock search), `77020400` (rejections/CLS), `77020500` (adversarial spam),
`77020600`/`601`/`602` (art corruption), `77020700`/`701` (leak cost), `77020800`
(fix-check), `77020900` (real-mouse spam).

- **0** console errors, **0** pageerrors, **0** unhandled rejections, **0** 4xx, **0**
  request failures across all 6 fuzz seeds.
- **No NaN/Infinity:** `currentLayer` stayed finite and within 3..5; every `.style.left`
  finite; every visible bubble `z-index` finite.
- **Story completes end-to-end** with real input (`scaring the wolf` fulfilled), no errors.
- **CLS = 0** across a mobile↔desktop resize storm.
- **Per-click SFX is clean** (`clicks.js:5-8`, `new Audio(...).play()`): no unhandled
  rejections, and the elements stay detached (`audioElsInDoc=0`) — no element leak.
- **No listener leak** in `makeSceneMovable` — the `setInterval` + drag/resize binding is
  correctly guarded by `if (!_sceneState)`, so it binds exactly once.
- **All 3 prior fixes hold**; assets all exact-case. **Gate: `npx playwright test` → 10/10
  passed.**

Repo left exactly as found (`main` @ `0b7e86c`, clean) — all probes lived in a scratchpad.

---

## 2026-07-17 (run 2) — RECON ONLY (no code fix) — touch panning is NaN-poisoned

**Not this run's fix target.** 2014-7DFPS won the selection (fewest regression
specs: 2 vs this repo's 5) and was fixed/gated/pushed instead. This run touched
**only this ledger** — no source file, no spec; all probes were throwaway specs
inside the repo tree, deleted afterwards.

**Seeds this run:** fuzz `77172001`, `77172137`, `77172333` (guarded), `77172500`,
`77172777`, `77172999` (unguarded); scripted probe labels `77172100` (drag
click-through), `77172200` (transition dblclick), `77172300` (reload), `77172400`
(back/forward), `77172500b` (touch), `77172600` (arrow-spam storm), `77172700`
(story completion). 260 real-input steps per fuzz seed. Range 77172000-77172999;
prior runs used 7702xxxx.

---

### DEFECT (HIGH, confirmed, measured twice) — touch drag NaN-poisons `positionRatio`; the game is **unwinnable on any touch device**. **LEADING CANDIDATE FOR THE NEXT FIX RUN.**

**Root cause.**
* `src/scripts/normalizedEvents.js` binds `touchstart`/`touchmove`/`touchend`
  when `"ontouchstart" in window` — i.e. on every phone and tablet.
* `src/scripts/makeSceneMovable.js:16` (`startX = e.screenX`) and `:27-28`
  (`diffX = e.screenX - startX; startX = e.screenX`) read `screenX` **off the
  event object**. `TouchEvent` has no `screenX` — it lives on `e.touches[0]`. So
  on touch, `startX` and `e.screenX` are both `undefined`.
* `diffX = undefined - undefined = NaN` → `makeSceneMovable.js:50`
  `positionRatio = Math.max(-2, Math.min(0, positionRatio + NaN/width))` = **NaN**
  (the clamp does not reject NaN — `Math.min(0, NaN)` is `NaN`).
* `applyPosition()` (`:36-41`) then writes `left: NaNpx`, which is invalid CSS and
  **silently dropped** — the layer freezes at its last valid offset.

**The poison is permanent and unrecoverable.** `positionRatio` is fed back into
itself at `:50`, and `NaN + anything = NaN`. Arrow-key panning calls the *same*
`drag()` (`:54`), so it cannot recover it either; mouse listeners are never bound
in touch mode, so a mouse cannot rescue it. **No input of any kind can restore
panning for the rest of the session.**

**Measured independently, twice** (agent via CDP touch input; then re-verified
first-hand with a `hasTouch: true, isMobile: true` 375x812 probe):

| probe | value |
| --- | --- |
| `normalizedEvents` in a touch context | `{down: touchstart, move: touchmove, up: touchend}` |
| `positionRatio` before | `-1` |
| `positionRatio` after ONE touch drag | **`NaN`** |
| layer `style.left` after | frozen at `-980px` (last valid write) |
| `positionRatio` after arrow-key recovery attempt | **still `NaN`** |
| pageerrors | **0** — it corrupts completely silently |

**Why this is game-breaking, not cosmetic.** The **very first** `touchmove`
produces NaN, so drag-to-explore — the core mechanic — never works on touch at
all, not even once. Taps still fire clicks, but the tent/tree targets sit
off-viewport at the default `positionRatio: -1` pan, so the story is
**unreachable** on mobile. Zero console errors means nothing surfaces the failure.

**Fix shape (for the next run).** Read the coordinate from the right place:
`(e.touches && e.touches[0] ? e.touches[0] : e).screenX`, in **both** `:16` and
`:27-28`. Guard `touchend`, whose `touches` list is **empty** (`e.touches[0]` is
`undefined` there) — `mouseUp` currently ignores its event, so confirm the
`touchend` path never reaches the coordinate read. Consider also making `drag()`
reject a non-finite `diffX` defensively, so a future binding mistake degrades to
"no pan" instead of "permanently dead pan".

**Regression test design.** Run under `test.use({ hasTouch: true, isMobile: true,
viewport: { width: 375, height: 812 } })`; assert `normalizedEvents.down ===
"touchstart"` (proves the touch path is actually the one under test — without
this the test silently exercises mouse and passes vacuously); dispatch a real CDP
`Input.dispatchTouchEvent` touchStart/touchMove/touchEnd drag; assert
`Number.isFinite(_sceneState.positionRatio)` and that the drag actually **changed**
the pan. Fails at `NaN` pre-fix. Add a desktop control case so the mouse path is
proven un-regressed.

---

### DEFECT (MEDIUM, confirmed) — a pan gesture that starts on a clickable target activates it on release

The `--normal` layer moves 1:1 with the cursor (`layerFactors[1] = 1`,
`makeSceneMovable.js:34-40`), so the element under the pointer at `mousedown` is
still under it at `mouseup` → Chrome fires `click` → the Snap handler at
`src/scripts/clicks.js:36` runs. **Measured** (seed `77172100`): a 240px real-mouse
drag starting on `#tent` produced 2 bubbles and flipped
`story["clicking tent"].fulfilled` to `true`; a control drag from empty sand
produced 0 bubbles. With the premise chain met, the same gesture fires success
`"08"` and arms the day→night switch — **story progression from what the player
intended as a pan**. `onMouseDrag` (`makeSceneMovable.js:11`) has no
drag-distance click suppression.

*Fix shape:* track cumulative drag distance; past a ~5px threshold suppress the
next `click` once, capture-phase. Note this interacts with the touch fix above —
do the touch fix first, then this, since both live in `onMouseDrag`.

---

### DEFECT (LOW, confirmed) — double-click races the day→night transition and eats the never-seen arrival bubble

Dismissing success bubble `"08"` synchronously runs `switchScene("night")` →
`bubble([28])` (`scripts.js:31`), so click #2 of a double-click (~80ms later)
lands on the freshly-spawned bubble 28 and dismisses it. **Measured:** `preDbl=1
→ postDbl=0`, scene = night, `switchScene` count stayed 1, no stuck `has-bubble`,
invariants clean. The player silently misses the "cannot sleep" arrival line;
state stays consistent. Arguably genre-normal text-skipping — **UX polish, not a
bug**. Same applies to the intro art sequence.

### Verified CLEAN this run (new coverage)

- **Assets:** all **53 runtime-reachable** assets 200 + exact case — every
  referenced bubble SVG including the dynamic `bubble-${id}` ids, all 7 sound keys
  x mp3+ogg including the dynamically-built `story[].sound` paths that the static
  `regression-asset-case` spec cannot see, all 12 scene SVGs. Detached-`<audio>`
  requests confirmed actually issued.
- **6-seed x 260-step real-input fuzz** (clicks, drags, double-clicks, arrow nav,
  left/right pan holds, clicks-mid-fade, 375x812 <-> 1280x800 resizes): 0 console
  errors, 0 pageerrors, 0 unhandled rejections, 0 4xx, 0 request failures, 0
  crashes, 0 dialogs, 0 NaN/Infinity on the **mouse** path (`currentLayer`, layer
  lefts, ratio/width, bubble z-indexes), 0 layer-class invariant violations, 0
  dead states, **CLS = 0** in every seed. Guarded seeds suppressed arrows during
  bubbles so any violation would be provably new.
- **Transition-cancel storm** (24 arrow presses at 45ms, inside the 500ms fade):
  class invariants held mid-storm and after settling; the stale-`transitionend`-
  listener accumulation in `switchLayer` is **empirically harmless**; panning
  alive afterwards.
- **Reload mid-story** (night, 3 bubbles up): clean fresh boot, flags reset, no
  errors. **Back/forward x2:** fresh reload (no bfcache here), fully functional.
- **Story completes end-to-end** with real input (`scaring the wolf` fulfilled),
  zero errors/4xx.
- **No new `switchScene` double-fires** (counter stayed 1 across transition races)
  — the 2026-07-16 premise-refire fix holds under adversarial timing.
- The known `currentLayer` desync backdoor did not fire in unguarded fuzz (the
  bubble-up + arrow window is narrow under random input) — nothing new learned;
  the existing fix plan stands. Known bubble-node leak observed again
  (`bubbleTotal` up to 13) — already recorded, not re-filed.

**Gate:** `npx playwright test` → **10/10 passed**, unchanged. Repo left clean.
