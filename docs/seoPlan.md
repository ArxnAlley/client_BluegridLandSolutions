# SEO Plan

BlueGrid Land Solutions · Forestry mulching / land clearing · Southern Ohio + Eastern Kentucky

Covers: title tags and meta descriptions (homepage, 7 service pages, location pages), structured data inventory, internal linking map, and content guidelines. Page anatomy and keyword targeting live in `servicePageArchitecture.md`; execution is Phase 7 (`phasePrompts/phase7SeoContent.md`).

Rules of thumb applied throughout: titles ≤ 60 characters, descriptions 140–155 characters, every description ends in the free-estimate CTA, no keyword stuffing.

---

## Title Tags & Meta Descriptions

### Homepage

| Element | Value |
|---------|-------|
| Title | `Forestry Mulching & Land Clearing in OH & KY | BlueGrid` |
| Description | `Forestry mulching, land clearing, and brush removal across Southern Ohio and Eastern Kentucky. Fast turnaround, tracked equipment. Free estimates.` |

### Service pages

Pattern: `{Service} | Southern OH & Eastern KY | BlueGrid`

| Page | Title | Meta Description |
|------|-------|------------------|
| `services/forestryMulching.html` | `Forestry Mulching | Southern OH & Eastern KY | BlueGrid` | `Forestry mulching that turns overgrown acreage into usable land in a day — no burn piles, no hauling. Serving Southern Ohio and Eastern Kentucky. Free estimates.` |
| `services/landClearing.html` | `Land Clearing | Southern OH & Eastern KY | BlueGrid` | `Land clearing for homesites, pasture, and access roads across Southern Ohio and Eastern Kentucky. Straight answers on cost per acre. Free estimates.` |
| `services/brushRemoval.html` | `Brush Removal | Southern OH & Eastern KY | BlueGrid` | `Brush removal for overgrown lots, fence rows, and invasive honeysuckle in Southern Ohio and Eastern Kentucky. Mulched in place, done fast. Free estimates.` |
| `services/trailCutting.html` | `Trail Cutting | Southern OH & Eastern KY | BlueGrid` | `ATV, UTV, and walking trail cutting through wooded property in Southern Ohio and Eastern Kentucky. Clean lines, low ground impact. Free estimates.` |
| `services/stormCleanup.html` | `Storm Cleanup | Southern OH & Eastern KY | BlueGrid` | `Storm damage cleanup for downed trees and debris on acreage in Southern Ohio and Eastern Kentucky. Quick response when weather hits. Free estimates.` |
| `services/propertyCleanup.html` | `Property Cleanup | Southern OH & Eastern KY | BlueGrid` | `Full property cleanup for overgrown, vacant, or inherited land in Southern Ohio and Eastern Kentucky. From jungle to presentable. Free estimates.` |
| `services/huntingPropertyPrep.html` | `Hunting Property Prep | Southern OH & KY | BlueGrid` | `Hunting property prep in Eastern Kentucky and Southern Ohio: food plots, shooting lanes, and access trails cut before season. Free estimates.` |

### Location pages

URL pattern: `locations/{service-slug}-{city}-{st}.html` — hyphenated exact-match slugs (documented exception to camelCase; the URL is an SEO surface here).

Title pattern: `Forestry Mulching in {City}, {ST} | BlueGrid Land Solutions`
Description pattern: `Forestry mulching and land clearing in {City} and {County} County. Local, insured, tracked equipment — most jobs done in a day. Free estimates.`

First wave targets forestry mulching (the money keyword) in all 11 cities; other service × city combinations only where search volume justifies a genuinely distinct page.

| # | URL Slug | Title |
|---|----------|-------|
| 1 | `forestry-mulching-ashland-ky` | `Forestry Mulching in Ashland, KY | BlueGrid Land Solutions` |
| 2 | `forestry-mulching-portsmouth-oh` | `Forestry Mulching in Portsmouth, OH | BlueGrid Land Solutions` |
| 3 | `forestry-mulching-ironton-oh` | `Forestry Mulching in Ironton, OH | BlueGrid Land Solutions` |
| 4 | `forestry-mulching-chillicothe-oh` | `Forestry Mulching in Chillicothe, OH | BlueGrid Land Solutions` |
| 5 | `forestry-mulching-grayson-ky` | `Forestry Mulching in Grayson, KY | BlueGrid Land Solutions` |
| 6 | `forestry-mulching-morehead-ky` | `Forestry Mulching in Morehead, KY | BlueGrid Land Solutions` |
| 7 | `forestry-mulching-jackson-oh` | `Forestry Mulching in Jackson, OH | BlueGrid Land Solutions` |
| 8 | `forestry-mulching-gallipolis-oh` | `Forestry Mulching in Gallipolis, OH | BlueGrid Land Solutions` |
| 9 | `forestry-mulching-waverly-oh` | `Forestry Mulching in Waverly, OH | BlueGrid Land Solutions` |
| 10 | `forestry-mulching-greenup-ky` | `Forestry Mulching in Greenup, KY | BlueGrid Land Solutions` |
| 11 | `forestry-mulching-louisa-ky` | `Forestry Mulching in Louisa, KY | BlueGrid Land Solutions` |

