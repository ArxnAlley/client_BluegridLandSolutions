# Service Page Architecture

BlueGrid Land Solutions · 7 future service pages · Southern Ohio + Eastern Kentucky

Architecture for the service-page tier that sits between the homepage and future location pages. Built in Phase 7 (`phasePrompts/phase7SeoContent.md`); title tags, meta descriptions, and structured data specifics live in `seoPlan.md`.

---

## Page Inventory

All seven pages live in `services/` under the site root, camelCase file names per `codeStyle.md`.

| Page | File | Primary Intent |
|------|------|----------------|
| Forestry Mulching | `services/forestryMulching.html` | "forestry mulching near me / in southern Ohio" |
| Land Clearing | `services/landClearing.html` | "land clearing contractor / lot clearing cost" |
| Brush Removal | `services/brushRemoval.html` | "brush removal / overgrown lot cleanup" |
| Trail Cutting | `services/trailCutting.html` | "trail cutting / ATV trail building" |
| Storm Cleanup | `services/stormCleanup.html` | "storm damage / fallen tree cleanup" |
| Property Cleanup | `services/propertyCleanup.html` | "property cleanup / fence line clearing" |
| Hunting Property Prep | `services/huntingPropertyPrep.html` | "hunting land improvement / food plot clearing" |

Each page's name maps one-to-one onto a `serviceNeeded` enum value from `forestryModuleSchema.md`. That mapping drives the embedded form preselection (below).

---

## URL & File Conventions

- Service pages: camelCase `.html` files in `services/` (matches the project code style; these are brand/UX pages first, keyword pages second).
- Future location pages: hyphenated exact-match slugs in `locations/` (e.g., `locations/forestry-mulching-ashland-ky.html`) — a deliberate, documented exception to camelCase because the URL itself is an SEO surface for those pages. See `seoPlan.md`.
- Shared assets: service pages reuse the site's `css/` and `js/` files; a single `css/stylePages.css` covers all service-page-specific styling. No per-page stylesheets.
- Every page is reachable within one click of the homepage and links back to it (logo + breadcrumb).

---

## Shared Template Anatomy

Every service page uses the same section skeleton, in this order. Consistency is the feature: visitors and crawlers learn the pattern once.

| # | Section | Requirements |
|---|---------|--------------|
| 1 | Header / mega menu | Identical to homepage header. Current service highlighted in the Services menu. |
| 2 | Breadcrumb | `Home › Services › {Service}`; matching `BreadcrumbList` JSON-LD. |
| 3 | Hero | Service-specific job photo (real BlueGrid work, not stock). H1 targets real search intent, includes the region: e.g., "Forestry Mulching in Southern Ohio & Eastern Kentucky". One primary CTA → estimate form section anchor. |
| 4 | Intent paragraph | 2–4 sentences directly under the H1 answering "is this the service I need?" — what it is, what land it suits, what it costs relative to alternatives. No filler. |
| 5 | Benefits | 3–6 concrete benefits as cards or list. Specific claims (e.g., "no burn piles, no hauling — mulch stays as ground cover"), never generic ("quality service"). |
| 6 | Process | Numbered 3–5 step walkthrough: contact → site walk / estimate → work → final walkthrough. Sets expectations and answers "what happens when I call?". |
| 7 | Gallery | 4–8 before/after photos from real jobs of this service type. Lazy-loaded, descriptive `alt` text with service + locality when truthful. |
| 8 | Service-specific FAQ | 4–6 questions phrased as real queries ("How much does forestry mulching cost per acre in Ohio?"). Marked up with `FAQPage` JSON-LD. No duplicated questions across service pages. |
| 9 | Embedded estimate form | The same Free Estimate form component as the homepage, posting to the same API, with `serviceNeeded` preselected (below). |
| 10 | Related services | 2–3 sibling service links with one-line descriptions (mapping below). |
| 11 | Footer | Sitewide footer: NAP (name/area/phone), full service list, service-area cities, Facebook link. |

### Estimate form preselection

