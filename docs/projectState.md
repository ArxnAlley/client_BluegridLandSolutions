# Project State — BlueGrid Land Solutions

**Last updated:** 2026-08-02
**Repository:** `c:/Dev/NuloWorkspace/ClientSites/client_BluegridLandSolutions/`
**Branch:** `phase2a-lead-capture` (branched from `main`, not yet merged, nothing pushed)

> Source of truth for resuming work. Only verified, completed work is recorded here.

---

## Current Phase

**Phase 2A — Lead Capture Infrastructure: code-complete.** Everything remaining is account-level work requiring Google credentials. Re-verified this session: `node appsScript/localTestRunner.js` → **64/64 passing**, built-in `runSelfTest` **6/6**.

**Phase 2B — Service Area Pages: first wave complete.** The six cities `seoPlan.md` stages as the Phase 7 build set are live and wired. Rows 7–11 (Jackson, Gallipolis, Waverly, Greenup, Louisa) have **not** been built.

**Phase 2C — Hero Mobile Refinement: complete.** The hero background is decoupled from the estimate form, the before/after transition alternates indefinitely, and the refreshed `hero_after` asset's filename casing is normalized.

**Header Navigation Polish — complete.** Desktop header no longer wraps at any width; spacing tightened by 101px and the mobile-nav switch moved from 1080px to 1150px.

**Phase 2D — Live Backend Connected: complete. Lead capture is live.** The production `/exec` URL is wired into the single shared config, verified against the running endpoint. **The project's oldest launch blocker is closed** — the form no longer discards submissions. The production domain is now the only outright blocker left.

Still deferred by instruction until the production domain exists: `robots.txt`, `sitemap.xml`, canonical finalization, Open Graph absolute URLs.

---

## Overall Objective

Take the existing BlueGrid Land Solutions website from "built but not launchable" to production launch:

1. Repair missing functionality and broken navigation
2. Complete missing content (service pages, service area pages)
3. Wire lead capture end to end (website → Apps Script → Sheet → owner email)
4. Final SEO, performance, and launch validation

---

## Completed

### Phase 1 — Website Completion

- **Full site audit.** Found 28 broken links (mega menu, mobile menu, 7 service cards, footer all pointed at `services/*.html` — none existed), no location pages, fabricated reviews, dead footer link, and a form that faked success.
- **7 service pages built** — `services/`: `forestryMulching`, `landClearing`, `brushRemoval`, `trailCutting`, `stormCleanup`, `propertyCleanup`, `huntingPropertyPrep`. **All 28 broken links now resolve.**
  Each has a unique hero + H1, intent block, 6 benefits, 4-step process, 5 unique FAQs, embedded estimate form with `serviceNeeded` preselected, related-services block, and breadcrumb — per `servicePageArchitecture.md`. **5 of 7 also have a gallery**; `stormCleanup` and `huntingPropertyPrep` ship without one because no apt photos exist (see `technicalDebt.md` item 7). Titles/descriptions taken verbatim from `seoPlan.md`. Three JSON-LD blocks per page (`Service`, `BreadcrumbList`, `FAQPage`). No duplicate content between pages.
- **`css/stylePages.css` created** — the shared interior-page stylesheet `servicePageArchitecture.md` specifies. Reuses existing tokens, buttons, forms, FAQ, and animation engine; no duplicated components.
- **Fabricated review carousel removed** (24 cards / 406 lines) and replaced with an honest placeholder using **client-supplied copy** ("Building Our Reputation One Property at a Time"), relocated below the Facebook section per the approved page flow.
- **Second section repurposed** into a video-ready owner introduction (`#meetTheOwner`) — headline, supporting copy, 16:9 embed container with play mark and "Introduction video coming soon", plus a supporting aside. The section slot was preserved, not deleted.
- **Video embed wired for later** — set `businessConfig.introVideoUrl` + `introVideoConfigured` in `js/indexJS.js` and nothing else. `buildVideoEmbedSource()` auto-detects YouTube (→ `youtube-nocookie`), Vimeo, or falls back to a self-hosted `<video>`.
- **Homepage flow confirmed** against the approved order: Hero → Trust Bar → Chase Intro Video → Services → Before & After → Why → Process → Service Areas → Facebook → Reviews → FAQ → Contact.
- **Dead code removed** — 102 lines of orphaned marquee CSS + all `[data-animate="reviewRow"]` rules. Zero references remain.
- **Bug fixes:** invalid `<figcaption>` nesting; dead footer Google link (now hidden until `googleBusinessUrl` is set); `getSourcePage()` was collapsing folders, losing per-page lead attribution; every page-specific JS listener null-guarded so the shared script survives on subpages; `viewWorkButton` no longer throws when `#beforeAfter` is absent.
- Added a dark→light divider between Facebook and Reviews, fixing a pre-existing abrupt transition.

