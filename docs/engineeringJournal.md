# Engineering Journal — BlueGrid Land Solutions

Append-only. Newest entry at the top.

---

## 2026-08-02 (session 2) — Phase 2A verification + Phase 2B service area pages

### Summary

Verified Phase 2A was genuinely finished rather than trusting the previous entry, then built Phase 2B's first wave: **six forestry mulching location pages** covering the cities `seoPlan.md` stages as the Phase 7 build set, and wired every service-area link on the site to them.

Phase 2A needed no code. The harness still reports 64/64, the deployment runbook is complete, and `estimateEndpoint` is still empty — exactly the state the previous session described. The only remaining 2A work is the Google Apps Script deployment, which requires credentials no engineering session has.

The site went from "13 cities advertised in the nav, all 13 pointing at one anchor" to "6 real, locally specific landing pages that a competitor cannot produce by find-and-replace."

### Files Created

**Location pages** (`locations/`)
- `forestry-mulching-ashland-ky.html`
- `forestry-mulching-portsmouth-oh.html`
- `forestry-mulching-ironton-oh.html`
- `forestry-mulching-chillicothe-oh.html`
- `forestry-mulching-grayson-ky.html`
- `forestry-mulching-morehead-ky.html`

### Files Modified

- `index.html` — 6 mega-menu cities and 6 mobile-menu cities repointed at their pages; 6 footer cities became links; new "Forestry mulching, town by town" block added inside `#serviceAreas`; Rowan County added to `LocalBusiness` `areaServed`, the static map panel list, and both copies of the "Do you travel to my county?" answer
- `services/forestryMulching.html` — same 18 chrome link changes, plus a new **"Where We Work"** section linking all 6 location pages. This is the parent page for the location tier and the only place body content links down to it
- `services/{landClearing,brushRemoval,trailCutting,stormCleanup,propertyCleanup,huntingPropertyPrep}.html` — 18 chrome link changes each
- `css/stylePages.css` — activated the dormant `SERVICE AREA PAGES (locations/)` block; added `.localSection`, `.localProse`, `.localProblemGrid`; changed `.nearbyList` from styling `a` to styling `li`
- `css/styleIndex.css` — `.serviceAreaTowns` / `.serviceAreaTownsLabel` / `.serviceAreaTownList` for the new homepage block
- `js/indexJS.js` — `rowan` added to `serviceRegions`, TODO-marked for client confirmation

### Architecture Decisions

1. **Six pages, not thirteen.** `seoPlan.md` rows 1–6 with genuinely local content, over 13 pages that would read as doorway pages. The nav advertises 13 cities; the 7 without pages still point at the `#serviceAreas` anchor rather than getting a shell.
2. **Reused the existing tier, added nothing structural.** `css/stylePages.css` already carried an unused `.localFactGrid` / `.localServiceList` / `.nearbyList` block, and `getSourcePage()` in `js/indexJS.js` already special-cased a `locations/` folder — the previous session pre-wired for this. Three new CSS rules were all the tier needed.
3. **Location pages link up, never sideways.** Per `seoPlan.md`'s Internal Linking Map: each page links to its parent service page, the homepage, and all 7 services. Nearby towns are rendered as plain text pills, which is why `.nearbyList` was changed from styling `a` to styling `li`. A validator check enforces this on the `<main>` content of every location page.
4. **Sitewide chrome does link to location pages, deliberately.** `seoPlan.md` rule 4 explicitly blesses "an inbound link from the mega menu", and making the shared header page-type-dependent across 14 files would be a maintenance trap. The no-sideways-links rule is enforced where it matters — body content.
5. **Breadcrumb is Home › Forestry Mulching › City,** not the `seoPlan.md` sketch of Home › Locations › Page. There is no `locations/` hub page yet (that is Phase 13), so a "Locations" crumb would have pointed at nothing. Every crumb in the shipped version resolves.
6. **No dollar figures.** `seoPlan.md` content rule 5 asks for real cost ranges, and no pricing has been approved by the client — the 7 existing service pages quote none either. Each cost FAQ instead answers with the factors that move the price on that county's specific ground, which is honest and still locally unique. Logged as a client ask, because supplying ranges is the single strongest upgrade available to these pages.
7. **No galleries on location pages.** 13 photos exist for 14 pages and none can be honestly captioned to a named town. Consistent with the Phase 1 decision on `stormCleanup` and `huntingPropertyPrep`.
8. **The assembler stays in the scratchpad.** Pages were generated once from a guarded splice of `services/forestryMulching.html` plus a content data file, then committed as plain static HTML — the same technique the previous session used. It is deliberately **not** checked in: Phase 13 (`phasePrompts/phase13ServiceAreaExpansion.md`) builds the real generator, and shipping a half-generator now would leave two competing sources of truth.
9. **Rowan County added to the coverage data.** Morehead was advertised in the nav on all 8 pages but Rowan County appeared in none of the four places the site lists counties. Publishing a Morehead page while the schema denied coverage would be worse. Added and TODO-marked rather than silently expanded.

