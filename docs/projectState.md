# Project State — BlueGrid Land Solutions

**Last updated:** 2026-08-07
**Repository:** `c:/Dev/NuloWorkspace/ClientSites/client_BluegridLandSolutions/`
**Branch:** `phase2a-lead-capture` — branched from `main`, **not merged, nothing pushed**
**Latest commit:** `33358be` — Process section: sequential step reveal

> Source of truth for resuming work. Only verified, completed work is recorded here.
> Read this file first. `engineeringJournal.md` has the reasoning; `technicalDebt.md` has what is knowingly deferred.

---

## Current Phase

**Between phases. Nothing is half-finished and the working tree is clean.**

| Phase | State |
|---|---|
| Phase 1 — Website completion | Complete |
| Phase 2A — Lead capture infrastructure | Complete (code) |
| Phase 2B — Service area pages, first wave | Complete (6 of 13 cities) |
| Phase 2C — Hero mobile refinement | Complete |
| Phase 2D — Live Apps Script backend | **Complete — lead capture is live** |
| Header navigation polish + tokenization | Complete |
| Navigation & content expansion (FAQ hub, Insights) | Complete |
| Launch polish — services mega menu, hero typing performance | Complete |
| Process section — sequential step reveal | Complete |

**The production domain is the only outright launch blocker left.**

---

## Overall Objective

Take the BlueGrid Land Solutions website from "built but not launchable" to production launch:

1. ~~Repair missing functionality and broken navigation~~ — done
2. ~~Complete missing content (service pages, service area pages)~~ — done for the first wave
3. ~~Wire lead capture end to end (website → Apps Script → Sheet → owner email)~~ — done and verified live
4. Final SEO, performance, and launch validation — **blocked on the domain**

---

## Current Repository Status

**96 tracked files. 23 HTML pages.**

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
css/                        styleIndex.css (homepage + shared),
                            stylePages.css (interior pages)
js/indexJS.js               single shared script for all 23 pages
docs/                       this file, engineeringJournal.md, technicalDebt.md,
                            seoPlan.md, servicePageArchitecture.md,
                            forestryModuleSchema.md, googleSheetArchitecture.md,
                            heroDirection/, phasePrompts/
