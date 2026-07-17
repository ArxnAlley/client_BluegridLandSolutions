# Phase 7 Prompt — SEO Content Build (Service Pages, Location Pages, Article Briefs)

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

---

You are building the SEO content tier of the BlueGrid Land Solutions website.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching and land clearing, Southern Ohio + Eastern Kentucky.
- **Site root:** `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\` — a premium single-page site with a Free Estimate form already exists (`index.html`, `css/`, `js/`). Study it first; every new page must look and feel like the same hand-built site.
- **Code standards:** read `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\codeStyle.md` first and follow it exactly (camelCase classes/IDs/files, section banner comments, expanded formatting).
- **Authoritative specs — read all three before writing a line of HTML:**
  - `docs/servicePageArchitecture.md` — template anatomy (11 sections per service page), URL/file conventions, internal-linking rules, related-services map, per-page keywords.
  - `docs/seoPlan.md` — exact title tags, meta descriptions, structured data inventory, internal linking map, content guidelines.
  - `docs/forestryModuleSchema.md` — the lead schema behind the estimate form.
- **Form contract essentials (inline):** the estimate form posts JSON (`text/plain;charset=utf-8`) to the Apps Script endpoint at `?action=leads.create`. `serviceNeeded` enum: `Forestry Mulching`, `Land Clearing`, `Brush Removal`, `Trail Cutting`, `Storm Cleanup`, `Property Cleanup`, `Hunting Property Prep`, `Other`. Each service page embeds the same form with its own service preselected and `sourcePage` set to the page path. Reuse the existing form markup/JS as a shared component — do not fork its logic.

## Deliverables

### 1. Seven service pages (in `services/`)

`forestryMulching.html`, `landClearing.html`, `brushRemoval.html`, `trailCutting.html`, `stormCleanup.html`, `propertyCleanup.html`, `huntingPropertyPrep.html`

Each implements the full 11-section anatomy from `servicePageArchitecture.md` (header/mega menu, breadcrumb, hero, intent paragraph, benefits, process, gallery, service FAQ with `FAQPage` JSON-LD, embedded preselected estimate form, related services, footer), with the exact title/meta from `seoPlan.md`, plus `Service` and `BreadcrumbList` JSON-LD.

### 2. First six location pages (in `locations/`)

Hyphenated slugs (deliberate exception to camelCase — the URL is an SEO surface):

`forestry-mulching-ashland-ky.html`, `forestry-mulching-portsmouth-oh.html`, `forestry-mulching-ironton-oh.html`, `forestry-mulching-chillicothe-oh.html`, `forestry-mulching-grayson-ky.html`, `forestry-mulching-morehead-ky.html`

Each: title/meta per the `seoPlan.md` location patterns, `BreadcrumbList` JSON-LD, embedded estimate form (Forestry Mulching preselected), link up to `services/forestryMulching.html` and Home only. Content must be locally true — county, terrain, typical local project types, honest drive-time framing. Apply the uniqueness test: swapping the city name must break the page. No near-duplicate shells.

### 3. Homepage integration

Update the homepage mega menu, services section cards, and footer so every new page has inbound links per the internal-linking rules (no orphans). Do not otherwise redesign the homepage.

### 4. Five article briefs (briefs only — no articles yet)

Write to `docs/articleBriefs.md`, each brief: working title, target query + secondaries, search intent, H2 outline (every H2 a real query), internal links to include, FAQ schema candidates, 150-word angle summary.

1. "Forestry Mulching vs. Excavation in Southern Ohio: Which Does Your Land Need?"
2. "How Much Does Land Clearing Cost per Acre in Kentucky and Ohio?" (real ranges + the factors that move them)
3. "Preparing a Hunting Property in Eastern Kentucky: A Timeline That Beats Opening Day"
4. "Can You Clear Land Yourself? Rental Equipment vs. Hiring a Pro"
5. "What Happens to the Mulch? Why Mulched Land Recovers Faster Than Bulldozed Land"

## Content Rules (enforced)

- No AI fluff — banned register per `seoPlan.md` ("nestled in the heart of", "look no further", "we understand that"). If a sentence fits any competitor's site, rewrite it.
- Every H2 = a real search intent, phrased as landowners type it.
- Answer cost questions with real ranges; specifics over adjectives (equipment, acreage/day, finish quality at 30 days).
- One CTA per page: the Free Estimate form.
- Real photos from `graphics/images/` only; truthful `alt` text; lazy-load below-the-fold imagery.

## Acceptance Criteria

- [ ] 13 new pages + updated homepage; visual parity with the existing site on mobile/tablet/desktop.
- [ ] Titles/metas byte-match `seoPlan.md`; JSON-LD present per the structured-data inventory and free of syntax errors.
- [ ] Every page reachable from the mega menu or a parent page; every internal link resolves (relative paths correct from `services/` and `locations/` depth — verify `css/`, `js/`, `graphics/` references).
- [ ] Each service page's form preselects its own `serviceNeeded` enum value and sets `sourcePage` to its own path.
- [ ] No two pages share an H1, title, meta description, or FAQ question.
- [ ] Location pages pass the city-swap uniqueness test.
- [ ] `docs/articleBriefs.md` contains all 5 briefs, complete per the brief format.

## Outputs Required for Later Phases

- The full page inventory (13 pages + homepage) — Phase 8 generates `sitemap.xml` from it and Phase 9 QA runs against all of it.
- `docs/articleBriefs.md` — the future blog build consumes it.
- Note for Phase 13: location pages are hand-built here; if the model scales past ~12 pages, migrate to the data-driven generation model specced in `phasePrompts/phase13ServiceAreaExpansion.md`.