### Phase 2A — Lead Capture Infrastructure

- **Apps Script web app written** — `appsScript/`: `Code.gs`, `routes.gs`, `leads.gs`, `validation.gs`, `notifications.gs`, `utilities.gs`, `config.gs`. Modular, one responsibility per file.
- **27-column `LEADS_HEADERS` contract implemented exactly** as specified in `forestryModuleSchema.md` — verified programmatically, byte-for-byte.
- **Sheet-first architecture.** The `leads` row is the audit trail: a submission succeeds the moment the row commits. Notifications are best-effort and cannot un-succeed a saved lead.
- **`errorLog` sheet** — failures only (timestamp, leadId, functionName, errorMessage, stackTrace). Records sheet-write failures, email delivery failures, validation failures, unexpected exceptions. **No ActivityLog** — the `leads` sheet already records every success.
- **Owner-only notification.** `Bluegridls@gmail.com` is the sole recipient; `replyTo` is the customer. Nulo Studio is not copied and does not sit in the customer thread. Plain-text + HTML bodies, both leading with name / phone / email / message / timestamp.
- **Customer auto-reply** with reference number, gated by `autoReplyEnabled`.
- **Security & robustness:** server-side honeypot, sanitization with control-character stripping, per-field validation, formula-injection defense, `LockService` locking, idempotent dedupe by `leadId`, canonical header self-heal on both sheets, plain-text cell forcing, recursion-guarded error logging that never records personal data.
- **`setupSpreadsheet()` is fully idempotent** — re-running creates no duplicate sheets, headers, config rows, or named ranges, and removes config keys retired by architecture changes.
- **Website form wired** — honeypot sent for server-side checking, non-OK HTTP handled, API field errors mapped back onto the actual inputs.
- **`localTestRunner.js`** — Node harness running the real `.gs` modules against in-memory Google mocks. **64/64 passing**, including the built-in `runSelfTest` at **6/6**.
- **Documentation:** `appsScript/README.md` (endpoints, 10-step deployment sequence, 12-case manual test plan) and `docs/googleSheetArchitecture.md` (tabs, columns, dropdowns, config keys, named ranges, Script Properties, verification checklist).

### Phase 2B — Service Area Pages (first wave)

- **6 location pages built** in `locations/`, using the hyphenated exact-match slugs `seoPlan.md` specifies:
  `forestry-mulching-ashland-ky`, `-portsmouth-oh`, `-ironton-oh`, `-chillicothe-oh`, `-grayson-ky`, `-morehead-ky`.
  These are rows 1–6 of the `seoPlan.md` location table — the documented first wave, chosen over 13 thin pages.
- **Each page carries genuinely local content**, not a city name swapped into a template: hero + H1, a three-paragraph local intent block, a four-tile fact grid (county, terrain, dominant growth, routes in), a terrain write-up with 3 supporting cards, 4 "what landowners here call us about" cards, all 7 services linked up with localized anchor text, **5 unique local FAQs**, the embedded estimate form with `serviceNeeded` preselected, and a nearby-communities block.
- **The uniqueness bar is enforced mechanically, not by memory.** Worst pairwise overlap across the six pages is **14.7%** of 5-word phrases against a 25% gate; body copy runs **1,133–1,283 words** per page. Swapping the city name genuinely breaks each page — Grayson is about karst and sinkholes, Chillicothe about the glacial line and fence rows, Morehead about cliff bands and slope limits, Portsmouth about river bottom versus hillside, Ironton about ridge-and-hollow and the Wayne boundary, Ashland about river-bench town lots.
- **All service-area links wired sitewide.** The 6 built cities now resolve to real pages from the mega menu, the mobile menu, and the footer service-area column on **all 14 pages**. The 7 cities without pages still point at the `#serviceAreas` anchor, deliberately.
- **New homepage block** — a "Forestry mulching, town by town" link row inside `#serviceAreas`, so the anchor the unbuilt cities point at now leads somewhere useful.
- **"Where We Work" block added to `services/forestryMulching.html`** — the parent service page for the location tier, and the only place body content links to location pages. Location pages link **up** (parent service page, homepage, all 7 services) and never sideways to each other, per `seoPlan.md`.
- **Three JSON-LD blocks per location page** — `Service` (with `areaServed` City + County), `BreadcrumbList` (Home › Forestry Mulching › City), `FAQPage`. Every schema FAQ question is verified to actually render on the page.
- **`css/stylePages.css`** — activated the previously unused `SERVICE AREA PAGES (locations/)` block and added three rules it was missing (`.localSection`, `.localProse`, `.localProblemGrid`). `.nearbyList` was changed from styling links to styling plain list items, because nearby towns must not be links.
- **Rowan County added to coverage data** — Morehead has always been advertised in the nav but Rowan County was absent from `serviceRegions`, the `LocalBusiness` `areaServed`, the map panel, and the homepage FAQ. All four now agree. **TODO-marked for client confirmation** (see Waiting on Client).
- **Validation:** 14 pages, **1,372 internal links and assets checked, zero broken**; every same-page and cross-page anchor resolves; one `<h1>` per page; zero duplicate IDs; tag balance across 16 element types; every JSON-LD block parses; titles and meta descriptions unique sitewide; `serviceNeeded` enum identical across all 14 pages and `config.gs`; CSS braces balanced; `node --check` clean on `js/indexJS.js`; Apps Script harness still 64/64.

