# Technical Debt — BlueGrid Land Solutions

**Last updated:** 2026-08-02

Known debt, deferred work, and intentional trade-offs. Items are listed by launch impact, not by effort.

---

## High Priority

### 1. ~~Lead capture is not live~~ — RESOLVED 2026-08-03
The production `/exec` URL is set in `businessConfig.estimateEndpoint` and the endpoint answers. Verified live: `ping` returns the matching `forestryModule` / `bluegrid` / `1.0.0` identity, and a honeypot-tripped `POST leads.create` returns a correct success envelope, proving the whole transport chain works.

Two follow-ups remain, neither blocking:
- **A real lead has never been created from the live site by this project.** That path writes a row and emails the owner and the customer, so it was not triggered unilaterally. Run one real submission as the final pre-launch check and confirm all five outcomes in `appsScript/README.md` step 10.
- **`MODULE_API_KEY` cannot be verified from outside** — `leads.list` returns `UNAUTHORIZED` identically whether the key is unset or simply not supplied. Only the Phase 2 dashboard depends on it; the public form does not.

### 2. Production domain undecided
**This is now the only outright launch blocker.**
Canonical tags say `https://www.bluegridlandsolutions.com/`; `CNAME` says `bluegridlandsolutions.nulostudio.com`. They disagree.
Affects canonical URLs and OG `og:url` on **all 14 existing pages** (19 once the second location wave ships), plus `sitemap.xml` and `robots.txt` (neither exists yet). Settle this *before* writing SEO files, or the work is done twice. Every page carries a `TODO:` comment above both tags so the eventual sweep catches all of them.

### 3. Badge artwork typo — "FORESTRV"
The official badge (`graphics/logos/web/bluegridBadge400.png`, `bluegridBadge192.png`) reads **"FORESTRV MULCHING & LAND CLEARING"** on the bottom arc — a V where the Y should be. Verified 2026-08-02 against the actual PNG.
Appears in the header, mobile menu, footer, and Facebook fallback on **every page**. Needs corrected source artwork from the client. Would be embarrassing in print or on a truck wrap.

### 4. Placeholder contact details still shipping
- Phone `(740) 464-2526` — TODO-marked, sourced from the flyer, never confirmed
- Email `estimates@bluegridlandsolutions.com` — a placeholder address that may not exist

Both are wired through `businessConfig`, so each is a one-line fix — but shipping an unrouted email address loses leads silently.

### 5. Service area pages: 6 of 13 cities have one
The `seoPlan.md` first wave shipped — Ashland, Portsmouth, Ironton, Chillicothe, Grayson, and Morehead have real pages, linked from the mega menu, mobile menu, footer, homepage, and the Forestry Mulching service page.

Still outstanding:
- **Rows 7–11** (Jackson OH, Gallipolis OH, Waverly OH, Greenup KY, Louisa KY) — staged in `seoPlan.md` for after the first six index. Their nav links still point at `#serviceAreas`, which resolves.
- **West Union, OH and Flatwoods, KY are advertised in the nav but appear nowhere in `seoPlan.md`'s 11-city table.** Either they get pages or they come out of the nav. Left as-is pending a decision.
- **Location × service pages beyond forestry mulching** — only where search volume justifies genuinely distinct content.

---

## Medium Priority

### 6. Three homepage service cards hotlink Unsplash stock photos
Trail Cutting, Property Cleanup, and Hunting Property Prep cards load from `images.unsplash.com`. Two problems: an external runtime dependency on a third party, and stock imagery on a site whose entire credibility rests on real work photos.
Deferred because replacing imagery needs client approval. Real unused photos exist (`cleanCut`, `freshMulching`, `overGrowth`, `whatTheyDo2`, `BeforeandAfter`).

### 7. Thin photo library
13 images total for **14 pages**. Several are reused across service pages, location page heroes, and galleries. Two service pages (`stormCleanup`, `huntingPropertyPrep`) and **all 6 location pages** ship with no gallery section, because no apt photos exist — and no existing photo can be honestly captioned to a named town. Verified 2026-08-02.
Needs a real photo drop from the client — ideally before/after pairs per service, and ideally tagged by where they were taken, which would unlock a gallery on every location page.

### 8. `robots.txt` and `sitemap.xml` do not exist
Deferred by instruction. Both depend on item 2 (domain). The sitemap now needs 14 URLs rather than 8.

### 9. Open Graph not finalized
`og:image` and `og:url` use relative or placeholder-domain paths across all **14 pages**. OG images must be absolute URLs to render in Facebook/iMessage previews. TODO-marked in every page head.