### Validation Performed

- **14 pages, 1,372 internal links and assets checked, zero broken.** Every same-page anchor resolves to an id on that page; every cross-page anchor resolves to an id on the target page
- One `<h1>` per page; zero duplicate IDs; tag balance verified across 16 element types
- Every JSON-LD block parses; every `FAQPage` question is verified to actually render in the markup
- Titles and meta descriptions **unique across all 14 pages**
- `serviceNeeded` enum identical across all 14 pages and `appsScript/config.gs` (compared on values, since the homepage uses CRLF and interior pages LF)
- Every location page preselects `Forestry Mulching` in the embedded form
- Each built city has at least 3 links per page (mega menu, mobile menu, footer); no built city still points at `#serviceAreas`; all 6 are reachable from the parent service page
- **Uniqueness gate:** worst pairwise 5-word-phrase overlap between location pages is **14.7%** against a 25% threshold; body copy 1,133–1,283 words per page
- CSS braces balanced in both stylesheets; every class used in new markup exists in a stylesheet
- `node --check js/indexJS.js` clean
- `node appsScript/localTestRunner.js` — **64/64**, `runSelfTest` 6/6, unchanged
- CTA destinations enumerated on a finished page and confirmed: hero and floating estimate → `#estimateForm` (present), phone → `tel:` with `data-confighref`, footer "View Our Work" → `../index.html#beforeAfter`, Facebook → the real page

### Bugs Found

**Introduced by me during this session, caught by the guards**

1. Generated pages shipped **mixed line endings** — CRLF from the template literals in the generator, LF from the chrome spliced out of `services/forestryMulching.html`. Normalized to LF to match the sibling `services/*.html` files.
2. The first build aborted on an unescaped-ampersand guard that was matching `META & SEO` inside HTML comments. The guard was wrong, not the output — fixed to strip comments before checking.
3. The `serviceNeeded` drift check compared raw text and flagged all 13 interior pages. The enum values were identical; only indentation and line endings differed. Fixed to compare normalized values.
4. `.nearbyList` carried a `2rem` top margin from the previous session, which stacked with the `3.2rem` bottom margin of the `.sectionLede` above it. Changed to `0 0 2.4rem`.

**Pre-existing, found but not in scope**

5. `servicePageArchitecture.md` says the current service should be highlighted in the mega menu on its own page. It is not — the header block is byte-identical across all 7 service pages. Logged in `technicalDebt.md`.

### Important Decisions Made

- **Morehead was kept in the first wave** even though Rowan County sat outside the documented coverage map, because `seoPlan.md` lists it as row 6 and the nav has always advertised it. The coverage data was corrected to match rather than the page being dropped.
- **West Union, OH and Flatwoods, KY are advertised in the nav but appear nowhere in `seoPlan.md`'s 11-city table.** Not resolved this session — flagged in `projectState.md` as a decision: give them pages or take them out of the nav.
- **`locations/` was the only new folder created**, and it is the folder `servicePageArchitecture.md` and `seoPlan.md` both specify.

### Lessons Learned

- **A dormant CSS block is a design decision left in the repo.** `stylePages.css` had `.localFactGrid`, `.localServiceList`, and `.nearbyList` written and unused. Reading them first shaped the page anatomy and meant three new rules instead of a new stylesheet.
- **Write the uniqueness test before writing the pages.** A 5-word-shingle overlap check turns "don't build doorway pages" from an intention into a number. 14.7% against a 25% gate is a fact; "these feel different" is not.
- **Guards catch your own mistakes, not other people's.** All four bugs this session were mine, and three were caught by assertions written before the code ran. The mixed-line-endings one was caught by an audit added only because the enum comparison failed for an unrelated whitespace reason — worth remembering that a false positive can still point at something real.
- **A validator that only checks the new work is worth half as much.** Running the link and structure checks across all 14 pages, not just the 6 new ones, is what confirmed the chrome rewiring landed identically everywhere.

---

## 2026-08-02 — Website completion + lead capture infrastructure

### Summary

Two phases in one session. **Phase 1** completed the website: built the 7 missing service pages that fixed 28 broken links, removed the fabricated review carousel, and repurposed the homepage's second section into a video-ready owner introduction. **Phase 2A** built the entire lead capture backend: a modular Apps Script web app, an `errorLog` sheet, owner-only email notification, and a Node test harness proving the pipeline works before deployment.

The site went from "every Learn More link 404s and the contact form fakes success" to "code-complete, pending one deployment URL."

### Files Created

