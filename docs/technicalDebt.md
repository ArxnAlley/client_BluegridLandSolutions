# Technical Debt — BlueGrid Land Solutions

**Last updated:** 2026-08-02

Known debt, deferred work, and intentional trade-offs. Items are listed by launch impact, not by effort.

---

## High Priority

### 1. Lead capture is not live
`businessConfig.estimateEndpoint` in `js/indexJS.js` is empty. The form **simulates success**: nothing reaches a sheet, no email sends, and the visitor sees a confirmation anyway.
**Blocks launch outright.** Fix: deploy per `appsScript/README.md`, paste the `/exec` URL.

### 2. Production domain undecided
Canonical tags say `https://www.bluegridlandsolutions.com/`; `CNAME` says `bluegridlandsolutions.nulostudio.com`. They disagree.
Affects canonical URLs and OG `og:url` on **all 8 existing pages** (21 once the 13 location pages ship), plus `sitemap.xml` and `robots.txt` (neither exists yet). Settle this *before* writing SEO files, or the work is done twice.

### 3. Badge artwork typo — "FORESTRV"
The official badge (`graphics/logos/web/bluegridBadge400.png`, `bluegridBadge192.png`) reads **"FORESTRV MULCHING & LAND CLEARING"** on the bottom arc — a V where the Y should be. Verified 2026-08-02 against the actual PNG.
Appears in the header, mobile menu, footer, and Facebook fallback on **every page**. Needs corrected source artwork from the client. Would be embarrassing in print or on a truck wrap.

### 4. Placeholder contact details still shipping
- Phone `(740) 464-2526` — TODO-marked, sourced from the flyer, never confirmed
- Email `estimates@bluegridlandsolutions.com` — a placeholder address that may not exist

Both are wired through `businessConfig`, so each is a one-line fix — but shipping an unrouted email address loses leads silently.

### 5. Service area pages: 0 of 13 built
Nav and mobile menu advertise 13 cities; **all 13 links point at the `#serviceAreas` anchor**, not real pages. Footer cities are plain text, not links.
Not broken (the anchor resolves), but the site advertises local coverage it cannot back with landing pages. `seoPlan.md` stages 11 pages with a 6-city first wave; recommend that over 13 thin pages, which read as doorway pages.

---

## Medium Priority

### 6. Three homepage service cards hotlink Unsplash stock photos
Trail Cutting, Property Cleanup, and Hunting Property Prep cards load from `images.unsplash.com`. Two problems: an external runtime dependency on a third party, and stock imagery on a site whose entire credibility rests on real work photos.
Deferred because replacing imagery needs client approval. Real unused photos exist (`cleanCut`, `freshMulching`, `overGrowth`, `whatTheyDo2`, `BeforeandAfter`).

### 7. Thin photo library
13 images total for 8 pages. Several are reused across service pages and galleries. Two service pages (`stormCleanup`, `huntingPropertyPrep`) ship with no gallery section at all, because no apt photos exist. Verified 2026-08-02.
Needs a real photo drop from the client — ideally before/after pairs per service.

### 8. `robots.txt` and `sitemap.xml` do not exist
Deferred to Phase 2B by instruction. Both depend on item 2 (domain).

### 9. Open Graph not finalized
`og:image` and `og:url` use relative or placeholder-domain paths across all 8 pages. OG images must be absolute URLs to render in Facebook/iMessage previews. TODO-marked in every page head.

### 10. Chase owner introduction video missing
The section is built, video-ready, and ships a polished placeholder ("Introduction video coming soon"). Supplying it is a two-field config change — `introVideoUrl` + `introVideoConfigured` — with YouTube, Vimeo, and self-hosted all supported.
No code debt; purely awaiting the asset.

### 11. Facebook embed disabled
`facebookPageConfigured: false`, so a designed fallback panel shows instead of the live Page Plugin. The real page URL is already in config. Needs someone to confirm the page renders in the plugin, then flip the flag.

### 12. Google Business Profile does not exist
`googleBusinessUrl` is empty; the footer icon is hidden at runtime rather than shipping a dead `#` link. Local SEO is meaningfully weaker without a GBP.

---

## Low Priority

### 13. Shared chrome is duplicated across 8 pages
Header (364 lines), estimate modal (296), footer (154), and floating actions (25) are copied into every page — roughly 840 lines × 8. Inherent to a no-build static site.
Mitigated: pages were generated from `index.html` by a guarded assembler, not hand-copied, and `applyBusinessConfig()` drives phone/email/social from one place at runtime. **Nav link changes still require editing 8 files.**

### 14. `dashboardMetrics` tab is created empty
`setupSpreadsheet()` creates the tab but writes no formulas. The formula set is specified in `docs/googleSheetArchitecture.md` but must be entered by hand. The dashboard SPA (Phase 2) computes its own numbers and does not read this tab, so nothing is blocked.

### 15. Photo upload not implemented
Phase 1 records `photoCount` and `photoNames` only; no bytes are uploaded and `photoUrls` stays `[]`. The owner email says so explicitly and tells the owner to request photos directly. `leads.addPhotos` is specced in `phase11PhotoUploadService.md`; `routes.gs` is the extension point.

### 16. No Lighthouse / performance pass yet
Deferred by instruction until Priorities 1–4 complete. Known candidates: hero images are full-resolution (`2048×1536`) with no responsive `srcset`; Google Fonts loads render-blocking.

### 17. Owner is not named on the site
Copy says "the owner" throughout because naming Chase publicly was never approved. For an owner-operated brand, naming him is likely stronger. One-line copy change once decided.

---

## Future Improvements

- **Dashboard SPA (Phase 2)** — `leads.list` / `leads.update` and `MODULE_API_KEY` already exist and are tested; nothing has been built against them
- **Weekly summary email** — `weeklySummaryDay` config key is seeded but unused; specced in `phase5Zapier.md`
- **SMS alerts** — the one notification Apps Script cannot do natively; needs an email-to-SMS gateway or a webhook
- **`leads.addPhotos`** (Phase 11) — client-side downscale, Drive upload, write URLs back
- **Location × service pages** — beyond the first wave, only where search volume justifies genuinely distinct content
- **Structured data expansion** — `LocalBusiness` currently omits a street address (service-area business); revisit if the client wants a public address
- **Consider a build step** — if the page count grows much past ~20, item 13's duplication starts to hurt; a minimal include/partial system would pay for itself

---

## Explicitly Not Debt

Recorded so future sessions don't "fix" them:

- **No ActivityLog sheet.** Deliberate. The `leads` sheet is the success record; `errorLog` captures failures only. A second log of successful traffic adds noise and quota cost.
- **Nulo Studio is not copied on lead emails.** Deliberate client decision — the studio must not sit in the customer's email thread. Operational problems surface in `errorLog`.
- **`leads.create` is a public endpoint.** Deliberate — a browser cannot hold a secret. The honeypot, validation, and dedupe are its gate.
- **`Content-Type: text/plain` on form POSTs.** Deliberate — Apps Script web apps cannot answer a CORS preflight, so `application/json` would fail from the browser.
- **The form's file input never uploads.** Deliberate Phase 1 scope; see item 15.
