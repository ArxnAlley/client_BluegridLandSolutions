# Project State — BlueGrid Land Solutions

**Last updated:** 2026-08-15 (production acceptance + upload security closeout)
**Repository:** `c:/Dev/NuloWorkspace/ClientSites/client_BluegridLandSolutions/`
**Branch:** `main`
**Remote:** `origin` → `https://github.com/ArxnAlley/client_BluegridLandSolutions.git`
**Sync:** the previous session's work was committed **and pushed** during the production-domain deployment. Commit hashes recorded before 2026-08-15 no longer resolve — history was rewritten at some point in that deployment, so `4b3df59`, `18c8845`, `9990055` and `8fadfe0` are stale references. Re-derive with `git log`, never trust a hash quoted here.
**Working tree:** clean at the start of this session; this session's changes committed locally and **not pushed**.

## THE SITE IS LIVE

`bluegridlandsolutions.com` is serving, the Apps Script is deployed, and the
full estimate-with-photos path has been **verified end to end in production by
a public visitor in an incognito browser** — see the 2026-08-15 journal entry.
Several older sections below still describe the pre-launch world; where this
header and a later section disagree, this header is right.

> Source of truth for resuming work. Only verified, completed work is recorded here.
> Read this file first. `engineeringJournal.md` has the reasoning; `technicalDebt.md` has what is knowingly deferred.
> **The last section of this file is where the next session starts.**

**Scope note:** BlueGrid is a Nulo Studio *website + lead-capture* client. It receives the static site, the Google Apps Script lead pipeline, and the reusable front-end systems described below. It does **not** receive NuloOS, the NuloEdge dashboard shell, or any platform product.

---

## Current Phase

**LAUNCHED. Between phases, working tree clean.**

`bluegridlandsolutions.com` is live, the Apps Script is deployed, and the full estimate-with-photos path was verified in production on 2026-08-15 by a public visitor in an incognito browser.

**The repository is one Apps Script version ahead of production.** `config.gs` and `validation.gs` narrowed the accepted photo formats to JPEG/PNG/WebP after that deployment. Not a vulnerability — production runs the safe superset minus one format — but the two disagree until Aron pastes and redeploys. See *Waiting on Aron*.

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
| **Live end-to-end lead test** (Aron, test recipient) | Superseded by the production acceptance test below |
| **Session closeout SOP** (`docs/sessionCloseout.md`, gitignored) | **Complete** |
| **Photo storage — Drive upload, links in the Sheet and owner email** | **Complete and verified in production** |
| **Lead identifier split — internal `leadId` + customer `referenceId`** | **Complete and verified in production** |
| **P0 SEO — service-area hub, 3 verified-proof town pages, robots, sitemap** | **Complete** |

| **Drive access — `rootInherited`, root-folder Viewer inheritance** | **Complete; boundary verified from an external Google account** |
| **Photo upload hardening — content signatures, caps, throttle** | **Complete in repo; production one version behind** |
| **Production launch + public acceptance test** | **Complete 2026-08-15** |

**No launch blockers remain.** The open P0 is a configuration check Aron must make in the Google Sheet — see *Waiting on Aron*.

---

## Overall Objective

Take the BlueGrid Land Solutions website from "built but not launchable" to production launch:

1. ~~Repair missing functionality and broken navigation~~ — done
2. ~~Complete missing content (service pages, service area pages)~~ — done for the first wave
3. ~~Wire lead capture end to end (website → Apps Script → Sheet → owner email)~~ — done, and **verified in production 2026-08-15** with five photos from an incognito public submission.
4. Final SEO, performance, and launch validation — **domain settled; `og:image` and Search Console still outstanding.** See *NEXT SESSION SHOULD START HERE*.

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

## Verification State — all green at `c4cef24`, re-run at this closeout

**14 validator suites, 178/178 Apps Script harness, `runSelfTest` 9/9, `node --check` clean, 72 JSON-LD blocks parse.** Page counts below are 28.

**Two additions since the table below was written:** `validateFollowTheWork` (layout arithmetic against real Inter metrics) and `validateFrontendPhotoPolicy` (drives the shipped `addPhotoFiles()` in a mocked DOM). A **23-check upload security audit** also runs against `doPost` directly — see the 2026-08-15 journal entry.

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
| Apps Script harness | **178/178**, `runSelfTest` 9/9 — deterministic over 10 consecutive runs after the `formatDate` mock fix |
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