Rows 1–6 are the Phase 7 build set (priority = market size + proximity to home base); 7–11 follow once the first six index and rank. Every location page must clear the uniqueness bar in Content Guidelines below — if a page can't say anything locally true, it doesn't ship.

---

## Structured Data Inventory

All JSON-LD, inline `<script type="application/ld+json">`, one block per type per page. Validate with Google's Rich Results Test in Phase 9.

| Schema Type | Pages | Key Properties | Notes |
|-------------|-------|----------------|-------|
| `LocalBusiness` | Homepage only | `name`, `description`, `telephone`, `email`, `areaServed` (the 11 cities + counties), `image`, `url`, `sameAs` (Facebook), `priceRange` | Service-area business: include `areaServed`, omit street address unless the owner wants it public. One canonical copy — never duplicated on subpages. |
| `Service` | Each of the 7 service pages | `serviceType`, `provider` (`@id` reference to the homepage `LocalBusiness`), `areaServed`, `description` | Reference the provider by `@id`; do not restate the full LocalBusiness. |
| `FAQPage` | Each service page; blog/FAQ articles | `mainEntity` array of `Question`/`Answer` | Only questions actually rendered on the page. No cross-page duplicate questions. |
| `BreadcrumbList` | Every page below the homepage | `itemListElement` matching the visible breadcrumb | Positions: Home › Services › {Service}, or Home › Locations › {Page}. |

Explicitly out of scope: self-serving `Review`/`AggregateRating` markup on our own LocalBusiness (Google ignores it and it risks a manual action). Review strategy lives in `phasePrompts/phase12ReviewsIntegration.md`.

---

## Internal Linking Map

```
                        ┌────────────────────────────┐
                        │         Homepage           │
                        │  (mega menu + footer list) │
                        └─────┬──────────────────────┘
              links to all 7  │        ▲ logo + breadcrumb from everywhere
                              ▼        │
        ┌──────────────── Service pages (×7) ───────────────┐
        │  each: 2–3 related services (see map in           │
        │  servicePageArchitecture.md) + its own locations   │
        └───────┬────────────────────────────────────────────┘
                │ "Where we work" block
                ▼
        Location pages (×6 → ×11)
        each links UP to: parent service page + homepage
        never sideways to other locations
                ▲
                │ contextual links
        Blog / FAQ articles → relevant service page + 1 location page max
```

Enforced rules:

1. Mega menu and footer carry all 7 service links sitewide — every service page is one click from anywhere.
2. Location pages receive links only from their parent service page (and sitemap); they pass authority up, not sideways.
3. Blog articles must link to at least one service page with descriptive anchor text; that is their primary job.
4. No page ships without an inbound link from the mega menu or a parent page (no orphans — checked in Phase 9).
5. Anchor text is always descriptive (`forestry mulching in Ashland, KY`), never `click here` / `learn more` alone.


---

## Intent Map — which page owns which query

Added 2026-08-11, after the on-page sweep. **This is the anti-cannibalisation
contract.** One page per intent; if a new page would target something already in
this table, it belongs as a section on the page that owns it.

`validateSeo` enforces the boundary mechanically: it strips brand and geography
from every H1 and fails the build if two pages resolve to the same intent.