### 9a. Location pages quote no prices
`seoPlan.md` content rule 5 asks location pages to answer cost questions directly with real ranges, and calls it the biggest opening in this trade because most competitors dodge it. None of the 6 pages names a dollar figure — no pricing has been approved by the client, and inventing one would be a commitment the site cannot honor.
Each cost FAQ instead answers with the factors that move the price on that county's specific ground (slope, stem size, access, material). That is honest and locally unique, but it is the weaker answer.
**Fix: get rough per-acre or per-day ranges from Chase.** This is the single highest-value upgrade available to all 6 pages, and it costs one conversation.

### 10. Chase owner introduction video missing
The section is built, video-ready, and ships a polished placeholder ("Introduction video coming soon"). Supplying it is a two-field config change — `introVideoUrl` + `introVideoConfigured` — with YouTube, Vimeo, and self-hosted all supported.
No code debt; purely awaiting the asset.

### 11. Facebook embed disabled
`facebookPageConfigured: false`, so a designed fallback panel shows instead of the live Page Plugin. The real page URL is already in config. Needs someone to confirm the page renders in the plugin, then flip the flag.

### 12. Google Business Profile does not exist
`googleBusinessUrl` is empty; the footer icon is hidden at runtime rather than shipping a dead `#` link. Local SEO is meaningfully weaker without a GBP.

---

## Low Priority

### 13. Shared chrome is duplicated across 14 pages
Header (364 lines), estimate modal (296), footer (154), and floating actions (25) are copied into every page — roughly 840 lines × 14. Inherent to a no-build static site.
Mitigated: interior pages were generated from a guarded assembler, not hand-copied, and `applyBusinessConfig()` drives phone/email/social from one place at runtime. **Nav link changes now require editing 14 files** — this session's service-area rewiring touched 18 links per page across 8 files and needed a scripted, guarded pass to be safe. The cost of this item is now measurable; see *Consider a build step* under Future Improvements.

### 14. `dashboardMetrics` tab is created empty
`setupSpreadsheet()` creates the tab but writes no formulas. The formula set is specified in `docs/googleSheetArchitecture.md` but must be entered by hand. The dashboard SPA (Phase 2) computes its own numbers and does not read this tab, so nothing is blocked.

### 15. Photo upload not implemented
Phase 1 records `photoCount` and `photoNames` only; no bytes are uploaded and `photoUrls` stays `[]`. The owner email says so explicitly and tells the owner to request photos directly. `leads.addPhotos` is specced in `phase11PhotoUploadService.md`; `routes.gs` is the extension point.

### 15a. Hero animation durations are duplicated between CSS and JS
`heroDuetConfig.forwardSweepMs` (1400) and `reverseDissolveMs` (1800) in `js/indexJS.js` must stay in lockstep with `transition: --heroSweepPos 1400ms` and `transition: opacity 1800ms` in `css/styleIndex.css`. Nothing enforces the pairing.
They agree today, and Phase 2C made the loop await the dissolve, so a drift would now show up as a visible gap rather than a desync — but it would still be wrong. The clean fix is to read the durations from CSS custom properties via `getComputedStyle` so the stylesheet is the single source.

### 15b. Orphan hero asset
`graphics/images/after.JPG` (427KB) was committed in `fb15070` alongside the hero refresh and is referenced nowhere in the site. It appears to be the previous `hero_after` image kept as a backup.
Harmless but it ships to visitors' hosting. Delete it or move it out of the deployed tree — left in place because it is the client's asset, not one this project created.

### 16. No Lighthouse / performance pass yet
Deferred by instruction until Priorities 1–4 complete. Known candidates: hero images are full-resolution (`2048×1536`) with no responsive `srcset`; Google Fonts loads render-blocking.

### 17. Owner is not named on the site
Copy says "the owner" throughout because naming Chase publicly was never approved. For an owner-operated brand, naming him is likely stronger. One-line copy change once decided.

### 18. Current service is not highlighted in the mega menu
`servicePageArchitecture.md` (Shared Template Anatomy, row 1) specifies "current service highlighted in the Services menu". It is not implemented — the header block is byte-identical across all 7 service pages and all 6 location pages. Pre-existing; found while splicing chrome for the location tier.
Cosmetic and low risk, but it is a documented requirement the build does not meet. Two ways to fix it: a per-page class on one `<li>` in 13 files, or a small `js/indexJS.js` routine that marks the nav item matching `window.location.pathname`. The JS route is better — one place, no duplication, and it covers location pages for free.

