# Engineering Journal — BlueGrid Land Solutions

Append-only. Newest entry at the top.

---

## 2026-08-04 — SESSION SUMMARY (2026-08-02 → 2026-08-04)

> Session-level compaction. Each phase below has a detailed entry further down this file — this is the fast path for a session resuming cold.

### Summary

One continuous session covering six pieces of work: **Phase 2B** (first-wave service area pages), **Phase 2C** (hero mobile refinement), **Phase 2D** (connecting the live Apps Script backend), a **header navigation polish** and its **tokenization follow-up**, and a **navigation restructure with two new content sections**.

The site went from **8 pages with a form that silently discarded every submission** to **23 pages with live lead capture**, a location tier, an FAQ hub, and a resource centre.

### Files Created

**Location pages (6)** — `locations/forestry-mulching-{ashland-ky, portsmouth-oh, ironton-oh, chillicothe-oh, grayson-ky, morehead-ky}.html`

**FAQ hub (1)** — `faq/index.html`

**Insights (8)** — `insights/index.html` plus `benefits-of-forestry-mulching`, `brush-hogging-vs-forestry-mulching`, `when-to-clear-overgrown-property`, `preparing-land-for-building`, `storm-cleanup-best-practices`, `fence-line-clearing-tips`, `signs-your-property-needs-land-management`

### Files Modified

- `index.html` — service-area link wiring, town-by-town block, Rowan County in schema/map/FAQ, nav restructure, `hero_after` casing
- `services/*.html` (7) — service-area link wiring, nav restructure; `forestryMulching.html` additionally gained the "Where We Work" block
- `locations/*.html` (6) — nav restructure (after being created earlier in the session)
- `js/indexJS.js` — `rowan` service region; hero dissolve made awaitable + forward-sweep `error` fallback; production `/exec` endpoint; double-submit guard and stable `leadId`
- `css/styleIndex.css` — hero media decoupling, estimate band, overlay fade; header anti-wrap guards, compact band, 1150px switch, twelve `:root` tokens, unified `--headerTransition`; `.megaPanelFaq` and contents; `.serviceAreaTowns*`
- `css/stylePages.css` — location-page components (`.localSection`, `.localProse`, `.localProblemGrid`, `.nearbyList`), FAQ page components, Insights components
- `graphics/images/hero_after.JPG` → `hero_after.jpg` (git rename)
- All three `docs/` files

### Architecture Decisions

1. **Six location pages, not thirteen.** `seoPlan.md` rows 1–6 with genuinely local content over 13 doorway pages. The 7 cities without pages still point at the `#serviceAreas` anchor.
2. **Location pages link up, never sideways** — parent service page, homepage, all 7 services. Nearby towns are plain text, which is why `.nearbyList` styles `li` not `a`. Sitewide chrome *does* link to them; `seoPlan.md` rule 4 blesses that explicitly.
3. **Hero media decoupled from section height** rather than shrunk. An `inset: 0` layer is coupled to its container's content; every fix that is not decoupling is a workaround.
4. **The hero fade lives on `.heroOverlay`, not `.heroPlate`** — a bottom `mask-image` on the plates would overwrite `.heroPlateAfter`'s mask, which *is* the sweep animation.
5. **One endpoint, one call site.** Already true; this session verified it rather than assuming, and added checks so it stays true.
6. **`leadId` is stable for the page load** so the server's dedupe can collapse a retry into the original row.
7. **Header compact band starts at 1280px, above the 1207px wrap point**, so crossing it makes the bar roomier rather than snapping tighter.
8. **The mobile-nav switch is a header-only media query** — the existing 1080px query also drives the hero and services grid, and retargeting it would have been a redesign of sections nobody asked about.
9. **Header dimensions are `:root` tokens** with a single `--headerTransition`; reduced motion zeroes the whole morph in one declaration.
10. **New pages live one level deep** (`faq/index.html`, `insights/*`) so they reuse the proven one-level chrome instead of needing a third path variant.
11. **The FAQ hub carries only new questions.** The site had 75; `seoPlan.md` bans duplicates; the hub took the 28 that were left.
12. **The FAQ mega menu links to whoever owns the answer** — several items point at service pages rather than the FAQ page.
13. **Generators stay in the scratchpad.** Phase 13 owns the real one; shipping a half-generator would create two competing sources of truth.

### Validation Performed

- **23 pages, 2,407 internal links and assets, zero broken.** Every same-page and cross-page anchor resolves.
- Location-page uniqueness: worst pairwise 5-word-phrase overlap **14.7%** (gate 25%), 1,133–1,283 body words.
- Insights uniqueness: worst pairwise overlap **0.3%**, 550–900 body words.
- **Zero duplicate FAQ questions introduced** — the hub's 28 cross-referenced against every question elsewhere on the site. The check also surfaced one *pre-existing* duplicate between `index.html` and `services/landClearing.html` (technicalDebt item 10a).
- Nav order parsed from rendered markup on all 23 pages; mega-menu structure, `aria-expanded`/`aria-controls` wiring, and preview length checked per page; mobile drawer confirmed to carry exactly two items and no mega markup.
- Header: **every integer width 900–1600px** re-measured against the real Inter/Rokkitt metrics — zero wrapping, tightest desktop 1151px.
- Hero seam geometry exact (0px error) with 24px card overlap at 360×640, 390×844, 430×932, 768×1024, 1024×1366.
- Titles and meta descriptions unique sitewide; every JSON-LD block parses; every schema FAQ question verified to render.