| Page | Primary intent | H1 | Supporting topics |
|---|---|---|---|
| `index.html` | forestry mulching + land clearing, region-wide | Take Back your property. Forestry mulching and land clearing in Southern Ohio and Eastern Kentucky. | services overview, owner, process, coverage, proof, reviews, FAQs |
| `services/forestryMulching.html` | **forestry mulching** (the money term) | Forestry Mulching in Southern Ohio & Eastern Kentucky | vs bulldozing, how it works, before/after, by town, cost |
| `services/landClearing.html` | **land clearing** for build sites | Land Clearing in Southern Ohio & Eastern Kentucky | buildable ground, stumps and root mat, step by step, cost per acre |
| `services/brushRemoval.html` | **brush removal / brush clearing** | Brush Removal Across Southern Ohio & Eastern Kentucky | fence rows, field edges, honeysuckle, what stays standing |
| `services/trailCutting.html` | **trail cutting**, ATV/UTV access | Trail Cutting Through Kentucky & Ohio Timber | trail width, drainage, hillsides, cost per mile |
| `services/stormCleanup.html` | **storm cleanup / storm damage** | Storm Cleanup in Southern Ohio & Eastern Kentucky | triage, access first, insurance paperwork, limits |
| `services/propertyCleanup.html` | **overgrown / neglected property cleanup** | Property Cleanup in Southern Ohio & Eastern Kentucky | inherited land, selling, staged work, junk and scrap |
| `services/huntingPropertyPrep.html` | **hunting property prep**, food plots, shooting lanes | Hunting Property Prep in Eastern Kentucky & Southern Ohio | plots, lanes, bedding, access, timing before season |
| `locations/forestry-mulching-{city}-{st}.html` (×6) | **forestry mulching in {City}** | Forestry Mulching in {City}, {ST} | county terrain, local job types, all 7 services localised, local FAQs |
| `faq/index.html` | general **forestry mulching / land clearing questions** | Forestry Mulching & Land Clearing FAQs | pricing, scheduling, insurance, access, aftercare, payment |
| `company/index.html` | **who BlueGrid is**, owner-operated, trust | Owner-Operated Land Clearing in Southern Ohio & Eastern Kentucky | services, why choose, how we work, territory, proof |
| `insights/index.html` | **land management advice** hub | Land Management Insights | article index |
| `insights/*` (×7) | one long-tail question each | e.g. Brush Hogging vs Forestry Mulching: Which One Do You Need? | see each article |

### Terms deliberately assigned

| Term | Owned by | Why not elsewhere |
|---|---|---|
| brush hogging | `insights/brush-hogging-vs-forestry-mulching.html` | Comparison intent, not a service we sell. The service pages reference it, never target it. |
| tree removal | *unassigned* | We do storm and clearing work, not climbing removals. `stormCleanup` states the limit rather than competing for the term. |
| driveway reclaim | `services/trailCutting.html` (access lanes) | Covered as access work; no separate page until search volume justifies one. |
| land management | `insights/` hub | Editorial term, not a service line. |
| Tri-State | *unassigned* | The site names counties and towns instead, which is what people actually type. |

### Heading rule, restated

Content Guideline 2 already said it and the service pages were not following it:
**an H2 that is not searchable is a design element, not an H2.** Thirty-six were
rewritten on 2026-08-11. The voice lives in `.sectionKicker` above each heading,
which is why the topic can sit in the H2 without flattening the page.

---

## Content Guidelines

1. **No AI fluff.** Ban the filler register: "nestled in the heart of", "look no further", "we understand that", "in today's fast-paced world". If a sentence could appear on any competitor's site unchanged, cut or rewrite it.
2. **Every H2 is a real search intent.** Each H2 must be a question or phrase a landowner would actually type ("How much does forestry mulching cost per acre?", "Forestry mulching vs. bulldozing"). If it isn't searchable, it's a design element, not an H2.
3. **Write from the machine, not the brochure.** Specifics beat adjectives: drum mulcher on a tracked skid steer, acreage per day, what a mulched finish looks like after 30 days, why slopes and wet ground change the answer. The reader should sense the writer has run the equipment.
4. **Local proof or it doesn't count.** Location pages must contain locally true content: terrain (hillside cedar, bottomland brush), local project types, county names, honest drive-time statements. Swapping the city name must break the page — that's the uniqueness test against doorway-page thinness.
5. **Answer cost questions directly.** Give real ranges and the factors that move them. Cost transparency is the top intent in this industry and most competitors dodge it — that's the opening.
6. **One CTA.** Every page funnels to the Free Estimate form. No competing conversions.
7. **Honest imagery.** Real BlueGrid job photos with truthful `alt` text (service + place only when accurate). No stock-photo forestry.
8. **Readable structure.** Short paragraphs (≤ 4 lines), scannable lists, tables for cost/comparison content. Front-load the answer in the first sentence under each H2 (snippet-friendly).
