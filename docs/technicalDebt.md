# Technical Debt — BlueGrid Land Solutions

**Last updated:** 2026-08-09

Known debt, deferred work, and intentional trade-offs. Items are ordered by launch impact, not by effort.

---

## High Priority

### 1. Production domain undecided
**The only outright launch blocker.**
Canonical tags say `https://www.bluegridlandsolutions.com/`; `CNAME` says `bluegridlandsolutions.nulostudio.com`. They disagree.
Gates canonical URLs and `og:url` on **all 24 pages** (29 once the second location wave ships), plus `sitemap.xml` and `robots.txt` — neither exists. Settle it *before* writing the SEO files or the work is done twice. Every affected tag carries a `TODO:` comment so one sweep catches all of them.

### 2. Badge artwork typo — "FORESTRV"
The official badge (`graphics/logos/web/bluegridBadge400.png`, `bluegridBadge192.png`) reads **"FORESTRV MULCHING & LAND CLEARING"** on the bottom arc — a V where the Y should be. Verified 2026-08-02 against the actual PNG.
Appears in the header, mobile menu, footer, and Facebook fallback on **every page**. Needs corrected source artwork from the client. Would be embarrassing in print or on a truck wrap.

### 3. Placeholder contact details still shipping
- Phone `(740) 464-2526` — TODO-marked, sourced from the flyer, never confirmed
- Email `estimates@bluegridlandsolutions.com` — a placeholder that may not exist

Both are wired through `businessConfig`, so each is a one-line fix — but shipping an unrouted email address loses leads silently.

### 4. Nothing has ever been checked in a real browser
No session on this project has had Playwright or Chrome DevTools available, so **every validation to date is static analysis or simulation.** That is strong for links, structure, schema, geometry, and the hero loop's state machine — and it says nothing about how anything *looks*.
Before launch: open the homepage on a real phone and confirm the hero photo ends at the fold, the seam into the estimate band is invisible, and the card overlap reads as intentional. Then a tablet and desktop pass covering the FAQ mega panel, the header morph across 1280px and 1150px, and the FAQ/Insights layouts.
**Added 2026-08-06:** the redesigned **services mega panel** has been measured but never seen — open it at 1440px and again at 1151px, where the calculation leaves only 62px between the panel and the left edge. And confirm the **hero typing** reads as intended now that it commits on the frame boundary; the profiler proves the cadence is regular, not that it looks right.
**Added 2026-08-07 (mega menus):** the two new featured icons — a map pin and a question mark — were drawn blind as SVG path data and have never been rendered. Check they read cleanly at 26px. Also confirm the muted region headings in Service Areas look deliberate rather than washed out, and that the hover bridge removed the flicker rather than making the panel sticky.

**Added 2026-08-07:** the **process sequence** is the largest untested-by-eye item on the site. The simulation proves the order and the viewport behaviour exactly; it says nothing about whether the dark board sits well on the white section, or whether the arrow flash is bright enough to read as a flash without being gaudy. Expect the timing constants in `processSequenceConfig` to need one tuning pass against a real screen.

**Added 2026-08-09 — the current list, in priority order:**

1. **The process handover at 1168px.** Load the homepage at 1200px, then 1170px, then 1160px. Above 1168px the board is horizontal at its full 1120px; below it, vertical. That boundary is what this session changed and is the direct answer to the clipping report — confirm the vertical layout is the better presentation there, and that nothing is cut off at any width.
2. **Phase A then Phase B.** Scroll the process section in and watch once: five steps reveal, then only the arrows should ever move again. Confirm **the arrows light at all during Phase B** — they are lit from a resting state, and an equal-specificity CSS collision there would leave the whole loop invisible. `lightArrow()` removes `isResting` first to prevent exactly that, but it has never been seen.
3. **Does the cumulative sweep read as intended?** The row should fill 1 → 1+2 → 1+2+3 → 1+2+3+4, hold with all four lit, then clear together. The open question is whether four simultaneously lit arrows read as *the progression completing* or just as four bright arrows — and whether the accumulation is legible at all at the arrow's 16px size and 0.26 → 1.0 opacity range. If it is not, the flash is the thing to strengthen, not the timing.
4. **Is 3.56s per pass right?** Phase B runs forever in the corner of the page: 420ms between arrows, a 1400ms hold, a 900ms pause. Too fast reads as a fidget. `loopStepMs` and `loopHoldMs` in `processSequenceConfig` are the two to tune.
5. **The Our Company panel** beside its three siblings at 1440px and again at 1201px, and the **shield-with-a-check featured icon**, drawn blind at 26px like the pin and question mark before it.
6. **The company page** top to bottom — it reuses eight existing interior-page components in a combination none of them have been seen in.
7. **The header at 1361px and 1360px**, where the compact band now starts, and at 1201px, the last desktop width.