### Tests Executed

| Harness | Result |
|---|---|
| `appsScript/localTestRunner.js` | **64/64**, `runSelfTest` 6/6 |
| Hero duet loop simulation (10 min page time) | **92/92 alternating**, 6.13–6.94s cadence — *and fails on the pre-fix code, 90 of 108 reveals clipped* |
| Sitewide link/structure validator | 23 pages, 2,407 references, 0 broken |
| Navigation & new-page validator | PASS |
| Header width sweep 900–1600px | PASS |
| Hero layout validator (5 viewports) | PASS |
| Lead-flow contract validator | PASS |
| Live endpoint probes (`ping`, unknown action, unauthorized, honeypot POST) | All correct, zero side effects |
| `node --check js/indexJS.js` | clean |

### Bugs Found

**Pre-existing, fixed**
1. Hero before/after loop desynced — stale cleanup timer stripped the next cycle's `isRevealed`.
2. `fireHeroForwardSweepAndWait()` could hang forever if the AFTER plate failed to load.
3. `hero_after` filename casing mismatch between disk and git — a 404 waiting on case-sensitive hosting.
4. Desktop header wrapped across a 126px band (1081–1207px).
5. **No double-submit guard on the estimate form** — harmless while the endpoint was empty, a data-integrity defect the moment it went live.
6. Rowan County absent from all four places the site lists counties, while Morehead was advertised in the nav.

**Pre-existing, found and logged (not fixed)**
7. Current service is not highlighted in the mega menu, contrary to `servicePageArchitecture.md`.
8. Orphan asset `graphics/images/after.JPG`, referenced nowhere.

**Mine, caught by guards before shipping**
9. Generated location pages had mixed line endings (CRLF from template literals, LF from spliced chrome).
10. Chrome splice left seven mega-menu service links resolving inside `insights/` — the location builder had a repointing step the new builder initially lacked.
11. Two unescaped ampersands (category labels, one `og:title`).
12. One Insights article under the thin-content word floor.
13. `.nearbyList` top margin stacked with the lede's bottom margin.

**In validators, not the product** — a harness that started two concurrent hero loops; a mega-panel slice that stopped at the first `</li>`; an article-uniqueness check measuring shared boilerplate; a "no dates" check matching its own explanatory comment; an enum comparison tripping on line endings.

### Bugs Fixed

All of 1–6 and 9–13. Items 7 and 8 are logged in `technicalDebt.md` (18 and 15b).

### Performance Improvements

- Header spacing tightened by **101px**, and the nav restructure removed a further **127px** — the header now needs 1080px of viewport where it once needed 1207px.
- No regressions introduced: no new external hotlinks, no new render-blocking resources, no new fonts. Insights images reuse existing repo assets.
- **Not done:** the Lighthouse pass. Hero images remain `2048×1536` with no `srcset`, and Google Fonts still loads render-blocking.

### UX Improvements

- Mobile hero no longer runs hundreds of pixels past the fold; the estimate card sits on its own band with a deliberate 24px overlap.
- The before/after transition now alternates indefinitely at a consistent 6.1–6.9s cadence instead of stalling every few cycles.
- Desktop nav no longer wraps at any width; transitions between desktop, compact desktop, and mobile are animated on one shared curve, and respect `prefers-reduced-motion`.
- A double-tap on the estimate submit button can no longer produce duplicate leads or a permanently locked form.
- The FAQ mega menu answers common questions in the nav itself; mobile deliberately stays a short list.

### SEO Improvements

- **15 new indexable pages**: 6 location, 1 FAQ hub, 8 Insights.
- Location pages target the money keyword per city with genuinely local content that fails the city-swap test by design.
- New structured data: `Service` ×6 and `FAQPage` ×6 on location pages, `FAQPage` on the hub, `Article` ×7, `ItemList`, and `BreadcrumbList` on every new page.
- `LocalBusiness` `areaServed` extended with Rowan County so schema matches the advertised coverage.
- Internal linking materially strengthened: mega menu → FAQ hub and service pages; "Where We Work" → location tier; every Insights article → its parent service page and the FAQ; the FAQ hub → all seven service pages.
- Titles and meta descriptions verified unique across all 23 pages.
- **No duplicate FAQ questions introduced**, enforced by a check rather than by memory. The same check surfaced one pre-existing duplicate from Phase 1 (technicalDebt item 10a).

### Lessons Learned

- **A passing test proves nothing until it has failed.** The hero-loop harness only earned trust once it reproduced the reported symptom against the pre-fix code.
- **Wiring an endpoint changes which bugs are real.** The double-submit hole existed all along and cost nothing until the URL was set.
- **Measure instead of estimating when the answer is a number.** Parsing the real font files turned the breakpoint from a judgement call into arithmetic.
- **A rule is only real if something checks it.** `seoPlan.md` had banned duplicate questions since day one; writing the cross-reference check is what turned that into a constraint that shaped the FAQ page.
- **Validators fail in both directions.** Roughly a third of this session's "bugs" were in the checking code; every failure needed reading before acting.
- **The same splice bug twice means the splice needs a home.** `repointServiceLinks()` has now been written twice in two one-shot generators.

### Important Decisions

