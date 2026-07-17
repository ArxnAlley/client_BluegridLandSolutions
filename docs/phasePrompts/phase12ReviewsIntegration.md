# Phase 12 Prompt — Reviews Integration & Upgrade Path

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

**Sequencing note:** post-launch. Requires the live site (Phase 8) and an active Google Business Profile accumulating reviews (Phase 6). This closes the gap between "testimonials hard-coded at build time" and "reviews as a living asset".

---

You are building the review display system for the BlueGrid Land Solutions website and documenting its upgrade path.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching and land clearing, Southern Ohio + Eastern Kentucky.
- **Site root:** `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\` — static single-page site plus `services/` and `locations/` pages; pure HTML/CSS/JS, no build step, no server runtime.
- **Code standards:** `codeStyle.md` at the site root (camelCase, section banners, expanded formatting).
- **Review source:** the client's Google Business Profile (playbook: `docs/gbpPlaybook.md` — reuse its review short link). Reviews accrue there via the Phase 6 acquisition flow (ask at job completion).

## Constraints (encode these; they shape the whole design)

1. **No free official display API.** Google offers no free, supported way for a small static site to auto-embed all its GBP reviews. Places API Place Details returns at most 5 reviews, requires a billed API key, and its terms restrict caching/reordering — unusable client-side on a static site without exposing the key.
2. **No self-serving review markup.** `Review`/`AggregateRating` JSON-LD about our own `LocalBusiness` is ignored by Google and risks manual action. Display reviews; never mark them up.
3. **Truthfulness.** Only real reviews, verbatim text (trim with ellipsis allowed), reviewer first name + city when known, dated. No paraphrasing into better copy.

## Design (implement Tier 1 now; document Tiers 2–3)

### Tier 1 — curated review data file (build now)

1. `js/reviewsData.js`: a single `REVIEWS` array of objects — `reviewText`, `reviewerName`, `reviewerCity`, `serviceType` (one of the 8 `serviceNeeded` enum values or empty), `rating` (1–5), `reviewDate` (YYYY-MM), `source` (`google` | `facebook` | `direct`), `featured` (boolean).
2. Rendering (in the site's existing JS structure): homepage testimonial section renders `featured` reviews; service pages render reviews matching their `serviceType` (fallback to featured) — a small shared render function, no duplication per page.
3. Every review block ends with two links: "Read all reviews on Google" (GBP short link) and "Leave a review" (same link) — the display doubles as acquisition.
4. Star display: accessible (text alternative "5 out of 5"), no rating schema markup (constraint 2).
5. `docs/reviewOps.md`: the quarterly refresh routine — owner or studio copies new GBP/Facebook reviews into `reviewsData.js` verbatim, flags the best as `featured`, commits, redeploys. Ten minutes a quarter; state that explicitly.

### Tier 2 — semi-automated pull (document only)

Apps Script time-driven function in `BlueGridAPI` using Places API Place Details (billed key, server-side, key never exposed) to fetch the latest 5 reviews weekly into a `reviews` tab of the `BlueGrid Leads` sheet; studio curates from there into `reviewsData.js`. Trigger condition to adopt: review volume outgrows manual copying (roughly 5+ new reviews/month sustained). Note the terms-of-service caveats on caching and display.

### Tier 3 — third-party widget (document only, decision aid)

Paid embed services (e.g., Elfsight-class widgets) trade money for zero maintenance, at the cost of third-party JS weight and losing the site's hand-built visual character. Include a short pros/cons table and the recommendation: stay on Tier 1/2 unless the owner explicitly wants live auto-updating reviews.

## Deliverables

1. `js/reviewsData.js` seeded with the client's current real reviews (obtain from the owner/GBP; if none exist yet, seed empty with the documented object shape and hide the section gracefully when the array is empty — no fake reviews, ever).
2. Homepage + service-page render integration per Tier 1.
3. `docs/reviewOps.md` covering the Tier 1 routine and the Tier 2/3 upgrade paths with adoption triggers.

## Acceptance Criteria

- [ ] Empty `REVIEWS` array → sections hide cleanly (no empty frames, no console errors).
- [ ] Populated array → homepage shows featured reviews; each service page shows service-matched reviews; all links point at the real GBP short link.
- [ ] No `Review`/`AggregateRating` JSON-LD anywhere on the site (grep to verify).
- [ ] Rendering escapes review text (user-originated content).
- [ ] Visual pass on mobile/desktop matches the site's existing design language; Lighthouse scores unchanged (re-run homepage vs. the Phase 9 baseline).
- [ ] `docs/reviewOps.md` executable by a non-developer for the copy-in routine.

## Outputs Required for Later Phases

- `reviewsData.js` object shape — location pages (Phase 13 expansion) render city-matched reviews (`reviewerCity`) from the same file.
- Tier 2 spec — implemented inside `BlueGridAPI` if adopted; extends `routes.gs` and the sheet, not the website.