**Website**
- `services/forestryMulching.html`
- `services/landClearing.html`
- `services/brushRemoval.html`
- `services/trailCutting.html`
- `services/stormCleanup.html`
- `services/propertyCleanup.html`
- `services/huntingPropertyPrep.html`
- `css/stylePages.css`

**Apps Script**
- `appsScript/Code.gs` — entry points, `setupSpreadsheet()`, `removeObsoleteConfigKeys()`, `runSelfTest()`
- `appsScript/routes.gs` — action registry
- `appsScript/leads.gs` — `LEADS_HEADERS`, create/list/update
- `appsScript/validation.gs` — sanitization, validators, honeypot, formula-injection defense
- `appsScript/notifications.gs` — owner email, auto-reply
- `appsScript/utilities.gs` — sheet access, header enforcement, config, envelopes, auth, error logging
- `appsScript/config.gs` — constants, enums, limits, error codes
- `appsScript/localTestRunner.js` — Node mock harness (dev tool; not pasted into Apps Script)
- `appsScript/README.md`

**Docs**
- `docs/googleSheetArchitecture.md`
- `docs/projectState.md`
- `docs/engineeringJournal.md`
- `docs/technicalDebt.md`

### Files Modified

- `index.html` — reviews section replaced and relocated; second section repurposed to `#meetTheOwner`; divider added between Facebook and Reviews
- `css/styleIndex.css` — marquee CSS removed (102 lines); intro-section and reviews-placeholder styles added; `.introLayout` responsive rule
- `js/indexJS.js` — intro video config + `buildVideoEmbedSource()` + `initializeIntroVideo()`; null guards on every page-specific listener; `getSourcePage()` folder fix; `companyWebsite` added to payload; `showSubmissionError()`; endpoint TODO promoted to a blocker note; Google link hidden when unconfigured

### Architecture Decisions

1. **Static duplication of shared chrome across pages.** No build step exists, so header/modal/footer/floating actions are duplicated into each service page. Mitigated by generating them from `index.html` via a guarded assembler rather than hand-copying, and by `applyBusinessConfig()` driving phone/email/social from one place at runtime.
2. **Each service page embeds the full estimate form + modal** rather than deep-linking to the homepage form. Follows `servicePageArchitecture.md` and preserves in-page conversion.
3. **Sheet-first lead capture.** The `leads` row is the audit trail; a submission succeeds the moment it commits. Notifications run after, wrapped independently, and cannot un-succeed a saved lead.
4. **`errorLog` only, no ActivityLog.** The `leads` sheet already records every success; a second log of successful traffic would add noise and quota cost without adding information.
5. **Owner-only notification.** Nulo Studio is not copied and does not sit in the customer's email thread. Operational problems surface in `errorLog` instead of an inbox.
6. **`text/plain` transport retained.** Apps Script web apps cannot answer a CORS preflight; `application/json` would trigger one and fail from the browser. Encoded the constraint rather than fighting it.
7. **Apps Script lives inside this repo** at `appsScript/`, not the external `C:\Dev\NuloWorkspace\BlueGridAPI\` path named in `phase10AppsScriptApi.md` — that path is outside the writable workspace.

### Validation Performed

- All 7 `.gs` files parse cleanly; **72 globals, zero collisions** (Apps Script shares one global scope, so this matters)
- `js/indexJS.js` passes `node --check`
- `css/styleIndex.css` braces balanced 523/523
- All 8 HTML pages: tags balanced across 12 element types, exactly one `<h1>` each, **zero duplicate IDs**, zero leftover build tokens
- **Zero broken internal links or missing assets** sitewide
- `serviceNeeded` enum **byte-identical** across all 8 pages and `config.gs`
- All 20 payload keys map to columns; all 8 server-authoritative fields correctly excluded from client input
- `LEADS_HEADERS` = 27 columns, matching `forestryModuleSchema.md` exactly
- **`localTestRunner.js`: 64/64 passing**, including built-in `runSelfTest` 6/6 — covers setup idempotency (3 runs), create, dedupe, honeypot, every validation rule, error logging, formula injection, header self-heal, auth, update, `NOT_FOUND`, `UNKNOWN_ACTION`
- Two guarantees explicitly tested: **email failure still saves the lead**, and **no Nulo Studio address appears in any sent message**

### Bugs Found

**Pre-existing**
1. 28 broken links — every service link sitewide 404'd
2. Contact form silently faked success; leads went nowhere
3. Footer Google icon was a live `href="#"` with `target="_blank"` — opened a blank tab
4. `getSourcePage()` collapsed folders, so all service-page leads would have reported ambiguous source pages
5. Unguarded JS listeners would throw on any page without the modal
6. `viewWorkButton` called `.scrollIntoView()` on a null `#beforeAfter` on subpages
7. 102 lines of dead marquee CSS
8. Badge artwork reads **"FORESTRV"** instead of "FORESTRY" (verified against `bluegridBadge400.png`)

