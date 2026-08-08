# Project State — BlueGrid Land Solutions

**Last updated:** 2026-08-07
**Repository:** `c:/Dev/NuloWorkspace/ClientSites/client_BluegridLandSolutions/`
**Branch:** `main`
**Last content commit:** `9237e53` — chore: drop the GBP service graphic, ignore local GBP marketing assets
**HEAD:** this session's docs-only compaction commit, sitting one above `9237e53`
**Remote:** `origin` → `https://github.com/ArxnAlley/BluegridLandSolutions.git` — **stale, see Waiting on Aron**
**Sync:** `main` is **1 ahead of** `origin/main` — the compaction commit was deliberately not pushed. Everything before it is pushed.
**Working tree:** clean

> Source of truth for resuming work. Only verified, completed work is recorded here.
> Read this file first. `engineeringJournal.md` has the reasoning; `technicalDebt.md` has what is knowingly deferred.
> **The last section of this file is where the next session starts.**

**Scope note:** BlueGrid is a Nulo Studio *website + lead-capture* client. It receives the static site, the Google Apps Script lead pipeline, and the reusable front-end systems described below. It does **not** receive NuloOS, the NuloEdge dashboard shell, or any platform product.

---

## Current Phase

**Between phases. Nothing is half-finished and the working tree is clean.** All content work is merged into `main` and pushed; only this closeout's docs commit is unpushed.

| Phase | State |
|---|---|
| Phase 1 — Website completion | Complete |
| Phase 2A — Lead capture infrastructure | Complete |
| Phase 2B — Service area pages, first wave | Complete (6 of 13 cities) |
| Phase 2C — Hero mobile refinement | Complete |
| Phase 2D — Live Apps Script backend | **Complete — lead capture is live** |
| Header navigation polish + tokenization | Complete |
| Navigation & content expansion (FAQ hub, Insights) | Complete |
| Launch polish — services mega menu, hero typing performance | Complete |
| Process section — dark board, arrowheads, sequenced reveal | Complete (animation behaviour changes next session) |
| Mega menu design system — all three panels | Complete |
| Merge to `main` + push | Complete |
| Repository / GBP asset housekeeping | Complete |

**The production domain is the only outright launch blocker.**

---

## Overall Objective

Take the BlueGrid Land Solutions website from "built but not launchable" to production launch:

1. ~~Repair missing functionality and broken navigation~~ — done
2. ~~Complete missing content (service pages, service area pages)~~ — done for the first wave
3. ~~Wire lead capture end to end (website → Apps Script → Sheet → owner email)~~ — done and verified live
4. Final SEO, performance, and launch validation — **blocked on the domain**

---

## Current Repository Status

**97 tracked files. 23 HTML pages.**

```
index.html                  homepage
faq/index.html              FAQ hub — 28 questions, 6 categories
services/          (7)      forestryMulching, landClearing, brushRemoval,
                            trailCutting, stormCleanup, propertyCleanup,
                            huntingPropertyPrep
locations/         (6)      forestry-mulching-{ashland-ky, portsmouth-oh,
                            ironton-oh, chillicothe-oh, grayson-ky, morehead-ky}
insights/          (8)      index.html + 7 articles
appsScript/        (7 .gs)  Code, routes, leads, validation, notifications,
                            utilities, config  (+ README.md, localTestRunner.js)
css/                        styleIndex.css (homepage + shared systems),
                            stylePages.css (interior pages)
js/indexJS.js               single shared script for all 23 pages
.gitignore                  one rule — see GBP assets below
docs/                       this file, engineeringJournal.md, technicalDebt.md,
                            seoPlan.md, servicePageArchitecture.md,
                            forestryModuleSchema.md, googleSheetArchitecture.md,
                            heroDirection/, phasePrompts/
```

### Architecture facts a new session must know