### Phase 2C — Hero Mobile Refinement

- **Hero background decoupled from the estimate form.** `.heroMedia` was `inset: 0`, so on mobile — where `.heroInner` collapses to one column and the estimate card stacks below the copy — the photograph stretched to cover the whole doubled section and ran far past the fold. It is now pinned top-only with an explicit `height: var(--heroMediaHeight)` (`100lvh`, with a `100vh` fallback), and that one custom property drives the media band, the copy block, and the estimate band. Changing the form can no longer change the picture.
- **The estimate area is its own background band.** `.heroSection::after` paints from the media seam to the section bottom, opening in `--colorNearBlack` and settling into `--colorCharcoal`. `.heroOverlay` now lands on solid `--colorNearBlack` at the bottom of the media band, so the photograph dissolves into the band's opening colour and the seam is invisible. The estimate card rides **24px** up over that seam for the layered edge.
- **The fade lives on the overlay, not the plates** — a bottom `mask-image` on `.heroPlate` would have overwritten `.heroPlateAfter`'s mask, which *is* the sweep animation. A validator check now guards against exactly that.
- **Before/after transition alternates forever.** `fireHeroReverseDissolve()` was fire-and-forget with an 1800ms cleanup timer while the loop moved on after 220ms, so the stale cleanup from one cycle stripped the `isRevealed` of the next — the AFTER plate snapped away mid-sweep. It is now `fireHeroReverseDissolveAndWait()` and the loop awaits it. `fireHeroForwardSweepAndWait()` also gained an `error` fallback so an image that fails to load can no longer strand the loop permanently.
- **Hero asset casing normalized.** The refreshed image arrived as `hero_after.jpg` on disk while git still tracked `hero_after.JPG`; harmless on Windows, a 404 waiting to happen on case-sensitive hosting. Renamed in git and all 3 references updated.
- **Desktop untouched** — every layout change lives inside the `1080px` media query, and `--heroMediaHeight` does not exist above it. The typing animation and all typography were not modified.
- **Validation:** a VM harness ran the real `runHeroDuetLoop()` against a virtual clock for 10 minutes of page time — **92 cycles, perfectly alternating, 6.13–6.94s cadence, zero clipped reveals**; the same harness fails on the pre-fix code (90 of 108 reveals clipped). A layout validator parses the shipped stylesheet and confirms the copy block ends **exactly** on the seam with a **24px** card overlap at 360×640, 390×844, 430×932, 768×1024, and 1024×1366.

### Phase 2D — Live Apps Script Backend