**Validated at the time (2026-08-13):** 12/12 validator suites and 116/116 Apps Script harness checks, with nine backend and three client regressions injected one at a time and every one confirmed caught. **Current counts are 14 suites and 178 harness checks** — see *Verification State*. The photo path has since been exercised in production; `technicalDebt.md` item 4g is narrower than it was but most page layout still has not been seen in a browser.

### Session closeout SOP

Created `docs/sessionCloseout.md` — a local, gitignored workflow document instructing any future session how to close out cleanly (inspect real repo state, update the three continuity docs, run validation, commit locally, never push automatically, hand off a compact summary). Verified four ways before writing anything else: `git status --short` does not list it, `git ls-files --error-unmatch` confirms it was never tracked, `git check-ignore -v` resolves it to the new `.gitignore` rule, and `git status --ignored` shows it with the `!!` (ignored) marker. Nothing needed removing from tracking — it was never added.

### Merge, push, and housekeeping
`phase2a-lead-capture` merged into `main` as a clean **fast-forward** (`8108f94..bc4021d`), 17 commits, 42 files, 52,050 insertions, **zero deletions**; the single rename is the Phase 2C `hero_after.JPG → after.JPG` casing fix. Full validation re-run on `main` after the merge — 12/12. Pushed `main → origin/main`. The feature branch was **not deleted** and still exists at `bc4021d`, 8 ahead of `origin/phase2a-lead-capture`. Then the GBP housekeeping commit `9237e53`.

---

## Currently In Progress

**Nothing in the repository.** Working tree clean, all 14 validator suites pass, Apps Script harness 178/178. `main` is **1 ahead of `origin/main`** (commit `c4cef24`) and unpushed — Aron has not authorized a push.

**One thing outside it:** production runs the previous Apps Script version. See *Waiting on Aron*.

---

## Remaining Launch Work (priority order)

**Rewritten 2026-08-15. Items 1, 3, 5, 6 and 13 of the old list are done — the site is live and the pipeline is verified in production.**