- Static site, **no build step**, pure HTML/CSS/JS per `codeStyle.md`.
- Shared chrome (header, mega panels, mobile drawer, estimate modal, footer, floating actions) is **duplicated into every page** and kept in sync by guarded one-shot Node scripts run from a scratchpad. **Those scripts are deliberately not checked in** — Phase 13 (`docs/phasePrompts/phase13ServiceAreaExpansion.md`) owns the real generator. Every one of them refuses to write unless its guards pass; that habit has caught three separate classes of defect and should be kept.
- **Two path variants.** Root pages take the canonical href; every one-level folder takes `../` + href. The Services mega panel used to be the one exception (bare siblings inside `services/`) and that exception was retired on 2026-08-07, so all three panels spell paths the same way.
- **Put any new page one level deep** so it reuses the proven one-level chrome — that is why the FAQ page is `faq/index.html` rather than `faq.html`.
- **Line endings are mixed and deliberate.** `index.html`, `js/indexJS.js`, `css/styleIndex.css` and most `services/*.html` are CRLF; `css/stylePages.css`, `services/forestryMulching.html`, `locations/*`, `insights/*`, `faq/*` are LF. **Any scripted edit must detect and preserve per file.** Validators that match on `\n` must normalise first — that bug has bitten twice.
- The Apps Script endpoint lives in **exactly one place** — `businessConfig.estimateEndpoint` in `js/indexJS.js` — with exactly one `fetch()` call site.

### Responsive breakpoints (current)

| Width | What changes |
|---|---|
| **≤1280px** | Header compact band — token overrides only (`--headerPadX`, `--headerGap`, `--headerNavGap`, `--headerNavLinkPadX`, …). `--headerCtaPadX` is pointedly absent: the primary CTA keeps its padding at every width. |
| **≤1150px** | **Mobile nav switch.** `.primaryNav`, `.phoneChip` and `.headerCta` hide; hamburger appears. Header-only on purpose. |
| **≤1080px** | Section layouts — hero media band, services grid, **process board goes vertical**. |
| ≤640px, ≤360px | Progressive tightening. |

Every header dimension is a `:root` custom property overridden in the two header queries, and all of them animate on a shared `--headerTransition` (`0.35s var(--easePremium)`), zeroed under `prefers-reduced-motion`.

### GBP marketing assets — decided 2026-08-07

- **`graphics/GBP - Services/` is intentionally local and ignored by Git** (`.gitignore:18`). It holds Google Business Profile marketing collateral — service tiles, post images — not website assets. The folder and its contents stay on disk; they are simply never offered to Git, now or for future GBP graphics dropped there.
- **`graphics/images/GBP_ForestryMulchingService.png` was intentionally removed** (commit `9237e53`). It had been swept into `235a4a3` by a broad `git add -A` rather than added deliberately: 2.6MB of repository for a file the site never loaded.
- **Verified at closeout:** zero references to `GBP_ForestryMulchingService` anywhere in the working tree, and the file is absent from `HEAD`.

---

## Verification State — all green at `9237e53` (unchanged by the docs commit above it)

| Check | Result |
|---|---|
| Internal links & assets | **23 pages, zero broken** |
| Navigation / mobile drawer / FAQ hub / Insights | PASS on all 23 pages |
| **Mega menu system** | PASS — 23 pages × 3 panels: one shell, every row on `.megaRow`, links resolving with the right relative form per depth, no duplicate ids, `aria-controls` intact, retired classes gone from CSS *and* markup, fit 1151–1600px, height spread **24%** against a 45% gate |
| **Process sequence** | PASS — 8 pages: 13 beats in exact order, max 1 arrow bright, reset in one tick, loop restarts, 0 changes off-screen or tab-hidden, reduced motion registers nothing |
| Header width sweep 900–1600px | PASS — zero wrapping; tightest desktop 1151px at **+163px** slack |
| Hero seam geometry (5 viewports) | PASS — copy ends exactly on the seam, 24px card overlap |
| Hero before/after loop (10 min simulated) | PASS — **91 cycles alternating**, 6.16–7.01s cadence |
| Hero typing profile (5 min simulated) | PASS — rendered cadence equals scheduled cadence exactly; **0 characters swallowed**, **0ms** write-to-paint |
| Lead submission contract | PASS — one endpoint, one call site, payload matches schema on all 23 pages |
| Apps Script harness | **64/64**, `runSelfTest` 6/6 |
| `node --check` (indexJS, localTestRunner) | clean |
| CSS brace balance | balanced in both stylesheets |