### 5. No real lead has been created from the live site
The endpoint is wired and verified with read-only probes plus a honeypot POST that writes nothing. **A genuine submission has never been run by this project** — that path writes a row and emails both the owner and the customer, so it was not triggered unilaterally.
Run one and confirm the five outcomes in `appsScript/README.md` step 10, then check `errorLog` is still empty.

### 6. Service area pages: 6 of 13 cities have one
The `seoPlan.md` first wave shipped — Ashland, Portsmouth, Ironton, Chillicothe, Grayson, and Morehead.
Outstanding:
- **Rows 7–11** (Jackson OH, Gallipolis OH, Waverly OH, Greenup KY, Louisa KY) — staged for after the first six index. Their nav links still point at `#serviceAreas`, which resolves.
- **West Union, OH and Flatwoods, KY are advertised in the nav but appear nowhere in `seoPlan.md`'s 11-city table.** Either they get pages or they come out of the nav.

---

## Medium Priority

### 7. Location pages quote no prices
`seoPlan.md` content rule 5 asks location pages to answer cost directly with real ranges, and calls it the biggest opening in this trade because most competitors dodge it. **No page names a dollar figure** — no pricing has been approved, and inventing one would be a commitment the site cannot honour.
Each cost FAQ instead answers with the factors that move the price on that county's ground. Honest and locally unique, but the weaker answer.
**Fix: get rough per-acre or per-day ranges from Chase.** The single highest-value upgrade available, and it costs one conversation.

### 8. Thin photo library
13 images total for **24 pages**. Several are reused across service pages, location heroes, Insights heroes, and galleries.
Consequences already visible: two service pages (`stormCleanup`, `huntingPropertyPrep`) and **all 6 location pages** ship with no gallery, because no photo can be honestly captioned to a named town; and all 8 Insights pages use stand-in imagery (item 9).
Needs a real photo drop — ideally before/after pairs per service, **tagged by where they were taken**.

### 9. Insights imagery is placeholder
All eight Insights pages (landing + 7 articles) use existing BlueGrid job photos as stand-ins, each marked `TODO: PLACEHOLDER IMAGE` in the markup. They are real work photos so nothing is dishonest — but none was shot for its article and several repeat across pages.
The single biggest visual upgrade available to the section. Feeds directly off item 8.

### 10. Three homepage service cards hotlink Unsplash stock photos
Trail Cutting, Property Cleanup, and Hunting Property Prep load from `images.unsplash.com`. Two problems: a runtime dependency on a third party, and stock imagery on a site whose credibility rests on real work photos.
Deferred because replacing imagery needs client approval. Real unused photos exist (`cleanCut`, `freshMulching`, `overGrowth`, `whatTheyDo2`, `BeforeandAfter`).
**No new external hotlinks have been added since** — the Insights build deliberately used repo assets rather than making this worse.

### 10a. One duplicate FAQ question predates this session
**"Do I need a permit to clear land in Ohio or Kentucky?"** is rendered on **both `index.html` and `services/landClearing.html`**, with near-identical answers, and appears in both pages' `FAQPage` schema.
That violates `seoPlan.md`'s own rule ("No cross-page duplicate questions") and means two pages compete for the same query. Both were built in Phase 1, so it predates this session — it was found by the duplicate check written for the FAQ hub, which is the first thing that ever looked.
**Fix: decide which page owns it.** The permitting answer is service-agnostic, so the homepage or the new FAQ hub is the better home; `landClearing.html` would then drop the question and link across. Not done at closeout because it changes rendered content and schema on two pages and deserves a deliberate call rather than a rushed one.
Sitewide totals for reference: **103 rendered FAQ questions, 102 unique.**