**Introduced by me during this session, caught in review**
9. `<figcaption>` nested inside a `<div>` instead of being a direct child of `<figure>` — invalid HTML
10. `sanitizeText()` control-character regex was written with **literal raw control bytes** (0, 8, 11, 12, 31, 127) embedded in the source, producing a malformed character class
11. Notification failures could fall through to the outer catch and report **failure for a lead that was already written**
12. `setupSpreadsheet()` did not create the `dashboardMetrics` tab
13. After generalising `enforceCanonicalHeaders(sheet, headers)`, two lines still referenced `LEADS_HEADERS` — the `errorLog` sheet would have had its headers rewritten on **every single access**
14. Referenced `.introAside` / `.introCta` classes that were never styled
15. Unused `failNextSheetWrite` left in the test runner

### Bugs Fixed

All fifteen above, except **#8 (FORESTRV typo)**, which requires corrected artwork from the client and is logged in `technicalDebt.md`.

### Important Decisions Made

- **Reviews placeholder placed after the Facebook section** (user-approved from three options), with a `dividerFadeUp` added — this also fixed a pre-existing abrupt dark→light transition
- **Client supplied the reviews copy** mid-session; used verbatim, with brand spelling normalised to "BlueGrid" for sitewide consistency
- **Section slot preserved, not deleted** — the second section was repurposed into the video section; only the 24 fabricated review cards were removed
- **Nulo Studio notification removed** after initially being implemented as a `cc` (client direction)
- **Committed to branch `phase2a-lead-capture`, not `main`**, so the work can be reviewed before merging. Nothing pushed
- **Single commit covering both phases** — `js/indexJS.js` contains changes from both, and splitting would have required interactive hunk staging

### Lessons Learned

- **Boundary guards are worth the extra step.** After a user request, every removal/replacement over 50 lines asserted expected content at each boundary and threw on mismatch. This caught nothing silently and made a 406-line deletion and a 278-line CSS replacement safe.
- **Refactoring a function signature demands re-reading the body.** Bug #13 (`enforceCanonicalHeaders`) parsed fine, passed a syntax check, and would have quietly corrupted the `errorLog` headers forever. Only reading the refactored body caught it.
- **Write literal control characters as escapes.** Bug #10 survived a file write and looked plausible; only a byte dump revealed raw control bytes in the regex.
- **Verify before asserting.** The "FORESTRV" typo came from prior project notes; it was confirmed by opening the actual PNG rather than repeating the claim.
- **A mock harness pays for itself immediately.** Being able to run the real `.gs` modules on Node found real defects and proved both client-mandated guarantees without a Google account.
- **Shell command length is a real limit.** A single large PowerShell here-string failed with `ENAMETOOLONG`; the fix was a token-based approach — write the page with the file tool, then splice shared chrome with a short reusable command.
- **VM contexts don't expose top-level `const`.** Function declarations become properties of the sandbox; `const` does not. Needed an explicit re-export bootstrap in the test runner.

---

## Next Session Should Continue Here

**Phase 2A is code-complete. Phase 2B's first wave is complete.** Nothing is half-finished.

1. **Read `docs/projectState.md` first** — it is the source of truth for status, blockers, and who owes what.
2. **The single launch blocker is still deployment.** `businessConfig.estimateEndpoint` in `js/indexJS.js` is empty, so the form simulates success. Follow the 10-step sequence in `appsScript/README.md`. No code changes needed beyond pasting the `/exec` URL. Every lead the new location pages generate is currently discarded.
3. **Before writing any more SEO work, settle the production domain.** Canonical says `www.bluegridlandsolutions.com`; `CNAME` says `bluegridlandsolutions.nulostudio.com`. Sitemap, canonicals, and OG absolute URLs all depend on it — **14 pages today**, 19 once the second location wave ships. Writing them twice is avoidable.
4. **Phase 2B remainder:** location pages rows 7–11 (Jackson, Gallipolis, Waverly, Greenup, Louisa), the West Union / Flatwoods decision, `robots.txt`, `sitemap.xml`, canonical finalization, Open Graph, Lighthouse.
5. **Build new location pages to the shipped six, not to a template.** The bar is the uniqueness gate: worst pairwise 5-word-phrase overlap under 25%, 1,100+ body words, and content that breaks if the city name is swapped. Grayson (karst), Chillicothe (glacial line), and Morehead (cliff bands) are the clearest examples of what that means.
6. **Re-run `node appsScript/localTestRunner.js` after any `.gs` change.** Expect `passed: 64  failed: 0`.
7. Open decisions are listed under *Waiting on Client* and *Waiting on Aron* in `projectState.md`. The three that change engineering work: the deploying Google account, the domain, and whether Chase will supply price ranges for the location pages.