**All validation to date is static analysis or simulation.** No session on this project has ever had a browser. See `technicalDebt.md` item 4.

---

## Completed Work (verified)

### Lead capture — Phase 2A + 2D, live
- 7 Apps Script modules (`Code`, `routes`, `leads`, `validation`, `notifications`, `utilities`, `config`), 27-column `LEADS_HEADERS`, `errorLog` sheet, honeypot `companyWebsite`, `leadId` format `BG-\d{13}`, server-side dedupe on `leadId`, `LockService`, formula-injection defence.
- **Production `/exec` wired and verified live** with zero side effects: `ping` returned the matching `forestryModule` / `bluegrid` / `1.0.0` identity, proving the deployed script is this repo's code; `UNKNOWN_ACTION` and `UNAUTHORIZED` behaved; a honeypot-tripped `POST leads.create` exercised the whole transport chain while the server short-circuited before writing a row or sending mail.
- **Duplicate-submit defect found and fixed** by the post-wiring review. `isLoading` was cosmetic, the button was never `disabled`, and `buildEstimatePayload()` minted a fresh `leadId` per call — a double-tap would have sent two payloads with two ids the server's dedupe could not collapse (two rows, two owner emails, two auto-replies, double MailApp quota). Fixed with an in-flight lock, a genuinely disabled button, release on all three terminal paths, and a `leadId` held stable for the page load so a retry collapses into the original row.
- `text/plain` POST transport is deliberate — Apps Script web apps cannot answer a CORS preflight.

### Location pages — Phase 2B
6 pages, rows 1–6 of the `seoPlan.md` table. Local intent block, four-tile fact grid, terrain write-up, "what landowners here call us about" cards, all 7 services linked with localized anchor text, **5 unique local FAQs** each, estimate form with `serviceNeeded` preselected, nearby-communities block. **Uniqueness enforced mechanically:** worst pairwise 5-word-phrase overlap **14.7%** against a 25% gate; 1,133–1,283 body words each. Rowan County was added to `serviceRegions`, `LocalBusiness` `areaServed`, the map panel and both copies of the county FAQ answer — Morehead was advertised but Rowan appeared nowhere in the coverage data.

### Hero — media and typing
- **Media decoupled from section height.** `.heroMedia` was `inset: 0`, so on mobile the photo stretched to cover the doubled section. Now pinned top-only with `height: var(--heroMediaHeight)` (`100lvh`, `100vh` fallback); one property drives the media band, the copy block and the estimate band. `.heroSection::after` gives the estimate area its own background in the colour the photo fades into; the card rides 24px over the seam.
- **Before/after loop fixed at the cause.** The reverse dissolve was fire-and-forget with an 1800ms cleanup timer while the loop moved on after 220ms, so a stale cleanup stripped the next cycle's `isRevealed` mid-sweep. Now awaited. The forward sweep gained an `error` fallback so a failed image cannot strand the loop.
- **Typing profiled, then optimized.** Three measured causes: one `setTimeout` per character writing into `.textContent` (8.5ms mean write-to-paint, and two writes could land in one frame with the second erasing the first); a schedule asking for cadences the display cannot express (+24% jitter at 60Hz, +31% under load); and `.heroHeadline` losing its compositing layer at t=2200ms — roughly the sixteenth character of the first phrase — after which every keystroke re-rastered **655k pixels of hero photograph, 8.0 megapixels/second**.
  Fixes: commits inside `requestAnimationFrame`, deadlines chained from the frame that served the previous commit, a cached `Text` node mutated via `nodeValue`, strings pre-computed outside the frame callback, and `.heroTypedLine` holding its own compositing layer (zeroed under reduced motion). Result: jitter added by the render step **0%**, write-to-paint **0ms**, text-node rebuilds 873 → 18, timers 939 → 139. `heroDuetConfig` untouched.
  **Frame-counting was rejected and the rejection verified** — 0.1ms smoother at 60Hz but exactly double speed on a 120Hz panel (40.5ms vs 81.8ms mean).