### 10c. The hero typed line's `text-shadow` is the remaining per-character paint cost
`text-shadow: 0 3px 24px rgba(0, 0, 0, 0.55)` on `.heroTypedText` means every keystroke re-rasters the whole string with a 24px blur: a **926×125px** rect at 1440px, ~115k pixels, roughly twelve times a second while a phrase types.
The 2026-08-06 pass removed everything around it — the write now lands on a frame boundary, and `.heroTypedLine` holds its own compositing layer so the hero photograph underneath is no longer resampled (**8.0 megapixels/second** saved). The blur itself is irreducible without changing how the hero looks, and the brief said not to.
**Only worth revisiting if a real device shows the hero dropping frames.** Softening the blur to ~12px would roughly halve the raster cost, and it is a visible change that needs sign-off, not a quiet optimization.

### 10d. `.heroTypedLine` holds a compositing layer for the life of the page
`will-change: transform` is set permanently, not toggled, because the typing loop never ends. Costs one layer of roughly 926×125px — well under a megabyte, and zeroed under `prefers-reduced-motion` where nothing types.
One consequence worth knowing before someone "fixes" it: text in a promoted layer gets grayscale rather than subpixel antialiasing. **The line was already promoted for the first 2.2 seconds** via the `[data-heroanimate]` entrance, so this makes the rendering consistent rather than introducing something new — and at 41–74px display type the difference is not expected to be visible. Unverified, like everything else in item 4.

### 10e. ~~The process section's visual was built from a description~~ — the design is now APPROVED
Kept as a pointer, not as debt: the floating dark rectangle, five steps, four arrowheads and CTA-below were confirmed by Aron on 2026-08-07 and **must not be redesigned.** The animation behaviour was rewritten on 2026-08-09 (one-time reveal, then an arrow-only loop) without touching any of it. Original note follows.

### 10e-context. How that visual came to exist
The 2026-08-07 brief framed the work as animation-only on top of an established visual — a centred free-floating dark rectangle, arrowheads between steps, no connecting line, CTA below. **That visual did not exist in this repository.** What shipped was a white section with a horizontal gradient rule and no arrowheads, and no branch, stash, commit, or other client site under `ClientSites/` had the described version.
It was therefore built to the description rather than matched to a reference. Everything the brief specified is present, but proportions, board darkness, and arrow weight are this build's interpretation.
**Fix: one look in a browser.** If it does not match what was pictured, the visual lives entirely in `.processBoard` / `.processArrow` and can be retuned without touching the sequencer.

### 10f. Process CTA duplicates a destination already on the page
`.processCta` adds `Get My Free Estimate` → `#estimateForm` below the board on all 8 pages. The service pages already carry that same anchor in the page hero, so those pages now offer it twice.
That is normal for a long page — a CTA at the top and another after the explainer is standard — but it was added because the brief called for a CTA below the container, not because a gap was measured. Worth a glance when the section is reviewed; removing it is one line in the markup on 8 pages.

### 10g. ~~Process board clipping at narrower desktop widths~~ — ADDRESSED 2026-08-09, mechanism never found
Kept in full because the honest version of this is more useful than "fixed".

**The 143px figure that framed this was a mis-pairing.** "MAINTENANCE" does measure 143px uppercase in Rokkitt — re-measuring reproduced it exactly — but it is on `services/brushRemoval.html`, a **four**-step board, whose column at 1081px is **197px**, not the 147px of a five-step board. It has 54px of clearance. The widest word on the five-step homepage board is "COMPLETE" at 104px against 147px.

Checked properly — every rendered title on all eight boards, uppercased as `text-transform` renders them, against its own board's column, every width 1081–1440px, with a 6% fallback-face inflation — **nothing overflows anywhere.** The box model agrees: `.processStep` is `flex: 1 1 0` with `min-width: 0`, `box-sizing: border-box` is global, and there is no `100vw` in the process chain. The board **provably cannot** overflow its container at any width in the band.

**So the reported symptom has no mechanism I can find, and it was not fixed by finding one.** What changed is that the horizontal row no longer runs compressed at all: the handover moved from 1080px to **1167px**, derived as `1120px` (board `max-width`) + `2 × 1.5rem` (section padding) — the narrowest viewport at which the board can render at its design width. Below 1168px it was being squeezed to 147px columns against a design value of 164px, and that band is where the report came from.

`.processStepTitle` also gained `overflow-wrap: break-word`. **That is a guard for the next title someone writes, not a fix for a current overflow.**

**If Aron still sees clipping after this, the mechanism is genuinely outside the box model** — browser zoom, a device pixel ratio effect, or something the static model cannot represent — and the next session should get a real browser on it rather than re-deriving the arithmetic, which is now known to be clean.