### 18a. Nothing has been checked in a real browser
No session on this project has had Playwright or Chrome DevTools available, so every validation to date is static analysis or simulation. That is strong for links, structure, schema, geometry, and the hero loop's state machine — and it says nothing about how anything actually *looks*.
Before launch someone should open the homepage on a real phone and confirm: the hero photo ends at the fold, the seam into the estimate band is invisible, the estimate card's overlap reads as intentional, and the before/after transition alternates smoothly. Same pass on a tablet and a desktop.

### 19. Rowan County coverage is asserted, not confirmed
Morehead has been advertised in the mega menu and mobile menu since Phase 1, but Rowan County appeared in none of the four places the site lists counties (`serviceRegions` in `js/indexJS.js`, `LocalBusiness` `areaServed`, the static map panel list, and both copies of the "Do you travel to my county?" FAQ answer).
Phase 2B shipped a Morehead location page, so all four were updated to agree. The `serviceRegions` entry carries a `TODO:` explaining why.
**If Chase does not actually work Rowan County, the Morehead page and all four Rowan entries come back out.** Everything else in the coverage data traces to the original county map.

- **Dashboard SPA (Phase 2)** — `leads.list` / `leads.update` and `MODULE_API_KEY` already exist and are tested; nothing has been built against them
- **Weekly summary email** — `weeklySummaryDay` config key is seeded but unused; specced in `phase5Zapier.md`
- **SMS alerts** — the one notification Apps Script cannot do natively; needs an email-to-SMS gateway or a webhook
- **`leads.addPhotos`** (Phase 11) — client-side downscale, Drive upload, write URLs back
- **Location × service pages** — beyond forestry mulching, only where search volume justifies genuinely distinct content
- **`locations/` hub page** — the six pages have no index of their own; the homepage `#serviceAreas` block and the Forestry Mulching "Where We Work" section stand in for one. Specced as part of Phase 13
- **Structured data expansion** — `LocalBusiness` currently omits a street address (service-area business); revisit if the client wants a public address
- **Consider a build step** — the site is at 14 pages and item 13's duplication is already costing scripted, guarded edit passes for any nav change. Phase 13 (`phasePrompts/phase13ServiceAreaExpansion.md`) specifies the generator; its trigger is "hand-maintenance of location pages exceeds ~12 files", and the shared chrome has arguably hit that first

---

## Explicitly Not Debt

Recorded so future sessions don't "fix" them:

- **No ActivityLog sheet.** Deliberate. The `leads` sheet is the success record; `errorLog` captures failures only. A second log of successful traffic adds noise and quota cost.
- **Nulo Studio is not copied on lead emails.** Deliberate client decision — the studio must not sit in the customer's email thread. Operational problems surface in `errorLog`.
- **`leads.create` is a public endpoint.** Deliberate — a browser cannot hold a secret. The honeypot, validation, and dedupe are its gate.
- **`Content-Type: text/plain` on form POSTs.** Deliberate — Apps Script web apps cannot answer a CORS preflight, so `application/json` would fail from the browser.
- **The form's file input never uploads.** Deliberate Phase 1 scope; see item 15.
- **`leadId` is held for the whole page load, not per attempt.** Deliberate. The API dedupes on `leadId`, so a stable id lets a retry after a network failure collapse into the original row instead of creating a second one. The flow allows one submission per page load, so there is nothing to reset.
- **The unconfigured-endpoint branch in `submitEstimateRequest()` is now unreachable.** Kept on purpose: it is the safety net that makes a blanked or mistyped endpoint obvious in the console instead of silently failing, and it costs four lines.
- **Location pages do not link to each other.** Deliberate, per the Internal Linking Map in `seoPlan.md` — they pass authority up to the parent service page, not sideways. Nearby towns render as plain text pills for this reason, which is why `.nearbyList` styles `li` rather than `a`. The sitewide mega menu, mobile menu, and footer *do* link to them; `seoPlan.md` rule 4 explicitly allows that, and page-type-dependent chrome across 14 files would be a maintenance trap.
- **Location pages have no gallery.** Same reason as items 7 and the Phase 1 decision on `stormCleanup` — no photo in the library can be honestly captioned to a named town. Adding one would mean captioning a Greenup County photo as Chillicothe work.
- **The location page assembler is not in the repo.** The six pages were generated once from a guarded splice plus a content data file, then committed as plain static HTML. Phase 13 builds the real generator; shipping a half-generator now would leave two competing sources of truth.