### Header — responsive architecture
Measured with the real Inter/Rokkitt font metrics (TTF extracted from the EOT wrapper; `head`/`hhea`/`hmtx`/`cmap` parsed). The full-spacing header needed 1207px while the mobile switch sat at 1080px — a 126px band where the desktop nav was live and could not fit. **101px of tightening**, then the **switch moved 1080 → 1150px**; the compact band starts at 1280px, above the wrap point, so crossing it makes the bar roomier rather than tighter. Then tokenized: twelve `:root` properties, both queries reduced to token overrides, one shared transition curve.

### FAQ hub — `faq/index.html`
28 questions in 6 categories, jump-link grid, per-question anchors, `FAQPage` schema, cross-links to all 7 service pages. **All 28 are new** — the site already had 75 FAQs and `seoPlan.md` bans duplicates, so the hub took the uncovered ground.

### Insights hub — `insights/`
Landing page + 7 articles, 550–900 body words each, worst pairwise overlap **0.3%**. No dates anywhere, by instruction. Hero images are real job photos standing in, all `TODO:`-marked.

### Mega menu design system — **reuse this, do not build another**

All three panels — **Services**, **Service Areas**, **FAQ** — are built from one shared architecture. Each of these is declared **once**, and `validateMegaMenus` asserts it:

| Part | Role |
|---|---|
| `.megaPanel` | The shell: width `min(760px, 100vw - 3rem)`, padding, radius, surface, border, shadow, top-edge highlight, open/close transition, and the transparent `::before` band that bridges the 14px gap to the toggle |
| `.megaFeature` | The featured card that opens every panel — icon tile, eyebrow, display-face title, supporting line, cue with a sliding arrow |
| `.megaBody` | The region under the feature: divider and rhythm |
| `.megaRow` | The row primitive — padding, radius, hover tint, and the sky rule that grows down the leading edge |
| `.megaGroup` / `.megaGroupHeading` / `.megaGroupIcon` | One labelled-group treatment |
| `--mega*` (9 tokens) | Surface, shadow, top edge, rule, row radius, hover tint, label and copy colours |

Panels are `class="megaPanel"` with unique ids — the per-panel modifier classes were retired; `aria-controls` already used the id. Positioning resolves against **`.primaryNav`**, not `.navItem`, so all three land on the same rectangle and switching nav items swaps one panel's contents instead of sliding three.

Internals differ by content, and should:
- **Services** — featured Forestry Mulching, then six services in three labelled groups of two (Clearing & Site Prep / Access & Habitat / Cleanup & Recovery).
- **Service Areas** — featured *Where We Work*, then two regions whose 13 towns flow down two sub-columns each; a pin sits on each region heading, not on every town.
- **FAQ** — featured *Questions We Get Every Week*, then the six highest-intent questions with one-sentence previews. The full library stays on the FAQ page.

**Any future mega menu — including "Our Company" — must be built on these parts.** Adding a fourth independent system is the specific thing this architecture exists to prevent.

### Process section — current state
A centred dark board (`.processBoard`, max-width 1120px) floating on the white section, steps inside it, **arrowheads only** between steps (no connecting rule), CTA below. Homepage runs 5 steps; the 7 service pages run 4. Nothing assumes a count — arrows are always steps − 1. Flex layout replaced a grid hardcoded to `repeat(5, 1fr)`, under which seven of the eight pages had been rendering with an empty fifth column.