### 10h. The Git remote URL is stale
GitHub reports the repository has moved to `https://github.com/ArxnAlley/client_BluegridLandSolutions.git`, but `origin` still points at `https://github.com/ArxnAlley/BluegridLandSolutions.git`.
Pushes currently succeed **via GitHub's redirect only.** That redirect stops working the moment anyone creates a new repository under the old name, at which point pushes would fail or — worse — land somewhere unintended.
**Fix:** `git remote set-url origin https://github.com/ArxnAlley/client_BluegridLandSolutions.git`. Requested on 2026-08-07 and then superseded by other work before it ran.

### 11. `robots.txt` and `sitemap.xml` do not exist
Deferred by instruction. Both depend on item 1. The sitemap needs **24 URLs**.

### 12. Open Graph not finalized
`og:image` and `og:url` use relative or placeholder-domain paths across all **24 pages**. OG images must be absolute to render in Facebook/iMessage previews. TODO-marked in every page head.

### 13. Chase owner introduction video missing
The section is built, video-ready, and ships a polished placeholder. Supplying it is a two-field config change — `introVideoUrl` + `introVideoConfigured` — with YouTube, Vimeo, and self-hosted all supported. No code debt; purely awaiting the asset.

### 14. Facebook embed disabled
`facebookPageConfigured: false`, so a designed fallback panel shows instead of the live Page Plugin. The real page URL is already in config. Needs someone to confirm the page renders in the plugin, then flip the flag.

### 15. Google Business Profile does not exist
`googleBusinessUrl` is empty; the footer icon is hidden at runtime rather than shipping a dead `#` link. Local SEO is meaningfully weaker without a GBP.
**Work has started outside the repository:** GBP service artwork is being staged locally in `graphics/GBP - Services/`, which is git-ignored by design (marketing collateral, not website assets). The playbook is `docs/phasePrompts/phase6GoogleBusinessProfile.md`.

### 16. Insights articles have no publication dates
By instruction: no visible date, no `datePublished`, no `dateModified`, no `<time>`. Each `Article` schema carries a comment explaining the omission.
Google does not require dates, but they help freshness signals and readers use them to judge relevance. When a publishing workflow exists, add them in the article data and drop the schema comments — **and relax the validator check, which currently fails if a date appears.**

---

## Low Priority

### 17. Shared chrome is duplicated across 24 pages
Header, mobile drawer, estimate modal, footer, and floating actions are copied into every page — roughly 900 lines × 24. Inherent to a no-build static site.
Mitigated: interior pages are generated by guarded assemblers, not hand-copied, and `applyBusinessConfig()` drives phone/email/social from one place at runtime. **A nav change now requires editing 24 files** — this session's two chrome passes each needed a scripted, guarded run to be safe. See *Consider a build step*.

### 18. Service-link path repointing has now been rediscovered three times
Service links have **three** path forms: root pages use `services/x.html`, pages inside `services/` use the bare sibling `x.html`, and every other one-level folder uses `../services/x.html`. Chrome spliced out of a `services/*.html` page therefore carries the sibling form and must be repointed.
Three separate one-shot generators have independently hit this — the second only after the link validator caught 63 broken references, the third (2026-08-06) caught before writing because its guard compared link sets first. Note the middle case is the one `projectState.md` used to describe as a two-variant rule; that has been corrected.
It belongs in the Phase 13 generator rather than in each script's memory.

### 19. Current page is not highlighted in the mega menus
`servicePageArchitecture.md` (Shared Template Anatomy, row 1) specifies it. Not implemented — the header block is byte-identical across all 24 pages. Confirmed at closeout: no `aria-current` or current-state class exists in either `js/indexJS.js` or `css/styleIndex.css`.
Now that all four panels share `.megaRow`, this is **one rule and one small routine for the whole system** rather than four implementations: mark the row whose `href` resolves to `window.location.pathname` and style `.megaRow[aria-current]`.
**Not done alongside the Our Company work on 2026-08-09**, though this note suggested it — that pass was held to its two stated objectives. Still worth doing, and now covers four panels and 24 pages.

### 20. ~~The 1150px header headroom is about to be spent~~ — SPENT AND RE-BUDGETED 2026-08-09
"Our Company" cost **144px including its gap**. The compact header went 988px → **1131px** and full spacing 1080px → **1236px**.