- **Committed to `phase2a-lead-capture`, never pushed**, so all of this can be reviewed before it reaches `main`.
- **No dollar figures anywhere.** No pricing has been approved; inventing ranges would be a commitment the site cannot honour. Logged as the highest-value client ask.
- **No fabricated publication dates** on Insights — none visible, none in schema, with a comment explaining the omission.
- **Placeholder imagery is marked, not disguised** — real BlueGrid photos standing in, each `TODO:`-commented, and no new external hotlinks added.
- **Before & After was removed from the primary nav** on a literal reading of the brief's four-item order. Flagged for confirmation; it remains reachable from the hero CTA and the footer.
- **The 1150px header breakpoint was left alone** even though the nav restructure gave it 163px of slack, because moving it was outside that request.

---

## Next Session Should Continue Here

**Everything through Phase 2D is complete and committed at `863842c`. The working tree is clean and all eight validation suites pass.**

1. **Read `docs/projectState.md` first.** It carries the repository status, the ordered task list, and who owes what.
2. **The only outright launch blocker is the production domain.** Canonicals say `www.bluegridlandsolutions.com`; `CNAME` says `bluegridlandsolutions.nulostudio.com`. It gates `robots.txt`, `sitemap.xml`, canonical finalization, and Open Graph across **23 pages** — all already `TODO:`-marked so one sweep closes them.
3. **Two zero-engineering checks are outstanding:** one real lead submission from the live site (it emails the owner and the customer, so it was not triggered unilaterally), and **a real browser pass — no session on this project has ever had one.**
4. **Before editing any page programmatically:** line endings are mixed per file (see *Current Repository Status*), and chrome spliced from `services/` needs its seven service links repointed to `../services/…`.
5. **Before adding a nav item:** re-run the header width sweep. There is 163px of slack at 1151px today, and a new label consumes it.
6. **After any `.gs` change:** `node appsScript/localTestRunner.js`, expect `passed: 64  failed: 0`.
7. **New content must clear the uniqueness gate** — under 25% pairwise 5-word-phrase overlap, and no FAQ question may duplicate one already on the site. Current totals: **103 rendered FAQ questions, 102 unique** — the gap is one pre-existing duplicate between `index.html` and `services/landClearing.html`, logged as `technicalDebt.md` item 10a.

---

## 2026-08-04 — Navigation restructure, FAQ hub, and Insights

### Summary

Replaced Reviews with Insights in the primary nav, turned FAQ into a desktop mega menu, and built two new sections: a dedicated FAQ hub and an Insights resource centre with seven launch articles. The site went from 14 pages to **23**.

### Files Created

- `faq/index.html` — 28 questions across 6 categories
- `insights/index.html` — the resource centre landing page
- `insights/{benefits-of-forestry-mulching, brush-hogging-vs-forestry-mulching, when-to-clear-overgrown-property, preparing-land-for-building, storm-cleanup-best-practices, fence-line-clearing-tips, signs-your-property-needs-land-management}.html`

### Files Modified

- All 14 existing pages — nav tail replaced, mobile drawer simplified, footer FAQ link retargeted with Insights added
- `css/styleIndex.css` — `.megaPanelFaq` and its contents
- `css/stylePages.css` — FAQ page and Insights components

### Navigation

Final order is **Services · Service Areas · FAQ · Insights**.

**A judgement call worth flagging:** the brief said to remove Reviews and replace it with Insights, then gave the resulting order as a four-item list that does not include *Before & After*. Read literally that is a complete specification, so Before & After came out of the primary nav. It remains reachable from the homepage hero CTA ("See Transformations") and from the footer Quick Links, so nothing is orphaned — but if the intent was a five-item nav, putting it back is a one-line change.

### FAQ Mega Menu

Nine questions, each a bold question plus a two-sentence preview, two-up in a 760px panel capped against the viewport so it cannot overhang at the narrowest desktop width. A "View All FAQs" CTA sits under a divider.

**The nine items do not all point at the FAQ page.** Several of the most common questions were already answered elsewhere — "What is forestry mulching?" on the homepage and the mulching service page, "Do you remove stumps?" on land clearing, "Do you haul debris away?" on property cleanup. Those link to the page that owns the answer; the rest link to `faq/index.html#anchor`. That keeps the mega menu genuinely useful without restating answers that already exist, which `seoPlan.md` forbids.

Mobile is deliberately two plain links. A mega menu inside a full-screen drawer is worse than a short list, and the brief asked for it to stay simple. A check fails if mega-menu markup ever leaks into the drawer.

### FAQ Page

Six categories — Estimates & Getting Started, Choosing the Right Service, On Your Property, Equipment & Conditions, After the Job, Payment & Paperwork — with a jump-link card grid at the top and the existing accordion component for the answers. Every question anchors individually so the mega menu can deep-link to it. It carries the `FAQPage` schema and links out to all seven service pages.

**All 28 questions are new.** The site already had 75 FAQs across the homepage, service pages, and location pages, and `seoPlan.md` bans duplicate questions across pages. Rather than build a hub that restates and competes with the service pages, the hub took the territory nobody had covered: insurance, deposits, 811 locates, property lines, livestock and gates, ground pressure, weather delays, what the ground looks like afterward, whether the mulch attracts pests. A validator now cross-references all 74 questions elsewhere on the site and fails on any collision.

### Insights

Seven articles, 550–900 body words each, worst pairwise 5-word-phrase overlap **0.3%**. Each has an `Article` schema, a breadcrumb, related-reading cards, a link to its parent service page, and a link back to the FAQ.

**No dates anywhere**, as instructed — no visible date, no `datePublished`, no `dateModified`, no `<time>` element. The schema comment explains why rather than leaving a future reader guessing. A check enforces it.