**Current animation behaviour:** step reveals → arrow flashes → arrow dims → next step; after the last step a 2.6s hold, then **the whole board resets and replays**, looping while on screen. 10.18s per cycle at five steps. Viewport-triggered by `IntersectionObserver` with asymmetric hysteresis (enters on meaningful arrival, exits only when fully off screen); a hidden tab pauses; returning replays from step one. Reduced motion shows everything immediately and registers no observer or timers.

**This looping behaviour changes next session — see the planned work below.**

### Merge, push, and housekeeping
`phase2a-lead-capture` merged into `main` as a clean **fast-forward** (`8108f94..bc4021d`), 17 commits, 42 files, 52,050 insertions, **zero deletions**; the single rename is the Phase 2C `hero_after.JPG → after.JPG` casing fix. Full validation re-run on `main` after the merge — 12/12. Pushed `main → origin/main`. The feature branch was **not deleted** and still exists at `bc4021d`, 8 ahead of `origin/phase2a-lead-capture`. Then the GBP housekeeping commit `9237e53`.

---

## Currently In Progress

**Nothing.** Working tree clean, `main` synchronized with `origin/main`, all validators pass.

---

## Remaining Launch Work (priority order)

1. **Settle the production domain** — blocks 2–5. Canonicals say `https://www.bluegridlandsolutions.com/`; `CNAME` says `bluegridlandsolutions.nulostudio.com`.
2. **`robots.txt`** — does not exist.
3. **`sitemap.xml`** — does not exist. Needs **23 URLs** today, 28 once location rows 7–11 ship.
4. **Canonical URL finalization** — 23 pages, every one `TODO:`-marked so a single sweep catches them.
5. **Open Graph finalization** — same 23 pages; `og:url` and `og:image` must become absolute.
6. **One real end-to-end lead submission** from the live site. Never run by this project — that path writes a row and emails both the owner and the customer.
7. **Visual browser QA.** No session has ever had a browser. Largest untested-by-eye items: the three mega panels side by side, the process section, the hero typing, the process board on tablet.
8. **Search Console** — property verification and sitemap submission, after 1–3.
9. **Lighthouse mobile + desktop** — hero images are full-resolution `2048×1536` with no `srcset`; Google Fonts loads render-blocking.
10. **Location pages rows 7–11** — Jackson OH, Gallipolis OH, Waverly OH, Greenup KY, Louisa KY. Build to the shipped six, not a template.
11. **Decide West Union, OH and Flatwoods, KY** — advertised in the nav but absent from `seoPlan.md`'s 11-city table.
12. **Google Business Profile** — none exists. `docs/phasePrompts/phase6GoogleBusinessProfile.md` holds the playbook. Marketing artwork is already being staged locally in `graphics/GBP - Services/`.

---

## Current Blockers

| # | Blocker | Impact |
|---|---|---|
| 1 | **Production domain undecided** | The only outright launch blocker. Gates `robots.txt`, `sitemap.xml`, canonicals, OG URLs across 23 pages, and Search Console. |
| 2 | `MODULE_API_KEY` state unknown | Cannot be checked from outside — `leads.list` returns `UNAUTHORIZED` whether the key is unset or merely not supplied. Blocks only a future dashboard, never the public form. |

---

## Waiting on Client (Chase)