Both breakpoints moved, and neither typography, the phone chip, the CTA nor any spacing token was shrunk to make room:

- **Mobile switch 1150px → 1200px.** At 1151px the five-item bar had +20px on Inter and **−22px on the `'Segoe UI'` fallback** — it would have wrapped on first paint for a cold cache. At 1201px it clears by **+70px / +11px**. 1176px was the arithmetic minimum and left 4px, which is not a margin.
- **Compact band 1280px → 1360px.** With five items the *full-spacing* band became the tightest point on the whole sweep (+45px at 1281px), which is the wrong shape — the widest band should not be the one under pressure. 1360px is `.headerInner`'s own `max-width`: above it the inner is capped so full spacing always clears by 124px, below it every pixel of viewport is a pixel of header.

`validateHeader` now also sweeps a **6%-inflated fallback face**, so the criterion the switch was chosen on has a test. `measureHeader` **reads the primary nav out of `index.html`** rather than carrying its own copy — the old copy is why the model went on describing a four-item bar.

**Remaining headroom is real but finite: a sixth nav item would push the compact header past 1200px and force the switch up again.** Re-run `validateHeader` after any nav change.

### 21. Hero animation durations are duplicated between CSS and JS
`heroDuetConfig.forwardSweepMs` (1400) and `reverseDissolveMs` (1800) in `js/indexJS.js` must stay in lockstep with `transition: --heroSweepPos 1400ms` and `transition: opacity 1800ms` in `css/styleIndex.css`. Nothing enforces the pairing.
They agree today, and the loop now awaits the dissolve so a drift would show as a visible gap rather than a desync — but it would still be wrong. Cleanest fix: read the durations from CSS custom properties via `getComputedStyle`.

### 22. Orphan hero asset
`graphics/images/after.JPG` (427KB) was committed in `fb15070` alongside the hero refresh. **Re-verified at closeout: still referenced nowhere** in any HTML, CSS, or JS. It appears to be the previous `hero_after` image kept as a backup.
Harmless but it ships to visitors' hosting. Left in place because it is the client's asset, not one this project created — the 2026-08-07 GBP cleanup deliberately removed only the asset Aron named.

### 23. `dashboardMetrics` tab is created empty
`setupSpreadsheet()` creates the tab but writes no formulas. The formula set is specified in `docs/googleSheetArchitecture.md` but must be entered by hand. The dashboard SPA (Phase 2) computes its own numbers and does not read this tab, so nothing is blocked.

### 24. Photo upload not implemented
Phase 1 records `photoCount` and `photoNames` only; no bytes are uploaded and `photoUrls` stays `[]`. The owner email says so explicitly. `leads.addPhotos` is specced in `phase11PhotoUploadService.md`; `routes.gs` is the extension point.

### 25. No Lighthouse / performance pass yet
Deferred until the higher-priority items clear. Known candidates: hero images are full-resolution `2048×1536` with no responsive `srcset`; Google Fonts loads render-blocking.
**The hero typing animation is no longer on this list** — it was profiled and optimized on 2026-08-06 (see the journal entry and items 10c/10d). The two above are what remain.

### 26. Owner is not named on the site
Copy says "the owner" throughout because naming Chase publicly was never approved. For an owner-operated brand, naming him is likely stronger. One-line copy change once decided.

### 27. `MODULE_API_KEY` state cannot be verified from outside
`leads.list` returns `UNAUTHORIZED` identically whether the key is unset or merely not supplied. Only the Phase 2 dashboard depends on it; the public form does not.

---

## Future Improvements

- **Dashboard SPA (Phase 2)** — `leads.list` / `leads.update` and `MODULE_API_KEY` already exist and are tested; nothing has been built against them.
- **Weekly summary email** — `weeklySummaryDay` config key is seeded but unused; specced in `phase5Zapier.md`.
- **SMS alerts** — the one notification Apps Script cannot do natively; needs an email-to-SMS gateway or a webhook.
- **`leads.addPhotos`** (Phase 11) — client-side downscale, Drive upload, write URLs back.
- **Location × service pages** — beyond forestry mulching, only where search volume justifies genuinely distinct content.
- **`locations/` hub page** — the six location pages have no index of their own; the homepage `#serviceAreas` block and the Forestry Mulching "Where We Work" section stand in. Specced as part of Phase 13.
- **Insights growth** — the section is built to scale. A new article needs only a record in the content data; the uniqueness gate and the no-dates check already apply.
- **Structured data expansion** — `LocalBusiness` omits a street address (service-area business); revisit if the client wants one public.
- **Consider a build step** — the site is at 24 pages and item 17's duplication already costs scripted, guarded passes for any nav change. Phase 13 (`phasePrompts/phase13ServiceAreaExpansion.md`) specifies the generator; its stated trigger is "hand-maintenance of location pages exceeds ~12 files", and the shared chrome has arguably hit that first.