1. **Aron's P0 config check** — `notificationEmail` and `photoViewerEmail` must both name the real accounts. See *Waiting on Aron*.
2. **Paste `config.gs` + `validation.gs`, deploy a new Apps Script version**, and redeploy the website so both halves agree on the format policy.
3. **`og:image` absolute-URL sweep** — still relative on all 28 pages, so Facebook link previews render without an image. `technicalDebt.md` item 12. **Highest-value self-contained work available.**
4. **Delete the stale `TODO: Replace canonical` / `TODO: Swap og:url` comments** on all 28 pages — that work is done and the comments now mislead. Same sweep as 3.
5. **Verify apex vs `www`** — `CNAME` is the apex, every canonical says `www`. Confirm one 301s to the other and the survivor is the one the canonicals name. `technicalDebt.md` item 12a.
6. **Page-by-page copy and browser QA.** The estimate flow and photo uploader have now been exercised in production; most layout still has not been seen. Item 10m (Step 1's heading) sits here.
7. **Chase review / major revision pass** — expect a real round of change requests.
8. **Search Console** — property verification and sitemap submission.
9. **Competitor and search-intent research** — never done, and the homepage geographic decision is waiting on it. See *Open Decisions*.
10. **Lighthouse mobile + desktop** — hero images are full-resolution `2048x1536` with no `srcset`; Google Fonts loads render-blocking.
11. **Tree / brush clearing page** — `technicalDebt.md` item 3b. First-party supported by Chase's own advertising and the only advertised service with no page.
12. **Location pages rows 7-11** — Gallipolis OH, Waverly OH, Greenup KY, Louisa KY. (Jackson shipped in the P0 pass.) Build to the shipped nine, not a template.
13. **Decide West Union, OH and Flatwoods, KY** — advertised in the nav but absent from `seoPlan.md`'s 11-city table.
14. **Google Business Profile** — none exists. `docs/phasePrompts/phase6GoogleBusinessProfile.md` holds the playbook; artwork is staged in the gitignored `graphics/GBP - Services/`.
15. **Commit the validator toolchain** — `technicalDebt.md` item 10i, now the most fragile thing about how this project is worked on.

---

## Current Blockers

| # | Blocker | Impact |
|---|---|---|
| ~~1~~ | ~~**The new Apps Script is not deployed**~~ | **RESOLVED 2026-08-15.** Deployed and verified in production by a public incognito submission with five photos. |
| ~~3~~ | ~~**Production domain undecided**~~ | **RESOLVED.** `bluegridlandsolutions.com` is live. |
| 2 | **`config!notificationEmail` and `photoViewerEmail` must both name the real accounts** | Still unverifiable from this repo. `notificationEmail` was pointed at a test recipient for the live test and `photoViewerEmail` at a test Google account. **If either is still a test address, Chase gets nothing / cannot open photos.** Confirm both in the config tab before handing the site over. |
| 4 | **Apps Script is one version behind the repo** | This session narrowed the accepted formats to JPEG/PNG/WebP. Until the four `.gs` files are pasted and a new version deployed, production still accepts HEIC. Not a vulnerability — the old policy is the safe superset minus one format — but the repo and production disagree. |
| 4 | `MODULE_API_KEY` state unknown | Cannot be checked from outside — `leads.list` returns `UNAUTHORIZED` whether the key is unset or merely not supplied. Blocks only a future dashboard, never the public form. |

---

## Deployment Handover — the exact live steps

> **HISTORICAL, as of 2026-08-15.** These steps were executed and the pipeline is live and verified in production. Kept because they document the first-deployment sequence and the reset-to-`BG-0001` procedure, which will matter again if the Sheet or the script project is ever rebuilt.
>
> **For a routine code update, the whole procedure is:** paste the changed `.gs` files → *Deploy → Manage deployments → pencil → New version → Deploy*. A **new deployment** mints a different URL and silently breaks all 28 forms.

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
- ~~**Confirm phone** `(740) 464-2526`~~ — **confirmed 2026-08-13**, printed on his own advertisement (`graphics/images/whatTheyDo2.jpg`). **Business email** `estimates@bluegridlandsolutions.com` is **still a placeholder** and may route nowhere.
- **Retention period for customer photographs.** `BlueGrid Lead Photos` keeps them indefinitely and nothing deletes them. Needs a decision before it becomes a quiet liability — `technicalDebt.md` item 24i.
- **The pre-launch review of the whole site** — the first time he sees it end to end, now that it is actually live.
- **Confirm the Facebook page renders in the Page Plugin** → flip `facebookPageConfigured`.
- **Google Business Profile** — does not exist; the footer icon is hidden at runtime.
- **May we name Chase on the site?** Copy says "the owner" throughout.
- **Company facts worth adding, now that there is a page to hold them.** `company/index.html` ships using only claims that already appear elsewhere on the site. **Nothing about history, credentials, awards, certifications, years in business, or crew size is on it, and none may be added without Chase confirming it.**
- **Copy review** of the 6 location pages and 7 Insights articles.
- **The Chase review / major revision pass itself** — see *Remaining Launch Work* item 10. Expect this to generate its own list.

## Waiting on Aron

**One of these is a P0 and the rest are not.**

- **P0 — confirm `notificationEmail` and `photoViewerEmail` in the `config` tab both name the real accounts.** Acceptance testing deliberately used a *test recipient* for estimate email and a *separate test Google account* for Drive viewing. If either is still a test address the system looks perfectly healthy while Chase receives nothing, or cannot open a single photo. **Neither is verifiable from this repository.** Run `listRootFolderAccess()` from the Apps Script editor and read the config tab. Two minutes, and nothing else on this list matters until it is done.
- **Paste `config.gs` and `validation.gs`, then deploy a new version.** The repo narrowed the accepted formats to JPEG/PNG/WebP; production still accepts HEIC until this is done. Not a vulnerability — the live policy is the safe superset minus one format — but repo and production disagree. *Deploy → Manage deployments → pencil → New version.* A **new deployment** mints a different URL and silently breaks all 28 forms.
- **Redeploy the website** if the format change should take effect there too — `js/indexJS.js` changed. Ship both halves together so the front end and the API agree.
- **Decide the homepage geographic target.** An audit was delivered 2026-08-15 recommending the homepage stay regional; Aron has neither accepted nor rejected it. See *Open Decisions* below.
- **Get four claims confirmed or corrected by Chase** — `technicalDebt.md` item 3a lists exactly what his own advertising does and does not support. The two needing him: whether he can commit to any estimate turnaround, and whether the certificate-of-insurance sentence is accurate. Also still open: `estimates@bluegridlandsolutions.com`, which appears on no artwork and may route nowhere.
- **A real browser pass** on phone, tablet and desktop. Parts of the site have now been seen — the estimate flow and the photo uploader were exercised in production — but most layout still has not.
- **Decide whether to delete `phase2a-lead-capture`.** Fully merged into `main`, kept deliberately.

---

## Open Decisions — recorded, not implemented

**1. Homepage geographic target.** Audited 2026-08-15 in response to a proposal to make Wheelersburg the homepage's primary signal. Recommendation: **keep the homepage regional.** There is no Wheelersburg page; Portsmouth already claims Wheelersburg in copy *and* FAQ schema; the homepage is the only page holding the two-state region; and `LocalBusiness` declares 12 counties with no address. The proposed eyebrow was rejected; the proposed supporting copy was approved for adding "land clearing", which is absent from the eyebrow today. **Full reasoning in the 2026-08-15 journal entry. Aron has not ruled.**

**2. Competitor and search-intent research has never been done.** It is item 9 of the old Remaining Launch Work list and remains outstanding. **There is no search-volume, keyword-difficulty or competitor data anywhere in this repository** — the only prioritisation rationale ever recorded is one unquantified line in `seoPlan.md`. Any further geographic or keyword decision is being made without it.

**3. Customer photo retention.** `BlueGrid Lead Photos` accumulates customer photographs and names indefinitely. Nothing deletes them and **nothing should be added that does** until a period is agreed with the client. `technicalDebt.md` item 24i.

**4. Whether to re-accept HEIC.** Removed 2026-08-15. Watch early live traffic for iPhone users bouncing off the on-screen instruction. Two-line reversal. `technicalDebt.md` item 24h.

---

## NEXT SESSION SHOULD START HERE

1. **Read `CLAUDE.md`, then this file, then `engineeringJournal.md` and `technicalDebt.md`.** The repository is authoritative — correct stale documentation rather than carrying it forward. This file's header has been found stale within a day of being written more than once; verify it against `git` rather than trusting it. **Commit hashes recorded before 2026-08-15 no longer resolve** — history was rewritten during the production deployment.

2. **Verify Git state.** Expect `main`, working tree clean, HEAD `c4cef24`, **1 ahead of `origin/main`** and 0 behind. Check both directions with `git rev-list --left-right --count origin/main...HEAD`; `origin/main` has moved without a session recording it before. **`c4cef24` is unpushed and Aron has not authorized a push.**

3. **Locate the validator toolchain — it is still not in the repository.** It lives in a session scratchpad, carried forward by hand. **Fourteen suites:** `validateSite`, `validateAssets`, `validateSeo`, `validateNav`, `validateMegaMenus`, `validateHeader`, `validateHero`, `validateFloatingCta`, `validateEstimateCtas`, `validateLeadFlow`, `validateProcessSequence`, `simulateEstimateFlow`, `validateFollowTheWork`, `validateFrontendPhotoPolicy` — named so the count can be checked against the list rather than trusted. Plus `measureHeader`, `measureProcessFit`, the guarded assemblers and the copy-rewrite tables. The Apps Script harness (`appsScript/localTestRunner.js`, **178 checks**) *is* committed. **Re-run everything to establish a baseline before changing anything.** `technicalDebt.md` item 10i still recommends committing the validators, and this is now the single most fragile thing about how the project is worked on.

4. **Ask whether Aron has done the P0 config check** (first item under *Waiting on Aron*) before planning anything touching the pipeline.

5. **The highest-value self-contained work available is `og:image`** — still relative on all 28 pages, so every Facebook link Chase posts renders without an image, on a site whose stated distribution channel is Facebook. `technicalDebt.md` item 12. One mechanical sweep; `validateAssets` will not catch it because relative paths resolve locally.

6. **Other self-contained work, in rough value order:** the tree/brush clearing page (item 3b — first-party supported, the only advertised service with no page), apex-vs-www verification (item 12a), a reporting-only `listOrphanPhotoFolders()` (item 24c), the duplicate FAQ question (10a), Step 1's heading (10m), mega-menu current-page highlighting (19).

7. **Do not re-implement the photo, identifier, access-control or P0 SEO work.** All four are complete in the repository and three of them are verified in production. If something looks wrong, determine whether it is a deployment step that has not run before changing code.

8. **`docs/sessionCloseout.md` exists locally and is gitignored — do not commit it, and do not recreate it if it is already there.**
