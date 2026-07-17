# Phase 9 Prompt — Full QA Protocol

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

---

You are running the complete quality audit of the BlueGrid Land Solutions website. Deliverable: fix what you can in code, and produce `docs/qaReport.md` recording every check, result, and fix.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching and land clearing, Southern Ohio + Eastern Kentucky.
- **Site root:** `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\` — static site: `index.html`, `services/` (7 pages), `locations/` (6 pages), `404.html`, pure HTML/CSS/JS. Live production URL is in the Phase 8 launch report in `docs/` (test against production where possible, local files otherwise).
- **Code standards:** `codeStyle.md` at the site root — fixes must match it.
- **Form contract:** the Free Estimate form posts JSON (`text/plain;charset=utf-8`) to the Apps Script endpoint `?action=leads.create`. Required: `fullName`, `phone`, `email`, `propertyAddress`, `serviceNeeded`. Response envelope `{ success, data | error }`; the UI must key off `json.success`. Full schema: `docs/forestryModuleSchema.md`.

## QA Protocol

### 1. Lighthouse — 90+ in all four categories, every page

- Run Lighthouse (mobile emulation first, then desktop) on: homepage, all 7 service pages, all 6 location pages, 404.
- Gate: Performance, Accessibility, Best Practices, SEO all ≥ 90 on mobile for every page.
- Record scores per page in a table. Common offenders to fix: unoptimized images (serve scaled, lazy-load below the fold), hero video weight, render-blocking CSS, missing image dimensions (CLS).

### 2. WCAG 2.1 AA audit checklist

- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for large text), including text over hero imagery/video.
- [ ] Full keyboard pass: every interactive element reachable in a logical order, visible focus style, no traps; mobile menu operable by keyboard and closes on Escape.
- [ ] One `<h1>` per page; heading levels never skip; landmarks (`header`, `nav`, `main`, `footer`) present.
- [ ] Every form input has a programmatic `<label>`; error messages announced (`aria-live` or `aria-describedby` wiring); required fields marked in markup, not color alone.
- [ ] All meaningful images have truthful `alt`; decorative images `alt=""`.
- [ ] Touch targets ≥ 44×44 px; page zooms to 200% without loss of content.
- [ ] Video: no audio (or controls if audio); no flashing content.

### 3. Cross-device / cross-browser matrix

| Surface | Targets |
|---------|---------|
| Mobile | iPhone Safari (small + large), Android Chrome |
| Tablet | iPad Safari portrait + landscape |
| Desktop | Chrome, Firefox, Edge at 1366, 1920; one ultrawide sanity check |

Per surface: layout integrity, mega menu, hero (video/poster), gallery, form usability, footer. Record pass/fail per cell.

### 4. Form validation + submission E2E

- Empty submit → all required-field errors shown, no request fired.
- Each required field individually missing → correct field-keyed error.
- Invalid email format rejected client-side.
- Valid submit → success UI with `leadId` reference; row lands in the `leads` tab with columns aligned to `LEADS_HEADERS`; enum values byte-exact.
- Duplicate `leadId` replay → success envelope, no duplicate row (dedupe).
- API unreachable (block the request) → human-readable failure message, form data not lost, resubmit works.
- Preselection: every service page's embedded form preselects its own service; `sourcePage` matches the submitting page.
- Honeypot filled → no row written.

### 5. Reduced-motion check

- Emulate `prefers-reduced-motion: reduce`: hero video does not autoplay (poster shown), scroll/entrance animations disabled or reduced to fades, no parallax. Nothing becomes unreachable when animations are off.

### 6. Structured-data validation

- Every JSON-LD block through Google's Rich Results Test (or schema.org validator for types Google doesn't preview): `LocalBusiness` (homepage only), `Service` + `FAQPage` + `BreadcrumbList` (service pages), `BreadcrumbList` (location pages).
- Zero errors; warnings triaged and either fixed or justified in the report.
- Confirm no `Review`/`AggregateRating` self-markup exists anywhere.

### 7. Broken-link + asset scan

- Crawl all pages: every internal link resolves (watch relative paths from `services/` and `locations/` depth), every asset (css/js/images/video/favicon) 200s, no mixed content, outbound links (Facebook, GBP) correct.
- `sitemap.xml` URLs all 200 and canonical; no page in the sitemap redirects; robots.txt reachable.

## Acceptance Criteria

- [ ] `docs/qaReport.md` records every section above with per-page/per-case results and a fix log (file + change) for everything repaired.
- [ ] All four Lighthouse categories ≥ 90 on every page (mobile), evidenced by recorded scores.
- [ ] Zero broken links/assets; zero structured-data errors; all form E2E cases pass.
- [ ] Any issue not fixable in this phase is listed under "Open Items" with severity and owner.

## Outputs Required for Later Phases

- `docs/qaReport.md` — the regression baseline; future phases (7 additions, 11–13) re-run the relevant sections and append.