---

## Explicitly Not Debt

Recorded so future sessions do not "fix" them:

- **No ActivityLog sheet.** Deliberate. The `leads` sheet is the success record; `errorLog` captures failures only. A second log of successful traffic adds noise and quota cost.
- **Nulo Studio is not copied on lead emails.** Deliberate client decision — the studio must not sit in the customer's email thread. Operational problems surface in `errorLog`.
- **`leads.create` is a public endpoint.** Deliberate — a browser cannot hold a secret. The honeypot, validation, and dedupe are its gate.
- **`Content-Type: text/plain` on form POSTs.** Deliberate — Apps Script web apps cannot answer a CORS preflight, so `application/json` would fail from the browser.
- **The form's file input never uploads.** Deliberate Phase 1 scope; see item 24.
- **`leadId` is held for the whole page load, not per attempt.** Deliberate. The API dedupes on `leadId`, so a stable id lets a retry after a network failure collapse into the original row. The flow allows one submission per page load, so there is nothing to reset.
- **The unconfigured-endpoint branch in `submitEstimateRequest()` is unreachable.** Kept on purpose: it makes a blanked or mistyped endpoint obvious in the console instead of silently failing, and costs four lines.
- **Location pages do not link to each other.** Deliberate, per the Internal Linking Map in `seoPlan.md` — they pass authority up to the parent service page, not sideways. Nearby towns render as plain text pills, which is why `.nearbyList` styles `li` rather than `a`. Sitewide chrome *does* link to them; rule 4 allows that explicitly.
- **Location pages have no gallery.** No photo in the library can be honestly captioned to a named town. Adding one would mean labelling a Greenup County photo as Chillicothe work.
- **The FAQ mega menu links to service pages, not only the FAQ page.** Deliberate — several of the most common questions were already answered on a service page, and `seoPlan.md` bans restating them. The menu points at whoever owns the answer.
- **The FAQ hub shares no questions with the rest of the site.** Deliberate and enforced by a check. The site had 75 FAQs; the hub took the 28 that were left rather than competing with the service pages.
- **Mobile navigation does not render the mega menu.** Deliberate and instructed — a mega menu inside a full-screen drawer is worse than a short list.
- **The page assemblers are not in the repo.** New pages were generated once from guarded splices plus content data, then committed as plain static HTML. Phase 13 builds the real generator; shipping a half-generator now would leave two competing sources of truth.
- **CRLF working tree, LF index.** `core.autocrlf` is `true`, so Git normalises on commit and converts on checkout. Audited 2026-08-09: all 26 source files are CRLF on disk and LF in the index — **there is no mixture**, and the older note claiming some files were LF on disk was wrong. Nothing to fix; scripted edits detect and restore per file anyway.

---

## Resolved — moved out of debt