- **Price ranges.** `seoPlan.md` calls cost transparency the biggest opening in this trade. No page quotes a dollar figure because none has been approved. **Rough per-acre or per-day ranges are the single highest-value upgrade available to the location pages** and cost one conversation.
- **Confirm Rowan County / Morehead coverage.** If Chase does not work Rowan County, the Morehead page and all four data entries come back out.
- **Real project photos** — ideally before/after pairs per service, tagged by location. Would unlock galleries on all 6 location pages and replace the Insights placeholders.
- **Owner introduction video** — section is built and video-ready; two config fields.
- **Badge artwork typo** — the official badge reads **"FORESTRV"**, not "FORESTRY". Appears on every page.
- **Confirm phone** `(740) 464-2526` and **business email** `estimates@bluegridlandsolutions.com` — both placeholders.
- **Confirm the Facebook page renders in the Page Plugin** → flip `facebookPageConfigured`.
- **Google Business Profile** — does not exist; the footer icon is hidden at runtime.
- **May we name Chase on the site?** Copy says "the owner" throughout.
- **Verified company facts for the "Our Company" menu** — see planned work. Nothing about history, credentials, awards, certifications, years in business, or crew size may be written without Chase confirming it.
- **Copy review** of the 6 location pages and 7 Insights articles.

## Waiting on Aron

- **Domain decision** — blocker 1.
- **Update the Git remote URL.** GitHub reports the repository has moved to `https://github.com/ArxnAlley/client_BluegridLandSolutions.git`. Pushes currently succeed **via redirect only**, which breaks if anyone creates a new repo under the old name. One command: `git remote set-url origin https://github.com/ArxnAlley/client_BluegridLandSolutions.git`. This was requested and then superseded by other work; it is still outstanding.
- **A browser pass** on phone / tablet / desktop.
- **One real end-to-end lead submission** from the live site.
- **Confirm the nav decision.** The 2026-08-04 brief spelled the resulting order out as four items, which excluded *Before & After*, so it was removed from the primary nav. It stays reachable from the homepage hero CTA and the footer Quick Links. **If a five-item nav was intended, restoring it is a one-line change** — and note the "Our Company" work below adds a fifth item of its own.
- **Decide whether to delete `phase2a-lead-capture`.** It is fully merged into `main`; it was kept deliberately.
- **Redeploy discipline:** always *Deploy → Manage deployments → edit → New version*. A **new deployment** mints a different URL and silently breaks all 23 forms.

---

## Planned Next Session — NOT IMPLEMENTED

Both items below are specified and approved. **Neither exists in the repository.** Do not describe them as done.

### A. "Our Company" navigation

Add a primary nav item — **"Our Company"**, not a generic "About". Target order:

```
Services · Service Areas · FAQ · Our Company · Insights
```

**It must use the existing shared mega-menu system** (`.megaPanel` / `.megaFeature` / `.megaBody` / `.megaRow` / `.megaGroup`). Do not create a fourth panel architecture.

Likely panel content — *About BlueGrid · Why Choose BlueGrid · How It Works · Areas We Serve · Our Work · Questions & Answers*. Several of these already have homes on the site and should link there rather than duplicating.

**Use verified company information only.** Do not invent history, credentials, awards, certifications, years of experience, or crew size. What is not confirmed by Chase does not go on the page — see *Waiting on Client*.

A dedicated company page may be created using the existing interior-page system (one level deep, so it inherits the proven one-level chrome).

**Header impact — measured at closeout, from the real font metrics:**

| | Header needs | |
|---|---|---|
| Full spacing (>1280px) today | 1080px | |
| Full spacing with "Our Company" | **1236px** | fine — full spacing only applies above 1280px |
| Compact band (≤1280px) today | 988px | |
| Compact band with "Our Company" | **1131px** | |

Slack at the current 1150px switch, compact tokens, with the new item:

```
  1280px   +149px  fits
  1200px    +69px  fits
  1151px    +20px  fits, but barely
  1100px    -31px  WRAPS
```

It fits at 1151px with **20px** to spare. The breakpoint was originally tuned to leave ~45px so the wider `'Segoe UI'` fallback could not wrap the bar before Inter loads. **20px is below that margin — expect to move the mobile switch to roughly 1200px.** The header must never wrap; move the breakpoint rather than crushing the nav. Re-run `validateHeader` after any change.

### B. Process animation refinement

**The visual design is approved and must not be redesigned** — floating dark rectangle, five steps, four arrowheads, CTA below.

**Current behaviour:** the whole sequence completes, holds 2.6s, then resets and replays the entire thing, looping forever.

