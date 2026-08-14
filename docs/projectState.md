# Project State — BlueGrid Land Solutions

**Last updated:** 2026-08-13 (P0 SEO implementation)
**Repository:** `c:/Dev/NuloWorkspace/ClientSites/client_BluegridLandSolutions/`
**Branch:** `main`
**Last content commit:** `4b3df59` — SEO: implement BlueGrid launch search strategy
**HEAD:** `4b3df59`. This session produced four commits: `18c8845` (lead pipeline), `9990055` (docs), `8fadfe0` (image-reference repair), `4b3df59` (P0 SEO).
**Remote:** `origin` → `https://github.com/ArxnAlley/client_BluegridLandSolutions.git` — **current, verified via `git remote -v`.** The old stale-URL debt (item 10h) is resolved; someone corrected it outside any session recorded here.
**Sync:** **0 behind / 5 ahead**, verified this closeout with `git rev-list --left-right --count origin/main...HEAD`. The five unpushed commits are `afb7868` (previous closeout) plus this session's four. Nothing has been pushed, per instruction. Re-verify with that command rather than trusting this line — `origin/main` has moved without a session recording it before.
**Working tree:** clean

> Source of truth for resuming work. Only verified, completed work is recorded here.
> Read this file first. `engineeringJournal.md` has the reasoning; `technicalDebt.md` has what is knowingly deferred.
> **The last section of this file is where the next session starts.**

**Scope note:** BlueGrid is a Nulo Studio *website + lead-capture* client. It receives the static site, the Google Apps Script lead pipeline, and the reusable front-end systems described below. It does **not** receive NuloOS, the NuloEdge dashboard shell, or any platform product.

---

## Current Phase

**Between phases. Nothing is half-finished and the working tree is clean.**

**The lead pipeline is finished in the repository and not yet deployed.** The Apps Script project is a separately pasted copy (`appsScript/README.md`), so none of this session's backend work is live until someone pastes it and redeploys. Until then the production endpoint still runs the pre-split code, which cannot store a photo and knows nothing about `referenceId`. **The website must not be published ahead of that redeploy** — see *Waiting on Aron*.

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
| Process section — dark board, arrowheads, sequenced reveal | Complete |
| Mega menu design system — all four panels | Complete |
| Merge to `main` + push | Complete |
| Repository / GBP asset housekeeping | Complete |
| **Our Company nav item + mega panel** | **Complete** |
| **Company page (`company/index.html`)** | **Complete** |
| **Process animation — two-phase (reveal once, arrows loop)** | **Complete** |
| **Process responsive handover + header breakpoints** | **Complete** |
| **Primary logo migration** | **Complete** |
| **Site-wide copy cleanup (dashes, spelling)** | **Complete** |
| **On-page SEO sweep (headings, intent map, schema)** | **Complete** |
| **Mobile floating CTA — bottom edge clipping** | **Complete** |
| **Estimate CTA arrival fix + notification config restore** | Complete, **superseded same day** — see below |
| **Estimate CTAs open the modal directly** | **Complete** |
| **Project photos renamed with locations + references repaired** | **Complete** |
| **Live end-to-end lead test** (Aron, test recipient) | Partial — surfaced the photo defect; needs rerunning after the redeploy |
| **Session closeout SOP** (`docs/sessionCloseout.md`, gitignored) | **Complete** |
| **Photo storage — Drive upload, links in the Sheet and owner email** | **Complete in repo, not deployed** |
| **Lead identifier split — internal `leadId` + customer `referenceId`** | **Complete in repo, not deployed** |
| **P0 SEO — service-area hub, 3 verified-proof town pages, robots, sitemap** | **Complete** |

**Two launch blockers now: the Apps Script redeploy, and the production domain.**

---

## Overall Objective

Take the BlueGrid Land Solutions website from "built but not launchable" to production launch:

1. ~~Repair missing functionality and broken navigation~~ — done
2. ~~Complete missing content (service pages, service area pages)~~ — done for the first wave
3. ~~Wire lead capture end to end (website → Apps Script → Sheet → owner email)~~ — done; verified live 2026-08-13, then rebuilt the same day to store photos and split the identifiers. **Awaiting redeploy and a fresh end-to-end test.**
4. Final SEO, performance, and launch validation — **blocked on the domain**

---

## Current Repository Status