**Hero and card images are real BlueGrid job photos standing in for topic-specific photography**, each marked with a `TODO: PLACEHOLDER IMAGE` comment in the markup. No new external hotlinks were introduced — `technicalDebt.md` item 6 already complains about the Unsplash ones on the homepage and adding more would have made that worse.

### Validation Performed

- **23 pages, 2,407 internal links and assets, zero broken.** Every same-page and cross-page anchor resolves.
- Nav order verified on all 23 pages by parsing the rendered markup, not by trusting the generator. Reviews confirmed absent from every primary nav.
- Mega menu: 9 questions and 9 previews on every page, CTA present, `aria-expanded` / `aria-controls` / panel id wiring intact, every preview ≤3 sentences.
- Mobile drawer: exactly two items, no mega markup, on all 23 pages.
- FAQ page: all 6 category sections and jump links present, all 28 question anchors present, 28 accordions rendered, every mega-menu deep link resolves, all 7 service cross-links present.
- **Zero duplicate questions** against the 74 elsewhere on the site.
- Insights: every article linked from the landing page, word counts above the thin-content floor, no dates, placeholder images marked, service and FAQ links present.
- Regression suite unchanged: hero seam exact on five viewports, hero loop 92/92 alternating, lead flow contract clean on all 23 pages, header sweep 900–1600 with zero wrapping, `node --check` clean, Apps Script 64/64.

### A Consequence Worth Recording

The new nav is **127px narrower** than the old one (450px vs 577px) — FAQ and Insights are shorter labels than Before & After plus Reviews plus FAQ. The header now needs **1080px** of viewport rather than 1207px, so at 1151px there is **163px of slack** instead of 45px.

The 1150px mobile breakpoint was therefore left alone but is now more conservative than it needs to be: the desktop nav would survive comfortably to roughly 1105px. Moving it was not part of this request and the previous session chose 1150 partly for webfont-fallback margin, so the headroom is recorded in `technicalDebt.md` rather than spent unilaterally.

### Bugs Found

**Mine, caught by the guards**

1. The chrome was spliced from `services/forestryMulching.html`, where the seven mega-menu service links are relative to that folder — so every new page linked to `insights/forestryMulching.html`. The location-page builder had a `repointServiceLinks()` step for exactly this; I forgot it. The link validator caught all 63 instances.
2. Two genuinely unescaped ampersands: the category labels ("Payment & Paperwork") and one `og:title`. The ampersand guard caught both.
3. `when-to-clear-overgrown-property` came in at 537 body words, under the thin-content floor. Added a section on what waiting actually costs.

**In the validator, not the product**

4. The mega-panel check sliced to the first `</li>`, which closes the first question rather than the panel — it reported 1 question on every page.
5. The article uniqueness check measured `<main>`, which includes the shared hero, breadcrumb, related cards, and estimate form. That reported 26.1% overlap for what is almost entirely template. Measuring the prose only gives 0.3%.
6. The "no dates" check matched the schema comment explaining why dates are absent.

### Lessons Learned

- **The same splice bug twice means the splice needs a home.** `repointServiceLinks()` has now been written twice in two different one-shot generators. Phase 13's real generator should own it rather than each script rediscovering it.
- **A duplicate-content rule is only real if something checks it.** `seoPlan.md` has banned duplicate questions since the start; writing the cross-reference check is what turned that from an intention into a constraint, and it shaped the whole FAQ page — the 28 questions are the ones that were left after subtracting 75.
- **Validators fail in both directions.** Three of this session's six "bugs" were in the checking code. A failing check is a hypothesis, not a verdict; each one needed reading before acting.

---

## 2026-08-03 — Header navigation polish

### Summary

The desktop header wrapped between roughly 1100px and 1200px. Tightened the spacing to buy 101px, then moved the mobile-nav switch from 1080px to 1150px, because even fully optimized the bar still could not fit at 1100px.

Measured rather than eyeballed: this session pulled the real Inter and Rokkitt font files and wrote a minimal TrueType metrics parser, so every number below is an advance-width measurement, not an estimate.

### Files Modified

- `css/styleIndex.css` — anti-wrap guards on the base header rules; new `@media (max-width: 1280px)` compact band; new `@media (max-width: 1150px)` mobile-nav switch; the six header rules that used to live in the `1080px` query moved into it

### The Audit

`.headerInner` is a flex row whose items shrink before anything else gives, and nothing in the header carried `white-space: nowrap` — so once the content stopped fitting, the nav links and the phone number broke onto a second line inside a fixed-height bar.

Measured, the full-spacing header needs **1207px** of viewport:

| Part | Width |
|---|---|
| Brand lockup (badge 69 + gap 16 + text 118) | 203px |
| Primary nav — Services 112, Service Areas 150, Before & After 135, Reviews 92, FAQ 62, plus gaps | 577px |
| Phone chip | 171px |
| Free Estimate | 142px |
| Two 25.6px header gaps + 48px padding | 99px |
| **Viewport required** | **1207px** |

The mobile switch sat at 1080px, so **1081–1207px was a 126px-wide band where the desktop nav was live and could not fit.** That is exactly the reported symptom.

### Optimization First

Every requested lever, applied cumulatively and measured:

| Change | Saved |
|---|---|
| Nav link padding `0.95rem` → `0.7rem` | 40px |
| Header gap `1.6rem` → `1.1rem` | 16px |
| Nav list gap `0.4rem` → `0.25rem` | 10px |
| Brand badge `69px` → `60px` | 9px |
| Header padding `1.5rem` → `1.25rem` | 8px |
| Phone chip padding `1rem` → `0.75rem` | 8px |
| Brand lockup gap `1rem` → `0.75rem` | 4px |
| Nav chevron gap `0.4rem` → `0.3rem` | 3px |
| Header actions gap `0.9rem` → `0.7rem` | 3px |
| **Total** | **101px** |

**The `Free Estimate` CTA padding was deliberately left alone.** Shrinking the primary CTA is what makes a header read as cramped rather than tidy, so everything else gave ground first. Nav, phone, and CTA font sizes were also untouched — that would be changing typography. The only type change is the brand mark, which the brief explicitly allowed to shrink and which the stylesheet already shrank at smaller widths.

### The Breakpoint Did Move — and Optimization Alone Was Not Enough

Optimized, the header needs **1106px**. At a 1100px viewport that is still **6px short**. Leaving the switch at 1080px would have left a small but real broken band at 1081–1106px, so the switch moved to **1150px**.

Why 1150 and not 1100 or 1200:

- **1100px fails outright** — 6px of overflow.
- **1130px** is the bare minimum for 24px of slack, with nothing spare.
- **1150px** leaves **45px of slack** at 1151px, the last desktop width. That margin matters because `--fontBody` falls back to `'Segoe UI'`, which is wider than Inter; without headroom the header would wrap during the brief window before the webfont loads.
- **1200px** would work but drops the desktop nav earlier than it needs to, against the instruction to keep it active as long as it stays clean.

1150px keeps the desktop nav on every common laptop width (1280, 1366, 1440, 1600) and on iPad-class landscape viewports of 1180–1194px.

### Two Deliberate Structural Choices

1. **The compact band starts at 1280px, not at the 1207px wrap point.** Crossing 1280 downward therefore makes the bar *roomier* (74px slack → 174px), never tighter. A band that began at the wrap point would have produced a visible snap exactly where the layout was already under strain. Above 1280px nothing changed at all.

2. **The switch is a header-only media query.** The existing `1080px` query also drives the hero, the services grid, and other section layouts. Retargeting the whole query to 1150px would have moved all of that — a redesign of sections nobody asked about. The six header rules were moved out into the new `1150px` query and the `1080px` query kept everything else. A check now fails if a header rule reappears in the `1080px` block.

### Validation Performed

- Downloaded the real **Inter 600/700 and Rokkitt 700** from Google Fonts (legacy UA → EOT, TTF payload extracted from the wrapper) and wrote a `head`/`hhea`/`hmtx`/`cmap`-format-4 parser. Kerning is ignored on purpose: it almost always subtracts width, so omitting it errs wide, which is the safe direction for a fit question.
- **Swept every integer width from 900 to 1600px**, resolving which tokens apply at each and re-measuring. **Zero widths wrap.** The tightest desktop width is **1151px with 45px of slack**.
- All ten requested widths verified: 1600/1440/1366 clean at +153px, 1280 at +174px, 1200 at +94px; 1100/1024/992/900/768 on the hamburger.
- Transition continuity asserted — the compact band must not reduce slack at its own boundary.
- Structural checks: `white-space: nowrap` on `.navLink`, `.phoneChip`, `.headerCta`, `.brandName`, `.brandNameSub`; `flex-wrap: nowrap` on `.navList`; `flex-shrink: 0` on `.primaryNav` and `.headerActions`; the CTA's padding absent from the compact band; the `1150px` query genuinely hiding the nav/phone/CTA and showing the hamburger; no header rule left behind in the `1080px` query.
- Regression suite unchanged: 14 pages / 1,372 links and assets / zero broken; hero seam exact on five viewports; hero loop 92/92 alternating; lead flow contract clean on all 14 pages; `node --check` clean; Apps Script 64/64.

### Not Verified

Still no browser. The arithmetic is measured from the real fonts and the real stylesheet, but nothing was rendered — the mega-panel drop shadows, the hamburger's optical alignment at 1150px, and the general feel of the compact band have not been seen. Covered by `technicalDebt.md` item 18a.

### Follow-up refactor — tokens and a unified morph

Requested after the first commit; no visual change, every measured width reports identical slack.

**Twelve `:root` tokens** replaced the duplicated layout rules: `--headerPadX`, `--headerGap`, `--headerBrandGap`, `--headerBadgeSize`, `--headerBrandNameSize`, `--headerNavGap`, `--headerNavLinkPadX`, `--headerNavChevronGap`, `--headerActionsGap`, `--headerPhonePadX`, `--headerCtaPadX`, `--headerTransition`. The `1280px` and `1150px` queries became **token overrides only**, and the `.brandBadge` / `.brandName` rules that were duplicated in the `1150px` and `640px` queries are gone — both sizes now come from tokens, so all four header states are described in one vocabulary. Only header variables were added; nothing existing was refactored.

`--headerCtaPadX` exists specifically so the CTA's constancy is explicit rather than incidental. A check fails if any breakpoint overrides it.

**One shared timing.** Every dimension that differs between states animates on `--headerTransition` (`0.35s var(--easePremium)`), matching what `.siteHeader` already used for its scrolled background: `.headerInner` gap/height/padding, `.brandLockup` gap, `.brandBadge` width/height, `.brandName` font-size, `.navList` gap, `.navLink` gap/padding, `.headerActions` gap, `.phoneChip` padding. Hover colour keeps its quicker 0.25s timing — only layout properties ride the shared curve.

