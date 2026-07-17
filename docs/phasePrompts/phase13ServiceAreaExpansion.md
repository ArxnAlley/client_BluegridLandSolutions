# Phase 13 Prompt — Service-Area Data Model & Location Page Scaling

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

**Sequencing note:** post-launch growth phase. Requires Phase 7's hand-built location pages as the quality template. Trigger to run this phase: the owner wants coverage beyond the initial 11 cities, or hand-maintenance of location pages exceeds ~12 files. This closes the "nationwide/regional service-area data model" gap — hand-writing HTML per city stops scaling exactly when the business starts working.

---

You are converting BlueGrid's location pages from hand-built files into a data-driven generation system, without sacrificing the hand-built quality bar.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching and land clearing. Current market: Southern Ohio + Eastern Kentucky (11 cities: Portsmouth, Chillicothe, Jackson, Ironton, Gallipolis, Waverly OH; Ashland, Greenup, Grayson, Morehead, Louisa KY). Ambition: widening radius, potentially multi-crew regional coverage.
- **Site root:** `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\` — static site, pure HTML/CSS/JS, currently no build step. Existing location pages: `locations/forestry-mulching-{city}-{st}.html` (Phase 7 built 6 by hand to the spec in `docs/servicePageArchitecture.md` and `docs/seoPlan.md`).
- **Code standards:** `codeStyle.md` at the site root.
- **SEO ground rules that survive scaling:** every location page must pass the city-swap uniqueness test (swapping the city name must break the page); one page per real intent; no doorway shells. These come from `docs/seoPlan.md` and are non-negotiable — the data model exists to enforce them, not bypass them.

## Design (implement exactly)

### 1. Service-area data model

`data/serviceAreas.js` (or `.json`) — one record per location, the single source of truth for everything location-shaped on the site:

| Field | Type | Purpose |
|-------|------|---------|
| `slug` | string | `ashland-ky` — URL + file naming |
| `city`, `state`, `stateAbbr`, `county` | string | Copy + schema `areaServed` |
| `coordinates` | `{ lat, lng }` | Future map embeds / `areaServed` GeoCircle |
| `tier` | enum `core` \| `extended` \| `frontier` | core = full pages; extended = listed in service-area copy; frontier = tracked, not published |
| `driveTimeMinutes` | number | Honest "we're X from you" copy |
| `terrainNotes` | string[] | Locally-true content atoms (e.g., "hillside cedar", "creek-bottom brush") — the uniqueness raw material |
| `localProjectTypes` | string[] | e.g., "hunting tracts", "new-build homesites" |
| `neighboringSlugs` | string[] | Service-area copy ("also serving...") — never used for location-to-location links |
| `servicesOffered` | string[] | `serviceNeeded` enum subset — which service × city pages may exist |
| `reviewCities` | string[] | Match keys against `reviewsData.js` `reviewerCity` |
| `pageStatus` | enum `published` \| `draft` \| `none` | Sitemap + generation control |

Seed all 11 current cities (tier `core`) with real, verified values — county names and drive times must be checked, not guessed.

### 2. Generation model (choose the lightest tool that works)

A small local Node build script, `tools/buildLocationPages.js`, run manually by the studio — not a framework, not a hosted pipeline:

- Input: `data/serviceAreas.js` + one HTML template per service derived from the Phase 7 hand-built pages (template lives in `tools/templates/`).
- Output: static `locations/{service-slug}-{slug}.html` files, byte-stable (re-running without data changes produces no diff), only for records where `pageStatus = published` and the service is in `servicesOffered`.
- Templates interleave the data atoms (`terrainNotes`, `localProjectTypes`, `driveTimeMinutes`, county) into full sentences with per-service copy blocks, so output prose differs structurally between cities. **Enforce uniqueness mechanically:** the script fails if any two generated pages exceed a similarity threshold on body text (simple shingle overlap check) — quality gate in code, not in memory.
- The script also regenerates `sitemap.xml` (all published pages + static pages) and a `locations/index.html` service-area hub, and updates the "Where we work" blocks on service pages from the same data (marked injection regions in the HTML, clearly banner-commented).
- Hand-built Phase 7 pages are migrated into the template system in this phase — after migration, generated output for those 6 must preserve their existing URLs and improve-or-match their content (diff and review manually).

### 3. Expansion workflow (document in `docs/serviceAreaOps.md`)

1. Owner names new towns → studio adds records as tier `frontier`, `pageStatus: none` (tracked, invisible).
2. When jobs/leads actually come from a town (check `propertyAddress` in the leads sheet), promote to `extended` (mentioned in copy) then `core` + `draft`.
3. Studio fills the content atoms from a real conversation with the owner about that terrain, generates as `draft`, reviews, flips to `published`, runs the script, deploys, submits the updated sitemap in Search Console.
4. GBP service areas (max 20 — `docs/gbpPlaybook.md`) are curated from `core`/`extended` tiers; note the cap forces prioritization there even when the site scales past 20.

## Acceptance Criteria

- [ ] `data/serviceAreas.js` seeded with all 11 cities, verified counties and drive times.
- [ ] Build script regenerates the 6 existing location pages with unchanged URLs and equal-or-better content (manual diff review recorded).
- [ ] Adding a fictional 12th record as `published` in a dry run produces a complete, unique, valid page + sitemap entry; deleting it restores byte-stable output.
- [ ] Similarity gate demonstrably fails the build when two records are given near-identical content atoms.
- [ ] Generated pages pass the Phase 9 QA sections (Lighthouse ≥ 90, structured data valid, no broken links) — spot-check at least 2.
- [ ] `docs/serviceAreaOps.md` documents the tier workflow end to end.

## Outputs Required for Later Phases

- `data/serviceAreas.js` becomes the canonical service-area registry for any future consumer: dashboard lead-map coloring, GBP service-area sync, per-city ad landing pages, and the Nulo Edge shell's client-profile data. Nothing else on the site may hardcode a city list after this phase ships.