**112 tracked files. 28 HTML pages.** (Counted with `git ls-files` at this session's commit.)

```
index.html                  homepage
company/index.html          company page — who/what/why/how/where + proof
faq/index.html              FAQ hub — 28 questions, 6 categories
services/          (7)      forestryMulching, landClearing, brushRemoval,
                            trailCutting, stormCleanup, propertyCleanup,
                            huntingPropertyPrep
locations/        (10)      index.html (service-area hub) +
                            forestry-mulching-{ashland-ky, portsmouth-oh,
                            ironton-oh, chillicothe-oh, grayson-ky, morehead-ky,
                            minford-oh, piketon-oh, jackson-oh}
insights/          (8)      index.html + 7 articles
appsScript/        (8 .gs)  Code, routes, leads, photoStorage, validation,
                            notifications, utilities, config
                            (+ README.md, localTestRunner.js)
css/                        styleIndex.css (homepage + shared systems),
                            stylePages.css (interior pages)
js/indexJS.js               single shared script for all 28 pages
.gitignore                  see GBP assets below
robots.txt, sitemap.xml     generated from the canonicals, never hand-edited
docs/                       this file, engineeringJournal.md, technicalDebt.md,
                            seoPlan.md, servicePageArchitecture.md,
                            forestryModuleSchema.md, googleSheetArchitecture.md,
                            heroDirection/, phasePrompts/
```

### Architecture facts a new session must know

- Static site, **no build step**, pure HTML/CSS/JS per `codeStyle.md`.
- Shared chrome (header, mega panels, mobile drawer, estimate modal, footer, floating actions) is **duplicated into every page** and kept in sync by guarded one-shot Node scripts run from a scratchpad. **Those scripts are deliberately not checked in** — Phase 13 (`docs/phasePrompts/phase13ServiceAreaExpansion.md`) owns the real generator. Every one of them refuses to write unless its guards pass; that habit has caught three separate classes of defect and should be kept.
- **Two path variants.** Root pages take the canonical href; every one-level folder takes `../` + href. The Services mega panel used to be the one exception (bare siblings inside `services/`) and that exception was retired on 2026-08-07, so all three panels spell paths the same way.
- **Put any new page one level deep** so it reuses the proven one-level chrome — that is why the FAQ page is `faq/index.html` and the company page is `company/index.html`.
- **Line endings are uniform, and the old note here was wrong.** Audited 2026-08-09: **all 26 source files are CRLF in the working tree and LF in the index.** `core.autocrlf` is `true`, so Git normalises on commit and converts on checkout — there is no mixture to preserve. The previous entry claimed `faq/*`, `locations/*`, `insights/*` and `css/stylePages.css` were LF on disk; they are not. Scripted edits should still detect and restore per file (every script here does — it is free and correct), and **validators that match on `\n` must still normalise first**, which remains a real bug that has bitten twice.
- The Apps Script endpoint lives in **exactly one place** — `businessConfig.estimateEndpoint` in `js/indexJS.js`. There are now **two** `fetch()` call sites (`leads.create` and `leads.addPhotos`) and both build their URL from that one constant, which `validateLeadFlow` asserts. Changing the deployment is still a one-line edit.

### Responsive breakpoints (current)

| Width | What changes |
|---|---|
| **≤1360px** | Header compact band — token overrides only (`--headerPadX`, `--headerGap`, `--headerNavGap`, `--headerNavLinkPadX`, …). `--headerCtaPadX` is pointedly absent: the primary CTA keeps its padding at every width. **1360px is `.headerInner`'s own `max-width`** — above it the inner is capped so available width never changes; below it every pixel of viewport is a pixel of header. |
| **≤1200px** | **Mobile nav switch.** `.primaryNav`, `.phoneChip` and `.headerCta` hide; hamburger appears. Header-only on purpose. |
| **≤1167px** | **Process board goes vertical.** Derived, not chosen: the board is `max-width: 1120px` inside `.sectionInner`'s 1.5rem padding, so 1168px is the narrowest viewport at which it can render at its design width. Its own query — nothing else lives here. |
| **≤1080px** | Section layouts — hero media band, services grid, intro, service-area and Facebook layouts. **No longer carries the process board.** |
| ≤640px, ≤360px | Progressive tightening. |

Header fit with the five-item nav, measured from the real font files: full spacing needs **1236px**, compact needs **1131px**. Tightest desktop width is **1201px** with **+70px** on Inter and **+11px** on a 6%-wider fallback face. Above 1360px the bar always clears by 124px.

Every header dimension is a `:root` custom property overridden in the two header queries, and all of them animate on a shared `--headerTransition` (`0.35s var(--easePremium)`), zeroed under `prefers-reduced-motion`.

### GBP marketing assets — decided 2026-08-07

- **`graphics/GBP - Services/` is intentionally local and ignored by Git** (`.gitignore:18`). It holds Google Business Profile marketing collateral — service tiles, post images — not website assets. The folder and its contents stay on disk; they are simply never offered to Git, now or for future GBP graphics dropped there.
- **`graphics/images/GBP_ForestryMulchingService.png` was intentionally removed** (commit `9237e53`). It had been swept into `235a4a3` by a broad `git add -A` rather than added deliberately: 2.6MB of repository for a file the site never loaded.
- **Verified at closeout:** zero references to `GBP_ForestryMulchingService` anywhere in the working tree, and the file is absent from `HEAD`.

---

## Verification State — all green at `4b3df59`, re-run at closeout

**13 validator suites, 116/116 Apps Script harness, `node --check` clean, 72 JSON-LD blocks parse.** Page counts below are 28 since the P0 SEO pass added four.

| Check | Result |
|---|---|
| Internal links & assets (`validateSite`) | **28 pages, zero broken** |
| **Local assets** (`validateAssets`, new 2026-08-13) | PASS — **284 references** resolve with **exact casing**: src/href, og:image and twitter:image `content`, srcset, inline and CSS `url()`, and the asset paths in `js/indexJS.js`. Catches case-only mismatches that `fs.existsSync` hides on Windows and that 404 on GitHub Pages |
| **Mobile floating CTA** (`validateFloatingCta`) | PASS — bar sizes to content at both breakpoints (61.44px / 59.44px), touch targets 46px and 44px, `env(safe-area-inset-*)` on all three insets, bar outside `<main>` and `<footer>` on 28 pages |
| **Estimate CTA routing** (`validateEstimateCtas`, rewritten) | PASS — 131 `a[href="#estimateForm"]` anchors all call `preventDefault()` + `openEstimateModal()`; modal Step 1 carries `modalFullName`/`modalPhone`/`modalServiceNeeded` on all 28 pages with the config.gs enum order; **`buildEstimatePayload()` verified to read from the modal's fields, not the mini-form's**; mini-form untouched; no duplicate ids |
| **Estimate flow, functionally** (`simulateEstimateFlow`, new) | PASS — real `js/indexJS.js` loaded into a mocked DOM and actually driven: a direct-CTA click opens the modal with `preventDefault` observed, Step 1 genuinely rejects an empty submission, a completed flow's captured (unsent) payload matches what was typed; a mini-form Continue pre-fills Step 1 and its payload matches the mini-form's values. 25 assertions; both this and the static check proven to catch the payload-source regression by injecting it first |
| **On-page SEO** (`validateSeo`) | PASS — 28 pages: exactly one non-empty H1 each, no skipped heading levels, 28 unique titles and descriptions within budget, canonicals and breadcrumbs present, per-page-kind schema, **every FAQ schema question rendered on its page**, alt coverage, descriptive anchors, no content orphans, **zero H1 intent collisions** |
| Navigation / mobile drawer / FAQ hub / Insights | PASS on all 28 pages |
| **Mega menu system** | PASS — 28 pages × 4 panels: one shell, every row on `.megaRow`, links resolving with the right relative form per depth, no duplicate ids, `aria-controls` intact, fit 1201–1600px, height spread **24%** against a 45% gate |
| **Process sequence** | PASS — 8 pages, two-phase: Phase A exact 13-beat order, max 1 arrow bright, **5 reveals in 120s with none repeated**, **0 un-reveals ever**; Phase B **25 passes each filling 1 → 1+2 → 1+2+3 → 1+2+3+4**, peaking at all four, holding 1400ms, clearing on one tick, **0 step events throughout**, fresh pass at arrow 1 on resume; reduced motion registers nothing |
| Header width sweep 900–1600px | PASS — zero wrapping; tightest desktop **1201px at +70px** slack, **+11px on the fallback face** |
| Hero seam geometry (5 viewports) | PASS — copy ends exactly on the seam, 24px card overlap |
| Hero before/after loop (10 min simulated) | PASS — **91 cycles alternating**, 6.16–7.01s cadence |
| Hero typing profile (5 min simulated) | PASS — rendered cadence equals scheduled cadence exactly; **0 characters swallowed**, **0ms** write-to-paint |
| Lead submission contract | PASS — one endpoint behind both call sites (`leads.create`, `leads.addPhotos`), payload matches schema on all 28 pages |
| Apps Script harness | **116/116**, `runSelfTest` 8/8 |
| **Photo storage + identifiers** (in the harness above) | PASS — sequential numbering with correct padding, a duplicate consuming no number, the legacy-id guard, upload idempotency, per-lead caps, MIME/size/reference gates, path separators stripped, real links in both email bodies, and a non-destructive, idempotent migration. Nine regressions injected one at a time, every one caught |
| **Photo upload, client side** (`simulateEstimateFlow` path C) | PASS — the real uploader driven against a mocked File: bytes transmitted, filed under the same referenceId as the lead, sent **before** `leads.create`, progress moving only as the upload resolves, and a retry re-uploading nothing |
| `node --check` (indexJS, localTestRunner) | clean |
| CSS brace balance | balanced in both stylesheets |

**All validation to date is static analysis or simulation.** No session on this project has ever had a browser. See `technicalDebt.md` item 4.

---

## Completed Work (verified)

### Lead capture — Phase 2A + 2D, live
- 8 Apps Script modules (`Code`, `routes`, `leads`, `photoStorage`, `validation`, `notifications`, `utilities`, `config`), 29-column `LEADS_HEADERS`, `errorLog` sheet, honeypot `companyWebsite`, server-side dedupe on `referenceId` (`BG-\d{13}`), sequential `leadId` allocated under `LockService`, formula-injection defence. **The column count and the dedupe key both changed on 2026-08-13** — see *Lead pipeline finalization* below.
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

All four panels — **Services**, **Service Areas**, **FAQ**, **Our Company** — are built from one shared architecture. Each of these is declared **once**, and `validateMegaMenus` asserts it:

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
- **Our Company** — featured *Built for the Land. Run by the Owner.*, then six rows in two labelled groups (*The Company* / *How We Work*). 414px tall against its siblings' 392/392/486.

**Any future mega menu must be built on these parts.** Adding an independent system is the specific thing this architecture exists to prevent — and Our Company is the proof it works: it needed **zero JavaScript** (`indexJS.js` drives `.navItem.hasMegaMenu` generically) and **zero new CSS rules**. The company row classes joined the existing services selector groups — `.megaServicesList, .megaCompanyList` and so on — so there is one declaration under two names and the two panels cannot drift apart.

### Process section — current state
A centred dark board (`.processBoard`, max-width 1120px) floating on the white section, steps inside it, **arrowheads only** between steps (no connecting rule), CTA below. Homepage runs 5 steps; the 7 service pages run 4. Nothing assumes a count — arrows are always steps − 1. Flex layout replaced a grid hardcoded to `repeat(5, 1fr)`, under which seven of the eight pages had been rendering with an empty fifth column.

**Animation — two phases, and the states only move forward:**

```
'idle'  ->  'revealing'  ->  'looping'
```

- **Phase A** runs **once per page view**, 6.08s at five steps: step reveals → arrow flashes → arrow dims → next step. The next step is revealed from *inside* its arrow's dim callback, so a step cannot appear before its arrow has finished. When it ends, every step is revealed and **stays revealed for the rest of the page view**.
- **Phase B** is arrows only, forever, and the highlight **accumulates** rather than travelling: arrow 1 lights and stays lit, then 1+2, then 1+2+3, then all four; a **1400ms hold** with the row full; then all four clear on a single tick; then a 900ms pause and it begins again. **3.56s per pass.** It cannot touch a step because it never references one.

  Accumulating rather than travelling is the point: the row fills and empties, which reads as the whole progression completing over and over, rather than as a single point chasing along it. Phase A is still a travelling flash — each arrow dims before the next step lands — so the two phases deliberately do not share a beat function.

There is no transition back to `'idle'`, which is what makes "Phase A runs once" a property of the machine rather than of its timing. `resetBoard()` is gone.

Phase A is deliberately **uninterruptible** once started — seven seconds, once, and stopping it half way would either lose the steps already up or replay them. Only Phase B answers to visibility: it pauses off screen and on a hidden tab, and resumes without disturbing a step. Reduced motion shows everything immediately and registers no observer and no timers.

**One trap worth knowing.** `.processArrow.isActive` and `.isResting` carry equal specificity, so an arrow holding both renders as whichever is declared later — `isResting`, meaning the arrow never appears to light at all. Exactly two functions touch those classes — `flashArrow()` for Phase A and `lightArrow()` for Phase B — and **both must remove one before adding the other**. Phase B lights arrows that are already resting, so a missing removal there would show up as a row that never brightens. Both files say so in comments, and the validator asserts the ordering in each function.

**Responsive:** horizontal five-across down to **1168px**, vertical below. That number is `1120px` (board `max-width`) + `2 × 1.5rem` (section padding) — the narrowest viewport at which the board can be the size it was designed at. See the note in `technicalDebt.md` on why the reported clipping never reproduced.

### Primary logo — migrated 2026-08-11

The header badge is **`graphics/logos/web/bluegridMark290.png`**, derived from the client's `circleBG_logo.png`. Chosen on measurement:

| Asset | Measured | Verdict |
|---|---|---|
| `circleBG_logo.png` | 290×290, **alpha mean 0.785** — that is π/4, a circle inscribed in a square, the same silhouette as the badge it replaces, transparent outside the circle | **Primary site logo.** Legible at 50–69px because it carries no arc tagline |
| `newBG_logo.png` | 1200×1200, **alpha mean 1.0 — fully opaque**, white corners, content only in the middle band | **Not the header.** It would render as a white box, and its tagline would land near 4px. Kept for white-background contexts: Open Graph, GBP, print |

76 references across 24 pages. Every rendered size is covered (header 50–69px, footer 120px, Facebook fallback 76px, post avatar 38px). Both marks are 1:1 and the rendered sizes are CSS-driven, so **the migration cannot shift layout**. One 45KB file replaces 215KB + 57KB.

**This retires the FORESTRV misspelling from the website** (was `technicalDebt` item 2). The typo exists only on the old badge's arc text, which the new mark does not have. The client's original badge files stay on disk. **Favicons are a different mark entirely** — a simplified tree circle, not the badge — and were correctly left alone.

### Copy cleanup — 2026-08-11

**447 em dashes across 24 pages** was the specific thing making the writing read as machine-generated. 440 rewritten by hand through 215 context-anchored rules, each replaced with the punctuation the sentence actually wanted: a period where the clause stands alone, a comma for an aside, a colon before a list. Sentences were rewritten where removing the dash left the grammar awkward.

**Deliberately preserved:** compound words (`owner-operated`, `side-by-side`, `right-of-way`, `two-track`), numeric ranges, and the single en dash in the `1–2 day` statistic, which is correct typography for a range. That en dash is the only one left on the site and its survival is a decision, not an oversight.

**The structured data had to move with the copy.** The FAQ answers and service descriptions exist twice — rendered and inside `application/ld+json`. The first pass protected every `<script>` block, which left schema disagreeing with visible copy, and **Google requires FAQPage answers to match the rendered text**. 61 further replacements were applied there, with every block re-parsed and its key set compared before writing.

Also corrected: **British spellings mixed inconsistently with American ones** on a US local business site (`organisation`, `mobilisation`, `favourite`, `neighbour`, `destabilising`, `tyres`, `smouldering`).

### On-page SEO — 2026-08-11

**The intent map now lives in `seoPlan.md`** and is the anti-cannibalisation contract: one page per intent, with terms deliberately assigned or deliberately unowned. `validateSeo` enforces it by stripping brand and geography from every H1 and failing if two pages collide.

**36 H2s** moved from brand flourishes to real topics, because the site's own Content Guideline 2 required it and the service pages were not following it. The voice was not lost: every one of those sections already carries a `.sectionKicker` above the heading, so the topic could move into the H2 without flattening the page.

**Four H1s fixed:**

- **Homepage.** The crawlable H1 was `Take Back` (the visible fixed word) plus `Take back your property.` (the screen-reader fallback) — duplicated, and carrying no service or geography. The fallback now completes the visible phrase rather than repeating it. **`aria-hidden` was tried first and rejected**: it removes text from the accessibility tree but *not* from indexing, so it fixed the wrong problem.
- **FAQ hub** — `Frequently Asked Questions` → `Forestry Mulching & Land Clearing FAQs`.
- **Company** — the brand line moved out of the H1 and stays where it earns its keep, in the Our Company mega panel.
- **Property Cleanup** — "Across the Ohio River Corridor" is a place, not a search.

**Three FAQPage schema questions did not match the rendered copy.** In all three the schema wording was the better search phrasing, so the rendered question moved to match the schema rather than the reverse.

**The company page was a content orphan** — reachable only from nav and footer, which passes no topical relevance. Three editorial links added from the homepage owner section, the FAQ hub intro, and the Insights lede.

### Mobile floating CTA — fixed 2026-08-11

The sticky Call Now / Free Estimate bar was cropped along its bottom edge on mobile. **The cause was a box-model contradiction, not a positioning or safe-area problem.**

`.mobileFloatingActions` declared a fixed `height` while also carrying padding and a border. `box-sizing` is `border-box` globally, so that height is the *outer* box:

| | Declared | Padding + border | Content box | Buttons | Overflow |
|---|---|---|---|---|---|
| ≤640px | 60px | 13.44 + 2 | **44.56px** | 46px | **1.44px** |
| ≤360px | 58px | 13.44 + 2 | **42.56px** | 44px | **1.44px** |

With `align-items: center` the surplus splits evenly, so each button sat **0.72px past the top and bottom** of the content box. The bar sets no `overflow`, so the buttons painted over its 1px border — and they are `border-radius: 999px` pills on a 24px-radius container, so at the bottom corners the pill edge crossed the border on a different curve. That is what read as the bottom edge and rounded corners being cropped.

**Fix: the fixed heights are gone and the bar derives its height from its content**, so the box and its buttons can never disagree again. The bar is now 61.44px and 59.44px, 1.44px taller than the values replaced, which is not a visible change.

**Deliberately unchanged:** the radius, the shadow, the colours, the scroll trigger, and the insets — `bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px))` and `left`/`right: max(1rem, env(safe-area-inset-*, 0px))` were already correct, which is why an arbitrary pixel offset would have hidden the real bug. Touch targets stay at 46px and 44px, both at or above the 44px minimum.

### Estimate CTA arrival + notification config restore — 2026-08-11, **superseded same day**

**"Get My Free Estimate" was reported as reading broken on the homepage — clicking it "only moves/slides slightly."** Audited all 227 estimate/quote-labeled anchors on 24 pages: every one resolves to the bare `#estimateForm` fragment, never cross-page, never path-prefixed. **This ruled out the routing bug the report assumed.** There is no separate "estimate page" — each page carries its own self-contained mini-form (`id="estimateForm"`) that opens the five-step modal on submit, which is the correct, already-consistent architecture.

**Root cause: the CTA and its target can already share one screen.** `.heroSection` is `min-height: 100svh`; `.estimateFormCard` sits inside that same section beside `.heroContent` in a two-column grid (`align-self: end` pins it low, near the CTA and the hero stats). On a typical desktop viewport both are already visible, so the browser's anchor scroll — completely correct — is a few pixels or zero.

**First fix: arrival feedback, not a redesign.** Every `a[href="#estimateForm"]` focused `#fullName` on click instead of scrolling further. **Real browser QA showed this was not the requested behavior** — see the next section for what replaced it.

**Separately: `appsScript/config.gs` held an uncommitted `DEFAULT_NOTIFICATION_EMAIL = 'admin@nulostudio.com'`.** `git log --all -p` shows only `Bluegridls@gmail.com` was ever committed — this was working-tree drift, not a shipped regression. `appsScript/localTestRunner.js`'s own guard (`no recipient anywhere is admin@nulostudio.com`) caught it the moment the harness ran. Reverted; the file now matches `HEAD` exactly. **The live Apps Script deployment is a separately pasted copy** (per `appsScript/README.md`) and is unaffected either way by this repo-side fix; normal submissions are governed by the Sheet's `notificationEmail`, confirmed at `Bluegridls@gmail.com`. This part of the fix stands — it was not superseded.

Debt recorded: `technicalDebt.md` item 10l — nothing currently stops this class of drift from being committed, since the toolchain that catches it (item 10i) lives outside the repo and has no pre-commit hook to run it.

### Estimate CTAs open the modal directly — 2026-08-11

**The scroll-and-focus fix above did not solve the reported problem.** The actual requirement: every true estimate CTA opens the modal directly, no anchor jump, no page movement at all.

**That could not be done safely as first specified.** Audited `openEstimateModal()` and the modal markup: its 5 steps never ask for Full Name, Phone, or Service Needed — only the mini-form does, and `buildEstimatePayload()` read them from the mini-form's own elements. `appsScript/config.gs` hard-requires all three server-side (`REQUIRED_CREATE_FIELDS`). Opening the modal directly with no way to enter them meant every submission through these CTAs would fail server-side validation, with the error pointing at fields the visitor was never shown — they live outside the modal. That is a direct conflict between "open the modal directly" and "preserve all existing... submission behavior" / "do not redesign anything," both explicitly required. Surfaced it and asked rather than guessing; the chosen resolution was to add the three fields to the modal.

**What shipped:** modal Step 1 gained `modalFullName` / `modalPhone` / `modalServiceNeeded` — same labels, same copy, same validators, same `serviceNeeded` enum order as the mini-form (checked against `appsScript/config.gs` before writing anything). The step heading, "Where's the property?", was left exactly as-is per instruction not to touch copy — recorded as a known trade-off in `technicalDebt.md` item 10m, not hidden. The mini-form is completely untouched — same fields, same ids, same validation, Continue still `type="submit"` — and now calls one new function, `copyMiniFormIntoModal()`, right before opening the modal, so "Continue... with the entered data" is literally true.

Every `a[href="#estimateForm"]` (131 anchors, one shared script) now calls `preventDefault()` + `openEstimateModal()`. **The change that mattered most:** `buildEstimatePayload()`, `validateModalStep(1)`, `buildReviewSummary()`, and `showSubmissionError()` were all repointed at the modal's own fields — leaving even one reading the mini-form's ids would have silently sent a blank name or phone for every direct-CTA visitor. `openEstimateModal()` itself is untouched: `currentModalStep` already starts at 1, and the existing "resume where you left off" behavior for a reopened, partially-filled modal was deliberately preserved rather than force-reset.

**Validated two ways.** `validateEstimateCtas.js` was rewritten (its prior version asserted the opposite architecture and would have passed a broken build). New `simulateEstimateFlow.js` goes further: it loads the real `js/indexJS.js` into a hand-built DOM mock and actually drives both the direct-CTA path and the mini-form-Continue path through to a captured, never-sent submission payload — 25 assertions against real execution, not string matching. Both were proven to have teeth by injecting the payload-source regression and confirming each caught it independently before restoring the file.

### Live lead test — reported by Aron, 2026-08-13

**Not independently verified by this session** — this repository has no access to the live Google Sheet, the test inbox, or the Apps Script execution log. Recorded as Aron reported it, because it is real project truth and drives the next session's priority, but flagged clearly as unverified-by-repo rather than confirmed.

Aron reports:
- A real submission through the live site reached the `BlueGrid Leads` Sheet.
- The owner notification reached the temporary test recipient (the Sheet's `config!notificationEmail` was pointed at a test address for this — see *Waiting on Aron* below for restoring it to Chase's address before any further real submissions).
- Lead field data (name, phone, service, etc.) arrived correctly in that notification.
- A photo was attached to the submission and its **filename** was recognized and reported in the notification — matching exactly what the code guarantees today (`appsScript/notifications.gs`: *"photos are not uploaded yet — reply or text the customer to request them"*). **The owner could not actually access the photo.** This is not a new defect; `photoUrls` has always stayed `[]` (`technicalDebt.md` item 24, pre-existing since Phase 1). The live test is what makes it a felt, urgent gap rather than a documented theoretical one — see the resume task below.

### Project photos renamed with locations — 2026-08-13

Aron renamed ten project photos in `graphics/images/` to carry their confirmed locations (Minford OH, Piketon OH, Jackson OH), which broke **75 references across 24 files**. All repaired.

**The mapping was established by content hash, not by name similarity** — each old name's blob in `HEAD` was hashed and matched byte-for-byte against a file on disk. All ten matched exactly. That mattered: `after.JPG`, `hero_after.jpg` and `afterForestryMulching_minfordOH.jpg` are three different photographs whose names all contain "after", and name-matching would eventually have repointed a reference at the wrong image.

Four files on disk match no blob in `HEAD` — they are **new photos**, not renames, and nothing references them. Documented as orphans in `technicalDebt.md` item 22 rather than placed on pages, since which photo belongs where is an editorial decision.

**Doc references were split by kind.** `heroSpecification.md` (names the hero source plates) and `technicalDebt.md` item 22 (names the orphan) are operational and were updated with a "renamed from" note. `engineeringJournal.md` and this file's own merge history describe *past* renames as narrative and were deliberately left alone — rewriting them would falsify the record.

**A new validator came out of it.** `validateAssets` covers three blind spots in `validateSite`: meta `content` image references (every location page's `og:image` is relative and was never checked), CSS/inline `url()`, and — the important one — **case-only mismatches**, which `fs.existsSync` hides on Windows and which 404 on GitHub Pages. This project has shipped that exact bug once before. 284 references now checked, up from roughly 90.

### Lead pipeline finalization — 2026-08-13

**Both defects the live test exposed are fixed in the repository. Neither is live.**

**Photos.** The root cause was worse than "upload not built": the browser held the files in memory and `simulateUploadProgress()` filled every progress bar to 100% on a timer, so the visitor watched photos "upload" that never left the page. Now each photo is downscaled client-side (1600px long edge, JPEG 0.82, EXIF orientation honoured) and POSTed to a new `leads.addPhotos` endpoint **before** `leads.create`, one request per photo so a weak rural connection loses one photo rather than the whole submission. Files land in `BlueGrid Lead Photos/<referenceId>/`, and the folder is relabelled `BG-0001 · Name · <referenceId>` once the row exists.

**`leads.create` reads that folder itself and never accepts photo URLs from the client** — otherwise a hand-crafted POST could put any link at all in front of the owner under his own website's name. The owner's email now carries a working link per photo plus one for the folder, and says plainly when an upload did not complete rather than implying the photos are somewhere.

**Identifiers.** `leadId` is now internal and sequential (`BG-0001`), assigned by the server inside the `LockService` section that already serialises writes, and **after** the dedupe check — so a retry returns the original row and consumes no number. `referenceId` is the long client-minted id, now the sole dedupe key, and the only one a customer ever sees. Both columns were appended after `lastUpdated` per the append-only rule, which is why `referenceId` sits in column AB rather than beside `leadId`.

The next number is derived from the sheet rather than a stored counter, which means **clearing the test rows before launch is the entire reset** — there is no counter to remember. A guard in `parseLeadNumber()` ignores legacy 13-digit ids so one unmigrated row cannot send the next lead to `BG-1786635839699`.

**Migration.** `previewLeadIdentifierMigration()` reports the plan and writes nothing; `migrateLeadIdentifiers()` applies it. Both share one planning function so they cannot disagree. No rows are deleted, no columns removed, no other cell touched, and running it twice is a no-op. Rows it cannot interpret are reported rather than guessed at. Nothing destructive is automated — the pre-launch reset is documented as manual steps in `appsScript/README.md`.

**Validated:** 12/12 validator suites and **116/116** Apps Script harness checks, with nine backend and three client regressions injected one at a time and every one confirmed caught. None of it has been seen in a browser — `technicalDebt.md` item 4g is now the largest untested-by-eye item on the site.

### Session closeout SOP

Created `docs/sessionCloseout.md` — a local, gitignored workflow document instructing any future session how to close out cleanly (inspect real repo state, update the three continuity docs, run validation, commit locally, never push automatically, hand off a compact summary). Verified four ways before writing anything else: `git status --short` does not list it, `git ls-files --error-unmatch` confirms it was never tracked, `git check-ignore -v` resolves it to the new `.gitignore` rule, and `git status --ignored` shows it with the `!!` (ignored) marker. Nothing needed removing from tracking — it was never added.

### Merge, push, and housekeeping
`phase2a-lead-capture` merged into `main` as a clean **fast-forward** (`8108f94..bc4021d`), 17 commits, 42 files, 52,050 insertions, **zero deletions**; the single rename is the Phase 2C `hero_after.JPG → after.JPG` casing fix. Full validation re-run on `main` after the merge — 12/12. Pushed `main → origin/main`. The feature branch was **not deleted** and still exists at `bc4021d`, 8 ahead of `origin/phase2a-lead-capture`. Then the GBP housekeeping commit `9237e53`.

---

## Currently In Progress

**Nothing in the repository.** Working tree clean, all validators pass, `main` 5 ahead of `origin/main` and unpushed per instruction.

**One thing outside it:** the lead pipeline is finished in code and **not deployed**. The live Apps Script still runs the pre-split version. That is the next action, and it is Aron's to take — see *Waiting on Aron*.

---

## Remaining Launch Work (priority order)

1. **Deploy the new Apps Script and retest end to end.** The repo-side work is done; the deployment is a separately pasted copy and nothing reaches production without it. Exact steps in *Waiting on Aron* below and in `appsScript/README.md`. **The website must not go live ahead of this** — the current site sends `referenceId`, which the deployed script would file as a stray field, and it would POST photos to an endpoint that does not exist.
2. **Restore `config!notificationEmail` to Chase's address.** Temporarily pointed at a test recipient for the live test; no repo-level record of whether it has been restored. Verify before any further real submissions.
3. **Settle the production domain** — blocks 5–8 below. Canonicals say `https://www.bluegridlandsolutions.com/`; `CNAME` says `bluegridlandsolutions.nulostudio.com`.
4. **Page-by-page copy and browser QA.** No session has ever had a browser. Largest untested-by-eye items: **the photo uploader on a real phone over a real connection (`technicalDebt.md` item 4g — new, and the biggest of them)**, the three mega panels side by side, the process section, the hero typing, the process board on tablet, the estimate modal's new Step 1 (five fields under a heading that still says "Where's the property?" — item 10m).
5. ~~**`robots.txt`**~~ — **created 2026-08-13.** Allows everything; there is no admin area or staging path to exclude. Carries a TODO on the sitemap origin.
6. ~~**`sitemap.xml`**~~ — **created 2026-08-13, 28 URLs.** Generated from the canonical tag on each page by a scratchpad script, so the two cannot drift. Regenerate rather than hand-edit after the domain sweep.
7. **Canonical URL finalization** — 28 pages, every one `TODO:`-marked so a single sweep catches them. `sitemap.xml` and `robots.txt` regenerate from the canonicals afterwards; do not hand-edit either.
8. **Open Graph finalization** — same 28 pages; `og:url` and `og:image` must become absolute.
9. **Competitor and search-intent research**, feeding into **final SEO implementation** on top of the intent map already in `seoPlan.md`.
10. **Chase review / major revision pass** — the first time the client sees the site as a whole, after the pipeline and copy are solid. Expect a real round of change requests, not a formality.
11. **Search Console** — property verification and sitemap submission, after 3, 5, 6.
12. **Lighthouse mobile + desktop** — hero images are full-resolution `2048×1536` with no `srcset`; Google Fonts loads render-blocking.
13. **Production deployment**, then **production performance / analytics / Search Console testing** against the live domain.
14. **Final production lead test, with Chase restored as the recipient** — the real go-live confirmation, after everything above.
15. **Location pages rows 7–11** — Jackson OH, Gallipolis OH, Waverly OH, Greenup KY, Louisa KY. Build to the shipped six, not a template.
16. **Decide West Union, OH and Flatwoods, KY** — advertised in the nav but absent from `seoPlan.md`'s 11-city table.
17. **Google Business Profile** — none exists. `docs/phasePrompts/phase6GoogleBusinessProfile.md` holds the playbook. Marketing artwork is already being staged locally in `graphics/GBP - Services/`.

---

## Current Blockers

| # | Blocker | Impact |
|---|---|---|
| 1 | **The new Apps Script is not deployed** | The repo and production disagree: production cannot store a photo and does not know `referenceId`. Publishing the website before the redeploy would break photo upload outright. Aron's action — see below. |
| 2 | **`config!notificationEmail` may still point at a test address** | Unverifiable from this repo. If not restored, a real customer submission would not reach Chase. |
| 3 | **Production domain undecided** | Gates canonicals and OG URLs across 28 pages, the origin baked into `robots.txt` and `sitemap.xml`, and Search Console. |
| 4 | `MODULE_API_KEY` state unknown | Cannot be checked from outside — `leads.list` returns `UNAUTHORIZED` whether the key is unset or merely not supplied. Blocks only a future dashboard, never the public form. |

---

## Deployment Handover — the exact live steps

**Everything below happens in Google, by hand. No session can do any of it, and nothing in the repo is live until it is done.** Full detail in `appsScript/README.md`; this is the ordered summary.

**Order matters: Apps Script first, website second.** The new site posts `referenceId` and uploads photos to `leads.addPhotos`. Against the old deployment, photo upload would 404 and dedupe would silently stop working on retries. The old site against the new deployment is fine — `leadId` is read as a `referenceId` fallback precisely so that window is safe.

1. **Paste the code.** Eight `.gs` files now, not seven — `photoStorage.gs` is new. Create it in the editor and paste the others over their existing contents.
2. **Redeploy correctly.** *Deploy → Manage deployments → pencil → Version: New version → Deploy.* **Never "New deployment"** — that mints a different URL and silently breaks all 28 forms.
3. **Run `setupSpreadsheet`.** Appends the two new headers and seeds `photoAccess`. Existing rows are untouched. Authorize the new Drive scope when prompted — the script now writes files, which it did not before.
4. **Run `previewLeadIdentifierMigration`,** read the Execution log, and confirm the plan looks right. It writes nothing.
5. **Run `migrateLeadIdentifiers`** to apply it. Safe to run twice.
6. **Run `runSelfTest`.** Expect eight PASS lines, including the two new ones (`identifiers`, `dedupe keeps leadId`).
7. **Confirm `config!notificationEmail`** is the address you actually want the next test to reach.
8. **Publish the website** (`js/indexJS.js` is the only file that changed).
9. **Submit a real lead with two photos** and confirm: a row with a sequential `leadId` and a long `referenceId`; photo links in the sheet and in the owner email that actually open the images; the auto-reply quoting the `referenceId` and never the sequential number; `errorLog` still empty.

**Then, before launch — starting real leads at `BG-0001`:** delete the test data rows from `leads` (the rows, not their contents, and never row 1), optionally clear `errorLog` and the test folders under `BlueGrid Lead Photos`, and confirm `notificationEmail` is Chase's address. **Sequential numbering derives from the sheet, so deleting the rows is the whole reset — there is no counter to clear.** Nothing in the code does this automatically, deliberately.

---

## Waiting on Client (Chase)

- **Price ranges.** `seoPlan.md` calls cost transparency the biggest opening in this trade. No page quotes a dollar figure because none has been approved. **Rough per-acre or per-day ranges are the single highest-value upgrade available to the location pages** and cost one conversation.
- **Confirm Rowan County / Morehead coverage.** If Chase does not work Rowan County, the Morehead page and all four data entries come back out.
- **Real project photos** — ideally before/after pairs per service, tagged by location. Would unlock galleries on all 6 location pages and replace the Insights placeholders.
- **Owner introduction video** — section is built and video-ready; two config fields.
- **Badge artwork typo** — the official badge reads **"FORESTRV"**, not "FORESTRY". Off the website since 2026-08-11 (`technicalDebt.md` item 2); still wrong on any print/signage that uses the old artwork.
- **Confirm phone** `(740) 464-2526` and **business email** `estimates@bluegridlandsolutions.com` — both placeholders.
- **Confirm the Facebook page renders in the Page Plugin** → flip `facebookPageConfigured`.
- **Google Business Profile** — does not exist; the footer icon is hidden at runtime.
- **May we name Chase on the site?** Copy says "the owner" throughout.
- **Company facts worth adding, now that there is a page to hold them.** `company/index.html` ships using only claims that already appear elsewhere on the site. **Nothing about history, credentials, awards, certifications, years in business, or crew size is on it, and none may be added without Chase confirming it.**
- **Copy review** of the 6 location pages and 7 Insights articles.
- **The Chase review / major revision pass itself** — see *Remaining Launch Work* item 10. Expect this to generate its own list.

## Waiting on Aron

- **Deploy the new Apps Script and run the migration** — the nine ordered steps in *Deployment Handover* above. This is the single thing standing between the finished code and a working pipeline.
- **Decide `photoAccess` if the default misbehaves.** It defaults to `ownerEmail`, which shares each lead's photo folder view-only with `notificationEmail`. If Chase opens a link and hits a permission wall, change that one config cell to `anyoneWithLink` — no redeploy. `technicalDebt.md` item 24d.
- **Restore `config!notificationEmail` to Chase's address** and confirm it — see Blocker 2.
- **Get four claims confirmed or corrected by Chase** — see `technicalDebt.md` item 3a, which lists exactly what his own advertising does and does not support. The two that need him: whether he can commit to any estimate turnaround (the site's remaining hedged "most quotes within 24 hours" instances rest on nothing), and whether "we send a certificate of insurance before the machine leaves the shop" is accurate. Also still outstanding: the business email `estimates@bluegridlandsolutions.com`, which appears on no artwork and may route nowhere.
- **Domain decision** — Blocker 3.
- **A browser pass** on phone / tablet / desktop — see *Remaining Launch Work* item 4.
- **Confirm the nav decision.** The 2026-08-04 brief spelled the resulting order out as four items, which excluded *Before & After*, so it was removed from the primary nav. It stays reachable from the homepage hero CTA and the footer Quick Links. **If a five-item nav was intended, restoring it is a one-line change** — the "Our Company" item already added a fifth.
- **Decide whether to delete `phase2a-lead-capture`.** It is fully merged into `main`; it was kept deliberately.
- **Redeploy discipline:** always *Deploy → Manage deployments → edit → New version*. A **new deployment** mints a different URL and silently breaks all 28 forms.

---

## Planned Next Session

**Depends on two answers: has the Apps Script been deployed, and has the domain been settled?**

- **If Aron has deployed and retested the pipeline:** act on what the real submission showed. Expect at least one thing to need adjusting on a real device — photo orientation, upload time on a weak connection, or Drive link permissions (item 24d) are the three most likely, and all three are cheap to change.
- **If the domain is settled:** run the domain sweep. It is one pass over 28 pages of `TODO:`-marked canonicals and `og:url`/`og:image`, then **regenerate `robots.txt` and `sitemap.xml` rather than hand-editing them** — the sitemap is generated from the canonicals precisely so the two cannot drift.
- **If neither:** the self-contained work is the tree/brush clearing page (debt item 3b — first-party supported by Chase's own advertising, and the only advertised service with no page), the duplicate FAQ question (item 10a), Step 1's heading (item 10m), or mega-menu current-page highlighting (item 19).

**Do not re-implement the photo, identifier, or P0 SEO work.** All three are complete in the repository. If something looks wrong, it is either a deployment step that has not run or a real defect found on a device — diagnose which before changing code.

# NEXT SESSION SHOULD START HERE

1. **Read `CLAUDE.md`, then this file, then `engineeringJournal.md` and `technicalDebt.md`.** The repository is authoritative — correct stale documentation rather than carrying it forward. Multiple prior sessions have found this file's own header stale (commit hash, ahead/behind count, remote URL) within a day of being written; verify everything in the header block against `git` directly rather than trusting it.
2. **Verify current Git/repository state** — branch, HEAD, `main` vs `origin/main` (check both directions; `origin/main` moved without a session recording it once already), remote URL, working tree, page count. Expect `main`, clean, **24 pages**. **Also run `git status` before trusting any hardcoded config value in `appsScript/`** — item 10l found one file with an uncommitted, undocumented edit sitting in the working tree.
3. **The validator toolchain is not in the repository.** It lives in a scratchpad and has been carried forward by hand between sessions. It is `validateSite`, `validateNav`, `validateHeader`, `validateHero`, `validateLeadFlow`, `validateMegaMenus`, `validateProcessSequence`, `validateSeo`, `validateFloatingCta`, `validateEstimateCtas`, `simulateEstimateFlow`, `heroLoopHarness`, `validateAssets` — **thirteen suites**, named so the count in this line can be checked against the list rather than trusted on its own — plus `measureHeader`, `measureProcessFit`, the guarded assemblers, and the copy-rewrite tables. The Apps Script harness (`appsScript/localTestRunner.js`, **116 checks**) is committed and separate from all of this. **Locate the scratchpad toolchain before starting work, and re-run all thirteen suites plus the Apps Script harness to establish a baseline before changing anything.** `validateLeadFlow` and `simulateEstimateFlow` were both rewritten on 2026-08-13 for the new contract; an older copy would assert the pre-split architecture and pass a broken build.
4. **Ask whether the Apps Script has been deployed** before planning anything that touches the pipeline. The repo and production genuinely disagree until it has, and *Planned Next Session* above branches on the answer.
5. **`docs/sessionCloseout.md` exists locally and is gitignored — do not commit it, and do not recreate it if it's already there.**
6. **Do not start Remaining Launch Work items below the deployment until the domain is settled** — several would be done twice otherwise.