**Desired behaviour — two phases:**

**Phase A — run once.** On the section's first meaningful entry into the viewport:

```
Step 1 → Arrow 1 flash/dim → Step 2 → Arrow 2 flash/dim → Step 3
      → Arrow 3 flash/dim → Step 4 → Arrow 4 flash/dim → Step 5
```

After Step 5, **all five steps remain visible for the rest of the page view. They never reset or replay.**

**Phase B — arrows only, continuously.**

```
Arrow 1 flash/dim → Arrow 2 → Arrow 3 → Arrow 4 → short pause → repeat
```

Only the arrows loop. Steps stay stationary and visible.

`prefers-reduced-motion` must still show everything immediately with no sequence and no timers.

Implementation lives in `js/indexJS.js` — `processSequenceConfig`, `initializeProcessSequences()`, `setupProcessBoard()`. The `resetBoard()` call and the `holdThenRestart()` beat are what change; the reveal and flash beats stay. `validateProcessSequence` in the scratchpad asserts the *current* looping order and **will need its expectations rewritten** to the two-phase model.

### B2. Known responsive defect — process board clipping

**Reported:** at narrower desktop/tablet widths the process rectangle extends or clamps past the viewport and **steps 4–5 disappear offscreen.**

What is established:

- The horizontal 5-across layout applies from **1081px up**; at ≤1080px the board goes vertical. So the suspect band is **1081–1280px**.
- `html { overflow-x: hidden }` is set sitewide, so horizontal overflow is **clipped rather than scrolled** — which matches "disappear offscreen" rather than producing a scrollbar.
- Measured pressure point: `.processStepTitle` is uppercase display face at 1.2rem. The longest unbreakable word on any page is **"MAINTENANCE" at 143px** (`Clear and Talk Maintenance`, a service page). At a 1081px viewport each step's text column is **147px** — **4px of clearance**, and the Rokkitt fallback is Georgia, which is wider.

**Honest caveat:** the arithmetic above does **not** reproduce the reported clipping — by calculation the board fits at every width in the band. Something in the real render is not in the model. **Reproduce it in a browser first**, at several widths between 1081 and 1280 and on both a 5-step page (homepage) and a 4-step page (any service page), before changing layout.

**Fix the layout.** Do not hide the overflow, and do not shrink everything into unreadability.

---

# NEXT SESSION SHOULD START HERE

1. **Read `CLAUDE.md`, then this file, then `engineeringJournal.md` and `technicalDebt.md`.** The repository is authoritative — correct stale documentation rather than carrying it forward.
2. **Verify current Git/repository state** — branch, HEAD, `main` vs `origin/main`, remote URL, working tree, page count. Expect `main`, clean, and **1 ahead of `origin/main`** — the unpushed commit is this closeout's docs-only compaction, whose parent `9237e53` is the last content commit. Push it or fold it in, as you prefer.
3. **Implement "Our Company"** (planned work A) using the **existing shared mega-menu system**. Verified company facts only.
4. **Recalculate header fit and move the breakpoint** after adding the fifth nav item. Measured slack at 1151px is only +20px against a ~45px design margin; plan on moving the mobile switch to about 1200px. The header must never wrap.
5. **Refactor the process animation** (planned work B) into a one-time step reveal followed by a permanent arrow-only loop. Steps never reset once revealed.
6. **Fix the responsive process clipping** (B2) — reproduce it in a browser first; fix the layout, not the symptom.
7. **Run the established validation/fix loop** — `validateSite`, `validateNav`, `validateHeader`, `validateHero`, `validateLeadFlow`, `validateMegaMenus`, `validateProcessSequence`, `heroLoopHarness`, the Apps Script harness, `node --check`, CSS brace balance. `validateProcessSequence` and `validateHeader` both need their expectations updated as part of this work, not silently relaxed.

Do not start the *Remaining Launch Work* items 2–5 until the domain is settled — they would all be done twice.