- **Production endpoint wired** into `businessConfig.estimateEndpoint` in `js/indexJS.js`. Lead capture is live; the form no longer simulates success.
- **One source of truth, audited rather than assumed.** The endpoint appears exactly once in shipped code, all 14 pages load the same `js/indexJS.js`, and there is exactly one `fetch()` call site building its URL from the config value. No page inlines a handler; every `<form>` carries `action="#"`. A redeployment is a one-line change. Checks now enforce all of it.
- **Defect found by the post-wiring review and fixed — duplicate leads on a double-tap.** `submitEstimateRequest()` had no in-flight guard (`isLoading` was cosmetic; the button was never `disabled`), and `buildEstimatePayload()` minted a fresh `leadId` per call — so two taps produced two *different* ids that the API's `leadId` dedupe could not collapse. One visitor would have produced two rows, two owner emails, two auto-replies, and double MailApp quota. Harmless while the endpoint was empty; real the moment it was wired. Fixed with an in-flight lock, a genuinely disabled button, release on all three terminal paths, and a `leadId` held stable for the page load so a retry collapses into the original row.
- **Verified live against production, with zero side effects:** `ping` returns the matching `forestryModule` / `bluegrid` / `1.0.0` identity, confirming the deployed script is this repo's code; `leads.explode` → `UNKNOWN_ACTION`; `leads.list` without a key → `UNAUTHORIZED`; and a honeypot-tripped `POST leads.create` returns a correct success envelope — exercising the full transport chain (`text/plain`, no CORS preflight, Apps Script's 302, JSON envelope) while the server short-circuits before writing a row or sending mail.
- **Static contract check across all 14 pages:** 20 payload keys all mapping to `LEADS_HEADERS` columns except the honeypot; no server-owned column ever sent; all 5 required fields present; honeypot name/id/config agreement; every HTML enum value legal; all 9 element ids the payload reads present on every page; all 6 field-error targets present; POST + `text/plain` preserved; `leads.create` registered POST and unauthenticated; non-200, success, error, and rejection all handled; honeypot checked before the fetch; `leadId` format satisfying the server's own regex.

### Header Navigation Polish

