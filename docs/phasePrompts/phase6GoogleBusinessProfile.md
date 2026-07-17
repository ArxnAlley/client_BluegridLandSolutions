# Phase 6 Prompt — Google Business Profile Optimization

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

---

You are producing the complete Google Business Profile (GBP) playbook for a land clearing contractor. Deliverable is a document the owner (or Nulo Studio on their behalf) executes in the GBP console — you are writing specs and copy, not code.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching, land clearing, brush removal, trail cutting, storm cleanup, property cleanup, hunting property prep.
- **Market:** Southern Ohio (Portsmouth, Chillicothe, Jackson, Ironton, Gallipolis, Waverly) + Eastern Kentucky (Ashland, Greenup, Grayson, Morehead, Louisa). Service-area business: crews travel to the customer; the business address should be hidden.
- **Website:** single-page site with a Free Estimate form (built at `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\`); service pages under `services/` arrive in Phase 7. GBP website link points at the homepage; use UTM parameters so GBP traffic is distinguishable in analytics (`?utm_source=google&utm_medium=gbp`).
- **Content pipeline:** the owner posts job photos/videos to Facebook; GBP posting cadence must reuse that stream, not create a second content burden.
- Write the deliverable to `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\docs\gbpPlaybook.md` (professional markdown, camelCase filename convention).

## What the Playbook Must Contain

### 1. Categories

GBP allows only categories from Google's live, changing taxonomy — there is no "Forestry Mulching" category. Instruct the owner to search the live category picker and choose in this priority order, taking the highest available match:

- Primary: `Land clearing service` if it exists in the picker at setup time; otherwise `Excavating contractor`.
- Secondary (add all that exist): `Tree service`, `Landscaper`, `Lawn care service`, `Contractor`.

State explicitly: never leave primary as a generic category if a land-clearing-specific one exists; the primary category is the single strongest ranking input.

### 2. Services list

Add every service under the appropriate category with a 2–3 sentence plain-language description each (write them in the playbook): Forestry Mulching, Land Clearing, Brush Removal / Brush Hogging, Trail Cutting (ATV/UTV/walking), Storm Cleanup, Property Cleanup, Hunting Property Prep (food plots, shooting lanes), Lot Clearing, Fence Line Clearing, Pasture Reclamation. Descriptions mention Southern Ohio / Eastern Kentucky naturally, no keyword stuffing.

### 3. Service areas

Set service areas by city/county (GBP allows up to 20): the 11 cities above plus their counties (Scioto, Ross, Jackson, Lawrence, Gallia, Pike in OH; Boyd, Greenup, Carter, Rowan, Lawrence in KY). Hide the street address (service-area business).

### 4. Profile fundamentals checklist

Business description (write the 750-char version in the playbook — plain, specific, region-named, zero fluff), phone (same number as website — NAP consistency), hours, website URL with UTM, appointment link to the estimate form anchor, opening date, logo + cover image specs.

### 5. Photo strategy

- Cadence: minimum 3 photos/week, pulled from the same jobs being posted to Facebook.
- Mix: before/after pairs (the money shot in this trade), equipment-in-action, finished-result wide shots, occasional owner/crew photo (trust).
- Standards: real jobs only, landscape orientation preferred, no stock, no heavy filters, add photos from the job's city when creating them (recency + volume matter; geotag EXIF does not — don't chase it).
- Name files descriptively before upload (`forestry-mulching-ashland-ky-after.jpg`).

### 6. Review acquisition + reply templates

- Acquisition flow: at job completion (status `completed` in the module dashboard), owner texts the customer the GBP review short link the same day — write the exact ask text (two variants: text message, email). One polite follow-up after 5–7 days, then stop.
- Target velocity: every completed job gets the ask; realistic goal 2–4 new reviews/month.
- Write 6 reply templates: positive (3 variants — vary structure, mention the service + city when the reviewer did), neutral, negative (calm, take-it-offline, owner's phone), fake/mistaken-identity (flag + factual public reply).
- Hard rule: never incentivize reviews; never gate ("only ask happy customers via filter") — both violate Google policy.

### 7. Weekly post cadence (tied to Facebook)

- 1 GBP post/week minimum, recycled from that week's best Facebook post: job spotlight (before/after + 2 sentences + city), seasonal offer, or educational snippet ("what 3 acres of honeysuckle looks like after mulching").
- Every post ends with the same CTA → Free Estimate form (UTM-tagged link).
- Provide a 4-week rolling template calendar in the playbook.

### 8. Q&A seeding

Write 6 owner-seeded Q&A pairs from real intents: cost per acre, how fast, do you haul debris, lot size limits, insured?, service area limits. These mirror the website FAQ (Phase 7) — same answers, shorter.

## Acceptance Criteria

- [ ] `docs/gbpPlaybook.md` exists and covers all 8 sections with finished copy (descriptions, review asks, reply templates, Q&A, 4-week calendar) — paste-ready, not outlines.
- [ ] Category guidance handles taxonomy drift (search-first instruction + fallback order).
- [ ] All 11 cities + counties enumerated in the service-area section.
- [ ] Nothing in the playbook violates GBP policy (no review gating/incentives, no keyword-stuffed business name like "BlueGrid Land Solutions - Forestry Mulching Ashland").

## Outputs Required for Later Phases

- The UTM convention (`utm_source=google&utm_medium=gbp`) — Phase 8 analytics setup must segment GBP traffic.
- Review short link — Phase 12 (reviews integration) reuses it on the website.
- Q&A copy — Phase 7 keeps website FAQ answers consistent with it.