- Each service page renders the shared form with its own `serviceNeeded` option preselected (exact enum string from `forestryModuleSchema.md`).
- `sourcePage` is set to the page path (e.g., `services/forestryMulching.html#estimateForm`), giving per-page lead attribution in the sheet for free.
- The homepage form additionally honors a `?service=` query parameter mapping to enum values, so any external link can deep-link a preselected form.
- The select stays user-editable — preselection is a default, not a lock.

---

## Internal Linking Rules

### From the homepage

- The header mega menu lists all 7 services; each entry links to its service page (never to a homepage anchor once the service pages exist).
- The homepage services overview section links each service card to its page.
- The footer service list links all 7 pages sitewide.

### From service pages

- Breadcrumb links to Home.
- Related-services block per the map below (2–3 links, chosen by shared audience, not randomness):

| Page | Related Services |
|------|------------------|
| Forestry Mulching | Land Clearing, Brush Removal, Hunting Property Prep |
| Land Clearing | Forestry Mulching, Property Cleanup, Storm Cleanup |
| Brush Removal | Forestry Mulching, Property Cleanup, Trail Cutting |
| Trail Cutting | Hunting Property Prep, Brush Removal, Forestry Mulching |
| Storm Cleanup | Property Cleanup, Land Clearing, Brush Removal |
| Property Cleanup | Brush Removal, Storm Cleanup, Land Clearing |
| Hunting Property Prep | Trail Cutting, Forestry Mulching, Land Clearing |

- When location pages exist, each service page adds a "Where we work" block linking to its own location pages (e.g., Forestry Mulching → `forestry-mulching-ashland-ky`, `forestry-mulching-portsmouth-oh`, ...). Location pages link back to their parent service page and Home only — no location-to-location cross-linking.
- Body copy may link sideways to one other service where genuinely relevant (e.g., Land Clearing mentioning mulching as the lighter alternative). Max 2 in-copy links per page.

### Rules

1. Every internal link uses descriptive anchor text (the target page's service name + region where natural), never "click here".
2. No orphans: any page shipped must be linked from the mega menu or a parent page in the same commit.
3. All internal links are root-relative and must resolve on the static host (verified in Phase 9's broken-link scan).

---

## Per-Page Target Keywords (OH/KY Geo Intent)

Primary drives the H1/title; secondaries become H2s and FAQ questions. Full title/meta strings live in `seoPlan.md`.

| Page | Primary Keyword | Supporting Keywords |
|------|-----------------|---------------------|
| Forestry Mulching | forestry mulching southern ohio | forestry mulching eastern kentucky · forestry mulching near me · forestry mulching cost per acre ohio · underbrush mulching ky |
| Land Clearing | land clearing southern ohio | land clearing contractor eastern kentucky · lot clearing near me · acreage clearing cost ohio · clearing wooded land for pasture ky |
| Brush Removal | brush removal southern ohio | brush clearing services kentucky · overgrown lot cleanup · honeysuckle and multiflora rose removal · fence row clearing |
| Trail Cutting | trail cutting services kentucky | atv trail building eastern kentucky · utv trail clearing ohio · hunting trail cutting · walking trail clearing wooded property |
| Storm Cleanup | storm cleanup southern ohio | fallen tree cleanup kentucky · storm damage debris removal · downed tree removal acreage · tornado damage land cleanup |
| Property Cleanup | property cleanup services ohio | overgrown property cleanup kentucky · vacant lot cleanup · fence line clearing · farm cleanup services |
| Hunting Property Prep | hunting property prep kentucky | food plot clearing eastern kentucky · shooting lane clearing ohio · hunting land improvement · deer habitat clearing |

Keyword rules:

- Every page pairs its service with at least one of the two regions (Southern Ohio / Eastern Kentucky) in the H1 or first paragraph — city-level targeting belongs to location pages, not service pages.
- One primary intent per page; if two keywords represent different intents, they belong on different pages.
- FAQ questions are keywords in question form — each one must be a query a real landowner would type.