- **Root cause.** `.headerInner` is a flex row whose items shrink before anything else gives, and nothing in the header carried `white-space: nowrap` — so once content stopped fitting, nav links and the phone number broke onto a second line inside a fixed-height bar. Measured against the real Inter/Rokkitt metrics the full-spacing header needs **1207px**, while the mobile switch sat at **1080px**: a 126px band where the desktop nav was live and could not fit.
- **Optimized first, 101px saved** (1207px → 1106px): nav link padding `0.95→0.7rem` (−40), header gap `1.6→1.1rem` (−16), nav list gap `0.4→0.25rem` (−10), brand badge `69→60px` (−9), header padding `1.5→1.25rem` (−8), phone chip padding `1→0.75rem` (−8), brand gap `1→0.75rem` (−4), chevron gap (−3), actions gap (−3). **The `Free Estimate` CTA padding was left untouched** so the primary CTA keeps its prominence; nav/phone/CTA font sizes were not changed.
- **The breakpoint did move.** Optimization alone was not enough — at 1100px the tightened header is still 6px short. The switch moved **1080px → 1150px**, which leaves **45px of slack** at 1151px, enough to absorb the wider `'Segoe UI'` fallback before Inter loads. 1200px would have worked but drops the desktop nav earlier than necessary.
- **Two structural choices.** The compact band starts at **1280px**, above the 1207px wrap point, so crossing it downward makes the bar roomier (74px → 174px slack) rather than snapping tighter; above 1280px nothing changed. And the switch is a **header-only** media query — the existing 1080px query also drives the hero and the services grid, so the six header rules were moved out rather than retargeting the whole query.
- **Tokenized and given a unified morph.** All compact-state values are now `:root` custom properties (`--headerPadX`, `--headerGap`, `--headerBrandGap`, `--headerBadgeSize`, `--headerBrandNameSize`, `--headerNavGap`, `--headerNavLinkPadX`, `--headerNavChevronGap`, `--headerActionsGap`, `--headerPhonePadX`, `--headerCtaPadX`, `--headerTransition`), so the `1280px` and `1150px` queries are token overrides only and all four header states share one vocabulary. Every dimension that differs between states animates on `--headerTransition` (`0.35s var(--easePremium)`, matching the header's existing scrolled-background timing); `prefers-reduced-motion` zeroes it in one declaration. The nav→hamburger swap itself cannot animate (`display` is not interpolable), but height, logo, and padding ease across the boundary.
- **Validation:** downloaded the real Inter 600/700 and Rokkitt 700 fonts and wrote a TrueType metrics parser, then **swept every integer width from 900 to 1600px** re-resolving the `:root` cascade at each. **Zero widths wrap**; tightest desktop width is 1151px at +45px. All twelve requested widths verified. Structural checks assert the nowrap guards, that every token is actually consumed by a rule, that no breakpoint overrides the CTA padding, that all eight rules animate on the shared token, and that no header rule was left behind in the 1080px or 640px queries.

---

## Currently In Progress

Nothing. The header polish is complete and committed. The session ended at a clean stopping point.

---

## Remaining Tasks

### Phase 2A / 2D closeout — DONE except one check
Steps 1–4 (spreadsheet, `.gs` paste, `setupSpreadsheet()`, `runSelfTest()`, Web App deployment, endpoint wired) are all complete.

1. **One real end-to-end submission from the live site.** Not run by this project: it writes a row and emails both the owner and the customer, which is not an action to trigger unilaterally. Confirm all five outcomes in `appsScript/README.md` step 10, then check `errorLog` is still empty.

### Phase 2B remainder
6. Location pages rows 7–11 — Jackson OH, Gallipolis OH, Waverly OH, Greenup KY, Louisa KY. `seoPlan.md` stages these after the first six index and rank. West Union OH and Flatwoods KY are advertised in the nav but are **not** in the `seoPlan.md` set at all — decide whether they get pages or come out of the nav.
7. `robots.txt` — deferred, depends on the domain
8. `sitemap.xml` — deferred, depends on the domain
9. Canonical URL finalization — **14 pages today**, 19 once rows 7–11 ship
10. Open Graph finalization (absolute URLs) — same 14 pages
11. Lighthouse / performance pass

---

## Blockers

| # | Blocker | Impact |
|---|---------|--------|
| 1 | **Production domain undecided** | Canonical says `www.bluegridlandsolutions.com`; `CNAME` says `bluegridlandsolutions.nulostudio.com`. Blocks `sitemap.xml`, `robots.txt`, canonicals, and OG absolute URLs across 14 pages. **The only outright launch blocker left.** |
| 2 | `MODULE_API_KEY` state unknown | Cannot be verified from outside — `leads.list` returns `UNAUTHORIZED` whether the key is unset or merely not supplied. Blocks only the Phase 2 dashboard, never the public form. |

Resolved this session: `estimateEndpoint` is wired and answering, and the `BlueGrid Leads` spreadsheet exists with `setupSpreadsheet()` and `runSelfTest()` both passed.

---

## Waiting on Client (Chase)

- **Owner introduction video** — section is built and video-ready; placeholder ships until supplied
- **Real project photos** — 3 service cards on the homepage still hotlink Unsplash stock (trail, property cleanup, hunting). Photo library is thin: 13 images total, now reused across 14 pages. **The 6 location pages ship without galleries** because no photo can be honestly captioned to a specific town
- **Confirm Rowan County / Morehead coverage.** Morehead was always in the nav but Rowan County was never in the coverage data. This session added it so the new page, the map panel, the schema, and the FAQ agree. If Chase does not actually work Rowan County, the Morehead page and the Rowan entries come back out
- **Price ranges.** `seoPlan.md` content rule 5 asks location pages to answer cost directly with real ranges — the strongest available SEO differentiator in this trade. No page quotes a dollar figure, because none has been approved. Every cost FAQ instead names the factors that move the price on that county's ground. Chase supplying even rough per-acre or per-day ranges would meaningfully strengthen all 14 pages
- **Copy review of the 6 location pages** — written in the owner's voice, describing local terrain and typical problems. No page claims a completed job in any named town
- **Confirm phone number** `(740) 464-2526` (TODO-marked, sourced from the flyer)
- **Confirm business email** — `estimates@bluegridlandsolutions.com` is a placeholder
- **Confirm Facebook page renders in the Page Plugin** → flip `facebookPageConfigured` to `true`
- **Google Business Profile URL** — none exists yet; footer icon stays hidden until provided
- **Decision:** may we name Chase on the site? Currently written as "the owner" throughout
- **Badge artwork typo** — the official badge reads **"FORESTRV"** instead of "FORESTRY" (verified 2026-08-02). Appears on every page. Needs a corrected asset before launch or print

## Waiting on Aron

- **Google Apps Script deployment** — full sequence in `appsScript/README.md`. This is the only thing standing between the current build and a site that captures leads
- **Decision: which Google account deploys.** `MailApp` sends *from the deploying account*, so that address becomes the "From" on Chase's alerts and every customer auto-reply. Changing it later means redeploying under the other account
- **Domain purchase / decision** — see Blocker 4
- **Final launch approval**
- **Merge `phase2a-lead-capture` into `main`** when satisfied

---

## Next Recommended Task

**Settle the production domain.** It is the only outright launch blocker left, and it gates four pieces of work at once — `robots.txt`, `sitemap.xml`, canonical finalization, and Open Graph absolute URLs across 14 pages (19 once the second location wave ships). Every affected tag is already `TODO:`-marked so one sweep catches all of them.

Two short checks should happen before launch regardless of the domain, neither requiring engineering:

1. **One real submission from the live site**, confirming all five outcomes in `appsScript/README.md` step 10.
2. **Open the site on a real phone.** No session on this project has had a browser available, so nothing has been visually confirmed — see `technicalDebt.md` item 18a.