```

**Architecture facts a new session must know:**

- Static site, **no build step**, pure HTML/CSS/JS per `codeStyle.md`.
- Shared chrome (header, mobile drawer, estimate modal, footer, floating actions) is **duplicated into every page** and kept in sync by guarded one-shot Node scripts run from a scratchpad. **Those scripts are deliberately not checked in** — Phase 13 (`docs/phasePrompts/phase13ServiceAreaExpansion.md`) owns the real generator, and shipping a half-generator would create two competing sources of truth.
- **Two path variants only:** root (`index.html`) and one level deep (`services/`, `locations/`, `insights/`, `faq/`). **Put any new page one level deep** so it reuses the proven one-level chrome — that is why the FAQ page is `faq/index.html` rather than `faq.html`.
- **Service links have three path forms, not two.** Root pages use `services/x.html`, pages *inside* `services/` use the bare sibling `x.html`, and every other one-level folder uses `../services/x.html`. When splicing chrome out of a `services/*.html` page the links come across in the sibling form and must be repointed. This has now bitten three separate builders; the 2026-08-06 rebuild only avoided it because its guard refused to write until the link sets matched.
- **Line endings are mixed and deliberate.** `index.html`, `js/indexJS.js`, `css/styleIndex.css` and most `services/*.html` are CRLF; `css/stylePages.css`, `services/forestryMulching.html`, `locations/*`, `insights/*`, `faq/*` are LF. **Any scripted edit must detect and preserve per file.**
- The Apps Script endpoint lives in **exactly one place** — `businessConfig.estimateEndpoint` in `js/indexJS.js` — with exactly one `fetch()` call site.

### Verification state (all green)

| Check | Result |
|---|---|
| Internal links & assets | **23 pages, zero broken** |
| Navigation / mega menu / mobile drawer | PASS on all 23 pages |
| **Services mega panel** | PASS — 23 pages: structure, 7 links resolving to real files, styling coverage both ways, decorative SVGs out of the a11y tree, on-screen fit 1151–1600px |
| Header width sweep 900–1600px | PASS — zero wrapping; tightest desktop 1151px at **+163px** slack |
| Hero seam geometry (5 viewports) | PASS — copy ends exactly on the seam, 24px card overlap |
| Hero before/after loop (10 min simulated) | PASS — **91 cycles alternating**, 6.16–7.01s cadence |
| **Hero typing profile (5 min simulated)** | PASS — rendered cadence equals the scheduled cadence exactly; **0 characters swallowed**, **0ms** write-to-paint |
| **Process sequence (simulated)** | PASS — 8 pages: 13 beats in exact order, max 1 arrow bright, reset in one tick, loop restarts, 0 changes off-screen or tab-hidden, reduced motion registers nothing |
| Lead submission contract | PASS — one endpoint, one call site, payload matches schema on all 23 pages |
| Apps Script harness | **64/64**, `runSelfTest` 6/6 |
| `node --check js/indexJS.js` | clean |
| CSS brace balance | balanced in both stylesheets |

---

## Completed — Session of 2026-08-07 (process section)

### Sequential step reveal across the homepage and all 7 service pages
The brief described this as animation-only on top of an established visual — a centred dark rectangle with arrowheads and no connecting line. **That visual was not in the repository**, and nothing in git or the other client sites had it, so this session built both.

- **`.processBoard`** — a dark gradient rectangle, capped at 1120px and centred, floating on the white section, with the heading above and a new CTA below. Step type inverted for the dark surface.
- **Arrowheads replaced the connecting rule.** Chevrons only, interleaved between steps in DOM order so reading order and animation order are one list, sat on the centre line of the numbered discs.
- **Two pre-existing facts drove the architecture:** the homepage runs 5 steps and every service page runs 4, and the old grid was hardcoded to `repeat(5, 1fr)` — so seven of eight pages had been rendering with an empty fifth column. Flex replaced it, and nothing assumes a step count.
- **Sequence:** step reveals → arrow flashes → arrow dims → next step, then a 2.6s hold on the finished picture, a clean reset, and a replay. **10.18s per cycle** at five steps. The next step is revealed from inside the arrow's dim callback, so it cannot appear before its arrow has finished.
- **Viewport trigger with asymmetric hysteresis** — enters on a meaningful arrival (40% ratio, or the top past mid-screen for boards taller than the viewport), exits only when completely off screen. One predicate for both would have restarted the story on every scroll tremor at the boundary. A hidden tab pauses; returning replays from step one.
- **Vertical from 1080px down**, arrows rotated to point at the next step. The old two-up grid could not work with directional arrows — the arrow ending a row pointed into the edge of the board. The breakpoint did not move, only what it switches to. Rotation is a `--processArrowTurn` token composed into every state, because the reduced-motion block sits later in the stylesheet and a bare `transform: none` would otherwise straighten every arrow on mobile.
- **Reduced motion** shows every step and arrow in their finished state immediately; the sequencer returns before registering an observer.
- **Performance:** one class toggle per beat, ~a dozen per cycle, opacity/transform/filter only. Every element holds its space from the first paint, so the board never resizes. The hero typing profile was re-run and is unchanged to three decimals.

---

## Completed — Session of 2026-08-06 (launch polish)

### Services mega menu — visual redesign
Presentation only. **Every href, every description, and the toggle behaviour are unchanged**; the grouping, order, and styling are the redesign.

- **A featured band** across the top of the panel carries Forestry Mulching — icon tile, eyebrow, display-face title, one line of promise, and a cue that slides on hover. It is the only filled surface in any panel on the site, which is what makes the eye land there first.
- **The remaining six sit in three equal, labelled groups** — *Clearing & Site Prep*, *Access & Habitat*, *Cleanup & Recovery* — two services each. The previous panel put seven items in a two-column grid, so the last row was always a hole; three-by-two has no hole and the groups say something true.
- Panel width **760px, matching the FAQ panel**, so the two large panels read as the same object. Row icons dropped from 22px to 18px at 75% opacity, titles to 0.9rem, and a sky rule grows down the leading edge on hover — opacity and transform only.
- **Tokenized as a reusable pattern.** Nine `--mega*` custom properties in `:root` now carry the panel surface, shadow, top edge, rule, row radius, hover tint, label and copy colours; the FAQ panel was repointed at the identical values, so it renders byte-identically while sharing the vocabulary.
- Fit proven with the real font metrics, not estimated: at 1151px — the narrowest viewport the desktop nav survives to — the centred panel clears the left edge by **62px**, and the tightest group title (*Hunting Property Prep*) has **16px** of slack on one line.

### Hero typing — profiled, then optimized
The animation was profiled before anything was changed, by running the shipped `indexJS.js` in a VM against a virtual clock that models the browser rendering lifecycle: timers fire when scheduled, but a DOM change only becomes visible on a frame boundary.

**What the profile found**

| | Before | After |
|---|---|---|
| Jitter the render step added to the cadence | **+24%** (60Hz), +31% under load | **0%** |
| Wait from writing a character to painting it | **8.5ms** mean, 16.7ms worst | **0ms** |
| Text nodes destroyed and rebuilt (3 min) | **873** | **18** |
| `setTimeout` allocated (3 min) | **939** | **139** |
| Two characters landing in one frame | structurally possible | structurally impossible |

- **Root cause 1 — scheduling.** One `setTimeout` per character wrote straight into `.textContent`. A timer fires at an arbitrary point inside a frame, so each character waited out the rest of that frame, and under load two timers could fire in one frame with the second write erasing the first before it was ever shown. Now every commit happens inside `requestAnimationFrame`.
- **Root cause 2 — the schedule asked for cadences the display cannot express.** Deadlines chain from *the frame that served the previous commit*, so only one rounding sits between any two characters. Scheduled and rendered cadence are now identical.
- **Deliberately not frame-counted.** Counting frames measured very slightly smoother at 60Hz but was verified to run the phrase at **exactly double speed on a 120Hz panel** (40.5ms vs 81.8ms mean). The shipped version holds 80.6ms at 60Hz and 81.8ms at 120Hz.
- **Root cause 3 — paint.** `.heroHeadline` borrows its compositing layer from the `[data-heroanimate]` entrance, and `indexJS.js` strips that attribute at **t=2200ms — roughly the sixteenth character of the first phrase**. From then on the typed line painted into the same layer as the hero photograph: **655k pixels and ten 256px tiles re-rastered per character, 8.0 megapixels/second of photograph resampling**, for a change that only ever touches the glyphs. `.heroTypedLine` now holds its own layer for the life of the loop, which also removes a layer teardown that currently lands mid-phrase.

`heroDuetConfig` was not touched. The visible design, the phrases, and the delay ranges are exactly what they were.

---

## Completed — Sessions of 2026-08-02 → 2026-08-04

### Phase 2A verification — no code needed
Confirmed the previous session's claim rather than trusting it. All 7 `.gs` modules present, 27-column `LEADS_HEADERS` intact, harness 64/64, deployment runbook complete.

### Phase 2B — Service area pages, first wave
- **6 location pages** at `locations/forestry-mulching-{slug}.html`, rows 1–6 of the `seoPlan.md` table.
- Each has a local intent block, a four-tile fact grid (county / terrain / dominant growth / routes in), a terrain write-up with 3 cards, 4 "what landowners here call us about" cards, all 7 services linked with localized anchor text, **5 unique local FAQs**, the estimate form with `serviceNeeded` preselected, and a nearby-communities block.
- **Uniqueness enforced mechanically:** worst pairwise 5-word-phrase overlap **14.7%** against a 25% gate; 1,133–1,283 body words each. Grayson is about karst and hidden sinkholes, Chillicothe the glacial line, Morehead cliff bands and slope limits, Portsmouth bottom-vs-hillside, Ironton the Wayne NF boundary, Ashland river-bench town lots.
- All service-area links wired sitewide; new homepage "town by town" block; "Where We Work" block added to the Forestry Mulching service page.
- **Rowan County added** to `serviceRegions`, `LocalBusiness` `areaServed`, the map panel, and both copies of the county FAQ answer — Morehead was always advertised but Rowan appeared nowhere in the coverage data. TODO-marked for client confirmation.

### Phase 2C — Hero mobile refinement
- **Hero background decoupled from the estimate form.** `.heroMedia` was `inset: 0`, so on mobile — where the grid collapses and the card stacks below — the photo stretched to cover the doubled section. Now pinned top-only with `height: var(--heroMediaHeight)` (`100lvh`, `100vh` fallback); one property drives the media band, the copy block, and the estimate band. `.heroSection::after` gives the estimate area its own background opening in the exact colour the photo fades into; the card rides 24px over the seam.
- **Before/after loop fixed at the cause.** `fireHeroReverseDissolve()` was fire-and-forget with an 1800ms cleanup timer while the loop moved on after 220ms, so a stale cleanup stripped the next cycle's `isRevealed` mid-sweep. Now awaited. The forward sweep gained an `error` fallback so a failed image cannot strand the loop forever.
- **`hero_after` casing normalized** — disk had `.jpg`, git tracked `.JPG`; harmless on Windows, a 404 waiting on case-sensitive hosting.

### Phase 2D — Live Apps Script backend
- **Production `/exec` URL wired.** Lead capture is live.
- Endpoint architecture audited, not assumed: appears **exactly once** in shipped code, **one** `fetch()` call site, all 23 pages share `js/indexJS.js`, no page inlines a handler.
- **Defect found by the post-wiring review and fixed:** no double-submit guard. `isLoading` was cosmetic, the button was never `disabled`, and `buildEstimatePayload()` minted a fresh `leadId` per call — so a double-tap sent two payloads with two different ids that the server's dedupe could not collapse (two rows, two owner emails, two auto-replies, double MailApp quota). Fixed with an in-flight lock, a genuinely disabled button, release on all three terminal paths, and a `leadId` held stable for the page load so a retry collapses into the original row.
- **Verified live, zero side effects:** `ping` → `forestryModule` / `bluegrid` / `1.0.0` (matches `config.gs`, proving the deployed script is this repo's code); `UNKNOWN_ACTION`; `UNAUTHORIZED` without a key; and a honeypot-tripped `POST leads.create` returning a correct envelope — exercising the entire transport chain while the server short-circuits before writing a row or sending mail.

### Header navigation polish, then tokenization
- Header wrapped between ~1100–1200px. Measured with the **real Inter/Rokkitt font metrics** (downloaded from Google Fonts, TTF extracted from the EOT wrapper, `head`/`hhea`/`hmtx`/`cmap` parsed): the full-spacing header needed **1207px** while the mobile switch sat at 1080px — a 126px band where the desktop nav was live and could not fit.
- **Tightening saved 101px.** The `Free Estimate` CTA padding was deliberately untouched.
- Optimization alone was not enough — at 1100px still 6px short — so the **switch moved 1080px → 1150px**. A compact band starts at **1280px**, above the wrap point, so crossing it makes the bar roomier rather than tighter.
- **Header-only media query** — the six header rules moved out of the 1080px query, which also drives the hero and services grid.
- **Then tokenized:** twelve `:root` custom properties, the 1280px/1150px queries reduced to token overrides, and every state change animated on a shared `--headerTransition` (`0.35s var(--easePremium)`). `prefers-reduced-motion` zeroes it in one declaration.

### Navigation & content expansion
- **Primary nav → Services · Service Areas · FAQ · Insights** on all 23 pages. Reviews removed. **Before & After also removed** — see *Waiting on Aron*.
- **FAQ became a desktop mega menu:** 9 questions, bold question + two-sentence preview, two-up in a 760px panel capped against the viewport, "View All FAQs" CTA. Several items link to the service page that already owns the answer rather than restating it. Mobile is two plain links by instruction.
- **`faq/index.html`** — 28 questions in 6 categories, jump-link grid, per-question anchors, `FAQPage` schema, cross-links to all 7 service pages. **All 28 are new**: the site already had 75 FAQs and `seoPlan.md` bans duplicates, so the hub took the uncovered ground.
- **`insights/`** — landing page + 7 articles, 550–900 body words each, worst pairwise overlap **0.3%**. No dates anywhere by instruction. Hero images are real job photos standing in, all TODO-marked.

---

## Currently In Progress

**Nothing.** Working tree is clean, all validators pass, the session ended at a deliberate stopping point.

---

## Remaining Tasks (priority order)

1. **Settle the production domain** — blocks items 2–5. Canonicals say `https://www.bluegridlandsolutions.com/`; `CNAME` says `bluegridlandsolutions.nulostudio.com`.
2. **`robots.txt`** — does not exist. Trivial once the domain is fixed.
3. **`sitemap.xml`** — does not exist. Needs **23 URLs** today, 28 once location rows 7–11 ship.
4. **Canonical URL finalization** — 23 pages, every one `TODO:`-marked so a single sweep catches them.
5. **Open Graph finalization** — same 23 pages; `og:url` and `og:image` must become absolute.
6. **One real end-to-end lead submission** from the live site. Not run by this project — it writes a row and emails the owner *and* the customer. Confirm the five outcomes in `appsScript/README.md` step 10, then check `errorLog` is still empty.
7. **Open the site in a real browser.** No session on this project has ever had one; everything to date is static analysis or simulation.
8. **Location pages rows 7–11** — Jackson OH, Gallipolis OH, Waverly OH, Greenup KY, Louisa KY. Build to the shipped six, not a template: under 25% pairwise overlap, 1,100+ body words, content that breaks if the city name is swapped.
9. **Decide West Union, OH and Flatwoods, KY** — advertised in the nav but absent from `seoPlan.md`'s 11-city table. Either they get pages or they come out of the nav.
10. **Lighthouse / performance pass** — hero images are full-resolution `2048×1536` with no `srcset`; Google Fonts loads render-blocking. The hero typing animation was profiled and optimized on 2026-08-06 and is no longer a candidate; these two are.

---

## Current Blockers

| # | Blocker | Impact |
|---|---|---|
| 1 | **Production domain undecided** | The only outright launch blocker. Gates `robots.txt`, `sitemap.xml`, canonicals, and OG URLs across 23 pages. |
| 2 | `MODULE_API_KEY` state unknown | Cannot be checked from outside — `leads.list` returns `UNAUTHORIZED` whether the key is unset or merely not supplied. Blocks only the Phase 2 dashboard, never the public form. |

**Resolved this session:** `estimateEndpoint` is wired and answering; the `BlueGrid Leads` spreadsheet exists with `setupSpreadsheet()` and `runSelfTest()` both passed.

---

## Waiting on Client (Chase)

- **Price ranges.** `seoPlan.md` calls cost transparency the biggest opening in this trade. No page quotes a dollar figure because none has been approved; every cost FAQ instead names the factors that move the price. **Rough per-acre or per-day ranges are the single highest-value upgrade available to the location pages** and cost one conversation.
- **Confirm Rowan County / Morehead coverage.** If Chase does not work Rowan County, the Morehead page and all four data entries come back out.
- **Real project photos** — ideally before/after pairs per service, tagged by location. Would unlock galleries on all 6 location pages and replace the Insights placeholders.
- **Owner introduction video** — section is built and video-ready; two config fields.
- **Badge artwork typo** — the official badge reads **"FORESTRV"**, not "FORESTRY". Appears on every page.
- **Confirm phone** `(740) 464-2526` and **business email** `estimates@bluegridlandsolutions.com` — both placeholders.
- **Confirm the Facebook page renders in the Page Plugin** → flip `facebookPageConfigured`.
- **Google Business Profile URL** — none exists; the footer icon is hidden at runtime.
- **May we name Chase on the site?** Copy says "the owner" throughout.
- **Copy review** of the 6 location pages and 7 Insights articles.

## Waiting on Aron

- **Domain decision** — blocker 1.
- **Confirm the nav decision.** The nav brief spelled the resulting order out as four items (Services · Service Areas · FAQ · Insights), which excluded *Before & After*, so it was removed from the primary nav. It stays reachable from the homepage hero CTA ("See Transformations") and the footer Quick Links. **If a five-item nav was intended, restoring it is a one-line change.**
- **One real end-to-end lead submission** from the live site.
- **A browser pass** on phone / tablet / desktop. Three things have only ever been reasoned about, never seen: the **redesigned services mega panel** (open it at 1440px and at 1151px); the **hero typing** now that it commits on the frame boundary and holds its own compositing layer; and the **process sequence** — the dark board on the white section, the arrow flash brightness, whether the 10.18s cycle reads as deliberate or slow, and the vertical layout below 1080px.
- **Confirm the process section's new visual.** The 2026-08-07 brief described a dark rectangle with arrowheads as already established; it was not in the repository, so it was built to that description. It has never been compared against whatever you were picturing.
- **Merge `phase2a-lead-capture` into `main`** when satisfied. Nothing has been pushed.
- **Redeploy discipline:** always *Deploy → Manage deployments → edit → New version*. A **new deployment** mints a different URL and silently breaks all 23 forms.

---

## Recommended Next Task

**Settle the production domain.** It is the only outright blocker and it gates four separate pieces of work (`robots.txt`, `sitemap.xml`, canonicals, Open Graph). Every affected tag is already `TODO:`-marked, so one sweep closes all of them across 23 pages.

While waiting, the two zero-engineering checks are worth doing: **one real lead submission**, and **opening the site in a browser**.

## Recommended Next Phase

**Phase 2E — Launch SEO & QA**, once the domain exists:

1. `robots.txt` + `sitemap.xml` (23 URLs)
2. Canonical + OG absolute-URL sweep across all 23 pages
3. Lighthouse pass — responsive `srcset` on hero images, font loading
4. Structured-data validation via Google's Rich Results Test — `LocalBusiness`, `Service` ×7, `FAQPage` ×9, `BreadcrumbList` ×22, `Article` ×7, `ItemList` ×1
5. Real-browser QA across the breakpoints

**Then Phase 2F — Location wave 2** (rows 7–11), built to the same uniqueness gate.