| Item | Resolved | Notes |
|---|---|---|
| Lead capture not live | 2026-08-03 | Production `/exec` wired; `ping` returns the matching `forestryModule` / `bluegrid` / `1.0.0` identity and a honeypot POST returns a correct envelope. |
| `BlueGrid Leads` spreadsheet did not exist | 2026-08-03 | Created; `setupSpreadsheet()` and `runSelfTest()` both passed. |
| Service area pages: 0 of 13 | 2026-08-02 | First wave of 6 shipped. Remainder tracked as item 6. |
| Hero background ran past the fold on mobile | 2026-08-03 | Media layer decoupled from section height. |
| Before/after transition stopped alternating | 2026-08-03 | Dissolve made awaitable; 92/92 cycles verified. |
| `hero_after` filename casing mismatch | 2026-08-03 | Normalized in git; all 3 references updated. |
| Desktop header wrapped between ~1100–1200px | 2026-08-03 | 101px of tightening plus the switch moved to 1150px. |
| Header compact values scattered as literals | 2026-08-03 | Twelve `:root` tokens; queries reduced to overrides. |
| Estimate form had no double-submit guard | 2026-08-03 | In-flight lock, disabled button, stable `leadId`. |
| Rowan County missing from coverage data | 2026-08-02 | Added to all four places; TODO-marked for client confirmation. |
| Services mega menu had no hierarchy and an odd-numbered hole | 2026-08-06 | Featured band plus three balanced groups of two; fit measured 1151–1600px. |
| Hero typing cadence irregular; character writes off the frame boundary | 2026-08-06 | Profiled first. Rendered cadence now equals the scheduled cadence exactly; write-to-paint 8.5ms → 0ms. |
| Typed line re-rastered the hero photograph on every keystroke | 2026-08-06 | `.heroTypedLine` promoted; 8.0 megapixels/second of photo resampling removed. Residual blur cost is item 10c. |
| Mega panel styling scattered as literals | 2026-08-06 | Nine `--mega*` tokens; the FAQ panel repointed at identical values, so nothing renders differently. |
| Process grid hardcoded to 5 columns while 7 of 8 pages had 4 steps | 2026-08-07 | Those pages had been rendering with an empty fifth column. Replaced with flex; nothing assumes a step count. |
| Process section was a static scroll-reveal | 2026-08-07 | Sequenced reveal with arrow flash/dim, viewport-triggered, looping. Order verified beat by beat in simulation. |
| Both chrome assemblers double-indented their output | 2026-08-07 | They sliced from the opening tag, leaving the line's own indentation in place. Fixed in both; the services mega panel was regenerated. |
| `drawLine` animation primitive orphaned | 2026-08-07 | Existed only to animate `.processTrack`; removed with it. |
| Three mega panels, three heading treatments, two CTA patterns | 2026-08-07 | One shell, one featured card, one row primitive, one group heading. Shared rules asserted to be declared exactly once. |
| Service Areas panel ran at half the width of its siblings | 2026-08-07 | `min-width: 420px` replaced by the shared 760px shell. |
| Mega panels jumped horizontally between nav items | 2026-08-07 | Positioning moved from `.navItem` to `.primaryNav`; all three land on one rectangle. Left clearance at 1151px went 62px → 214px. |
| Mega menu flickered when the pointer crossed the 14px gap | 2026-08-07 | Transparent bridge on `.megaPanel::before`. Pre-existing since the panels were built. |
| Services panel was the one exception to the path rule | 2026-08-07 | Bare siblings inside `services/` retired; two variants again sitewide. |
| Feature branch not merged | 2026-08-07 | `phase2a-lead-capture` fast-forwarded into `main` (`8108f94..bc4021d`), 17 commits, 0 deletions, validated on `main` before pushing. Branch kept. |
| Nothing pushed to origin | 2026-08-07 | `main` pushed; local and `origin/main` synchronized at `9237e53`. |
| GBP service graphic committed by accident | 2026-08-07 | 2.6MB asset the site never loaded, swept in by a broad `git add -A` in `235a4a3`. Removed in `9237e53` after verifying zero references. |
| GBP marketing assets appearing as untracked noise | 2026-08-07 | Repository's first `.gitignore`, one rule: `graphics/GBP - Services/`. Folder stays local and intact. |
| Process sequence reset and replayed the whole board forever | 2026-08-09 | Two phases as explicit forward-only states. `resetBoard()` deleted; the assembler guards it did not survive. Verified over 120s of virtual time: 5 reveals, none repeated, **0 un-reveals**, 0 step events after the reveal. |
| Phase B read as a point chasing along the row | 2026-08-09 | Rebuilt as a cumulative sweep: highlights accumulate to all four, hold, then clear together. `lightArrow()` is its own beat — reusing Phase A's `flashArrow()` would have dimmed each arrow on the way across. 25 passes verified, each peaking at four. |
| Site had no About page of any kind | 2026-08-09 | `company/index.html`, 24th page, built from the `faq/` donor with chrome carried byte for byte. 865 words, **zero new CSS**, `AboutPage` schema, verified claims only. |
| Fifth nav item did not fit the header | 2026-08-09 | Switch 1150→1200px, compact band 1280→1360px. Nothing shrunk. See item 20. |
| The header model carried its own copy of the nav | 2026-08-09 | `measureHeader` reads `index.html`. It had been describing a four-item bar. |
| Mega-menu row rules were services-branded | 2026-08-09 | Company classes joined the existing selector groups rather than copying declarations — one block, two names, so the panels cannot drift. |