The switch itself cannot animate: `display` is not interpolable and there is no honest tween from a five-item nav to a hamburger. But the bar's height, logo, and padding still ease across it, so 1150px reads as the header resolving into its compact form rather than a jump cut.

`prefers-reduced-motion` sets `--headerTransition: 0s`, which kills the entire morph in **one declaration** because every rule shares the token.

New checks: every token is actually consumed by a header rule (an orphaned token is worse than a hardcoded value); no breakpoint overrides `--headerCtaPadX`; all eight rules animate their layout properties on `var(--headerTransition)`; reduced motion zeroes it; no `.brandBadge`/`.brandName` rule survives in the `1150px` or `640px` queries.

Verified at 1600/1440/1366/1280/1200/**1151**/**1150**/1100/1024/992/900/768 — desktop widths clean at +153/+153/+153/+174/+94/+45, hamburger below. Sweep of every integer width 900–1600 still reports zero wrapping and the same 45px tightest slack.

### Lessons Learned

- **A token nothing reads is worse than a hardcoded value.** The refactor's first check verifies each custom property is actually consumed, because the failure mode of "tokenize everything" is a variable that silently does nothing while looking authoritative.
- **"Reduce the spacing" and "move the breakpoint" were not alternatives.** The brief framed them as a fallback chain, and measuring showed both were needed: optimization alone still left a 6px deficit at 1100px. Without numbers it would have been easy to ship the tightening, feel that it looked better, and leave a narrow broken band behind.
- **Font files are gettable, so text width is measurable.** Guessing average character widths would have put the answer off by enough to pick the wrong breakpoint. An hour of TrueType parsing turned a judgement call into arithmetic.
- **Start a compact band above the point where it is needed.** Putting the boundary at 1280 rather than 1207 means the adjustment lands where there is still slack, so it reads as a smooth change rather than a rescue.

---

## 2026-08-03 — Phase 2D: live Apps Script backend connected

### Summary

The production Web App URL is wired into `businessConfig.estimateEndpoint` and lead capture is live. **This closes the project's oldest and largest launch blocker** — since Phase 1 the form had been showing visitors a confirmation while discarding their request.

The endpoint was already architected as a single shared value, so no refactor was needed; the audit below proves that rather than assuming it. The code review that followed the wiring found one real defect, which is fixed.

### Files Modified

- `js/indexJS.js` — production `/exec` URL set in `businessConfig`; double-submit guard added (`estimateSubmissionInFlight`, `endEstimateSubmission()`); `leadId` held stable for the page load via `currentEstimateLeadId`

### Single Source of Truth — audited, not assumed

The endpoint appears **exactly once** in shipped code. All 14 pages load the same `js/indexJS.js`, and there is **exactly one `fetch()` call site**, which builds its URL from `businessConfig.estimateEndpoint + '?action=leads.create'`. No page inlines a handler; every `<form>` carries `action="#"` and is JS-handled. A future redeployment is a one-line change.

Checks now enforce this: one live URL in shipped code, one `fetch()` call site, no hardcoded endpoint in any HTML/CSS, every page loading the shared script, and no form posting anywhere.

### Defect Found and Fixed — duplicate leads on a double-tap

`submitEstimateRequest()` had no in-flight guard. `isLoading` was a cosmetic class; the button was never `disabled` and nothing checked whether a request was already running. Worse, `buildEstimatePayload()` minted `leadId: 'BG-' + Date.now()` **on every call**, so two taps produced two *different* leadIds — and the API's dedupe is keyed on `leadId`, so it could not collapse them.

Result, had this shipped: one visitor double-tapping the submit button (on mobile, under a thumb) produces **two rows in the client's sheet, two owner emails, two customer auto-replies**, and burns double the MailApp quota — which is only ~100 recipients/day on consumer Gmail.

This was harmless while the endpoint was empty, because the unconfigured branch never made a request. **Wiring the endpoint is what made it real**, which is exactly why the review was worth doing after the wiring rather than before.

Fix:
- `estimateSubmissionInFlight` short-circuits a second call.
- The button is genuinely `disabled` for the duration, so Enter cannot re-trigger it either.
- `endEstimateSubmission()` releases the lock, and is called on **all three** terminal paths — unconfigured, resolved, rejected — so a failed attempt can still be retried rather than locking the form forever.
- `currentEstimateLeadId` holds the id steady for the page load, so a retry after a network failure carries the *same* id and the server's dedupe collapses it into the original row. Holding it for the page load is correct because the flow allows one submission per load: once the success panel shows, reopening the modal shows the panel again, not a blank form.

### Validation Performed

**Live, against the production endpoint** (zero side effects on the client's sheet or inbox):

- `GET ?action=ping` → `200` `{"success":true,"data":{"module":"forestryModule","clientId":"bluegrid","version":"1.0.0",…}}`. The identity triple matches `config.gs` exactly, confirming the deployed script is the code in this repo.
- `GET ?action=leads.explode` → `UNKNOWN_ACTION`
- `GET ?action=leads.list` with no key → `UNAUTHORIZED`
- `POST ?action=leads.create` with the honeypot filled → `200` `{"success":true,"data":{"lead":{"leadId":"BG-…"},"honeypot":true}}`. This exercises the **entire real transport chain** — `text/plain` body, no CORS preflight, Apps Script's 302 to `script.googleusercontent.com`, JSON envelope — while `handleCreateLead` short-circuits before writing a row or sending mail. A genuine end-to-end test with nothing to clean up afterward.

**Static contract check** (`validateLeadFlow.js`), covering all 14 pages:

- 20 payload keys, every one mapping to a `LEADS_HEADERS` column except the honeypot; **no server-owned column** (`photoUrls`, `propertySize`, `terrainType`, `status`, `estimateAmount`, `assignedTo`, `internalNotes`, `lastUpdated`) is ever sent by the client
- All 5 `REQUIRED_CREATE_FIELDS` present
- `HONEYPOT_FIELD` in `config.gs` matches the input's `id` **and** `name` on all 14 pages, each wrapped in an `aria-hidden` container with `tabindex="-1"` and `autocomplete="off"`, exactly one per page
- Every `serviceNeeded`, `preferredTime`, and `preferredContactMethod` value offered in HTML is in `ENUM_VALUES`; the `preferredContactMethod` fallback is itself a legal enum
- All 9 element ids `buildEstimatePayload()` reads exist on all 14 pages — it calls `getElementById(...).value` without null guards, so a missing one would throw at submit
- All 6 field-error targets referenced by `showSubmissionError()` exist on all 14 pages
- Transport stays `POST` + `text/plain`; `routes.gs` registers `leads.create` as POST with no auth
- Response handling covers non-200, the success envelope, the error envelope, and network rejection; `VALIDATION_ERROR` matches `ERROR_CODES.validation`
- The client honeypot check runs **before** the fetch
- `leadId` format satisfies the server's own `isValidLeadId` regex, extracted from `validation.gs` rather than hardcoded

Regression suite unchanged: 14 pages / 1,372 links and assets / zero broken; hero loop 92/92 alternating; hero seam exact on five viewports; `node --check` clean; Apps Script harness 64/64.

### Not Verified

- **A real lead was never created.** That path writes a row and emails both the owner and the customer, so it is not mine to trigger unilaterally. The deployment reportedly passed it during setup; it should be re-run once from the live site as the final pre-launch check.
- **Whether `MODULE_API_KEY` is actually set** cannot be determined from outside — `leads.list` returns `UNAUTHORIZED` identically whether the key is missing or simply not supplied. Only `leads.list`/`leads.update` (the Phase 2 dashboard) depend on it; the public form does not.
- **Still no browser.** Same limitation as Phase 2C: no rendered check of the form UI on a real device.

### Lessons Learned

- **Wiring an endpoint changes which bugs are real.** The double-submit hole existed for the whole project and cost nothing, because the unconfigured branch never issued a request. It became a live data-integrity defect the moment the URL was set. Reviewing the flow *after* the wiring, as instructed, is what surfaced it.
- **The honeypot path is a free production smoke test.** It exercises the complete transport — content type, preflight avoidance, redirect, envelope — and by design writes nothing and sends nothing. Worth remembering for any Apps Script backend that has one.
- **"Single source of truth" is a claim to verify, not to assert.** The endpoint really was already in one place, but the check that proves it is what keeps it in one place through the next change.

---

## 2026-08-03 — Phase 2C: hero mobile refinement

### Summary

Three defects in the homepage hero, all fixed at the cause. The hero background no longer grows with the estimate form on mobile; the before/after transition alternates forever instead of desyncing after a few cycles; and the updated `hero_after` asset's filename casing was normalized so it cannot break on a case-sensitive host.

No redesign, no typography change, and the typing animation was not touched.

### Files Modified

- `css/styleIndex.css` — hero media layer decoupled from section height in the `1080px` query; new `.heroSection::after` estimate band; `.heroOverlay` now lands on solid `--colorNearBlack` at the seam; `.heroContent` given the `min-height` that used to sit on `.heroSection`; `.estimateFormCard` rides up over the seam. The `640px` query's `.heroContent` min-height tracks its tighter top padding
- `js/indexJS.js` — `fireHeroReverseDissolve()` became `fireHeroReverseDissolveAndWait()` and is now awaited; `fireHeroForwardSweepAndWait()` gained an `error` fallback
- `index.html`, `locations/forestry-mulching-ashland-ky.html` — `hero_after.JPG` → `hero_after.jpg` (3 references)
- `graphics/images/hero_after.JPG` → `graphics/images/hero_after.jpg` (git rename)

### Issue 1 — hero background ran past the fold on mobile

**Cause.** `.heroMedia` was `position: absolute; inset: 0`, so its height was the *section's* height. At `1080px` and below `.heroInner` collapses to one column and the estimate card stacks beneath the hero copy, roughly doubling the section. The photograph faithfully stretched to cover all of it. Reducing the hero height would not have fixed this — the coupling was the defect.

**Fix.** Stop letting section height drive the picture:

1. `.heroMedia` is pinned top-only (`inset: 0 0 auto`) with an explicit `height: var(--heroMediaHeight)`.
2. `--heroMediaHeight` is declared once on `.heroSection` as `100vh` then `100lvh` (cascade fallback for browsers without `lvh`). `lvh` keeps the picture covering the viewport in every browser-chrome state. One number drives the media band, the copy block, and the estimate band.
3. `.heroContent` carries `min-height: calc(var(--heroMediaHeight) - var(--headerHeight) - 3rem)` — this is the `min-height` that used to live on `.heroSection`, moved onto the block it actually describes. It makes the copy end exactly on the seam whatever it measures, so the card always arrives at the fold.
4. `.heroSection::after` paints the estimate band from `var(--heroMediaHeight)` to the section bottom, opening in `--colorNearBlack` and settling into `--colorCharcoal` — its own background, starting in the exact colour the photograph fades into.
5. `.estimateFormCard` gets `margin-top: -4.5rem` against the `3rem` grid gap, so it rides 24px up over the seam for the layered edge.

**The fade is on `.heroOverlay`, not on `.heroPlate`.** The obvious approach — a bottom `mask-image` on the plates — would have overwritten `.heroPlateAfter`'s `mask-image`, which *is* the sweep animation. Putting the fade in the overlay's existing 180deg gradient (final stop `var(--colorNearBlack) 100%`) reaches the same result, improves contrast under the stats, and leaves the sweep alone. A validator check now asserts no mobile `.heroPlate` rule sets `mask-image`.

Desktop is untouched: every one of these rules lives inside the `1080px` query, and `--heroMediaHeight` does not exist above it.

### Issue 2 — before/after stopped alternating

**Cause.** `fireHeroReverseDissolve()` was fire-and-forget. It set `isDissolving`, then scheduled cleanup — remove `isRevealed`, remove `isDissolving`, under `isResetting` so nothing transitions — on a `1800ms` timer. The loop, however, only waited `emptyBreathMs` (220ms) before starting the next phrase.

So the cleanup timer from cycle N could fire *during* cycle N+1. When it did, it stripped the `isRevealed` that N+1 had just added: the AFTER plate snapped away mid-sweep and the next reveal had to wait a full phrase. That is exactly the reported "Before → After → Before → long pause → starts again". Whether a given cycle collided depended on phrase length, which is why it looked intermittent.

**Fix.** The dissolve now returns a promise that resolves only once the plate is fully back to BEFORE with its classes clean, and the loop awaits it. The cycle is strictly sequential and no timer can outlive the cycle that created it.

The dissolve's own timer stays deliberately unpaused. The CSS opacity transition cannot pause either, so an in-flight dissolve always finishes — which is the etiquette the existing comment describes. The loop takes its pause at the breath that follows.

Also hardened `fireHeroForwardSweepAndWait()`: it waited on the AFTER plate's `load` event when the image was not ready, so an image that failed to load would leave the promise unresolved and the hero dead forever. It now resolves on `error` too, degrading to a BEFORE-only hero rather than stopping.

### Issue 3 — hero image

`graphics/images/hero_after.JPG` was replaced with a new 549KB image in `fb15070`, but it arrived on disk as `hero_after.jpg`. Windows is case-insensitive so git kept tracking the uppercase name while the working tree held the lowercase one. Nothing was broken today, but GitHub Pages is case-sensitive and the mismatch was one careless `git add` away from a 404 on the homepage hero.

Normalized via a two-step `git mv` and updated all 3 references. Both plates are `2048x1536` and both declare `width="2048" height="1536"`, so the swap is ratio-identical — no distortion, no layout shift.

### Validation Performed

- **Hero loop harness** — loaded the real `js/indexJS.js` into a VM with mocked DOM and a virtual clock, ran the actual `runHeroDuetLoop()` for **10 minutes of page time**, and recorded every class mutation on the AFTER plate.
  - Fixed code: **92 complete cycles, perfectly alternating**, cadence **6.13s min / 6.50s avg / 6.94s max**, zero clipped reveals. The sub-second spread is the randomized per-character typing speed, which is the intended human feel.
  - **The same harness run against the pre-fix code from `HEAD` fails**: 90 of 108 reveals cut short by a stale reset (the worst held the AFTER plate for 58ms), cadence swinging 4.32s–9.74s. The test demonstrably catches the bug it claims to fix.
- **Hero layout validator** — parses the real stylesheet, extracts the placement declarations, and computes the seam on five viewports. At 360×640, 390×844, 430×932, 768×1024, and 1024×1366 the copy block ends **exactly** on the media seam (0px error) and the card overlaps it by **24px** every time. Also asserts desktop is untouched, the media layer is bounded, the band opens in the seam colour, and no mobile rule overwrites the plate mask.
- Sitewide validator unchanged: 14 pages, **1,372 links and assets, zero broken**.
- `node --check js/indexJS.js` clean; `styleIndex.css` braces balanced; Apps Script harness still **64/64**.

### Honest Limitation

**No browser was run.** This environment has no Playwright or Chrome DevTools MCP, so there are no screenshots and no real rendered measurement. Everything above is static analysis plus a faithful simulation of the shipped JavaScript. The geometry and the loop are verified; the *look* of the seam on a real device is not. Someone should open the homepage on a phone before launch — that check is listed in `technicalDebt.md`.

### Lessons Learned

- **A passing test proves nothing until it has failed.** The loop harness was worth writing only because running it against the old code reproduced the exact reported symptom. Before that it was decoration.
- **The first harness run found my own bug, not the product's.** It reported two concurrent loops; `indexJS.js` already calls `initializeHeroDuet()` at module scope, and the harness called it again. Reading the trace rather than trusting the summary is what caught it.
- **When a layer's size is wrong, look at what is driving it.** The instruction not to simply reduce the hero height was the right call: an absolutely-positioned `inset: 0` layer is coupled to its container's content, and every fix that is not decoupling is a workaround.

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

## Superseded Handoff (2026-08-02)

The handoff block that stood here described Phase 2A as the frontier and the
endpoint as unwired. Both are long since done. **The current handoff is the
"Next Session Should Continue Here" block at the top of this file**, under the
2026-08-04 session summary. Kept as a marker so a reader who scrolls to the
bottom is not misled by stale instructions.
