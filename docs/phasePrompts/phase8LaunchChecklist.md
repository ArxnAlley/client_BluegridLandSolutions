# Phase 8 Prompt — Launch Checklist Execution

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

---

You are taking the BlueGrid Land Solutions website from "built" to "live". Work through every section; produce a final pass/fail report at the end.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching and land clearing, Southern Ohio + Eastern Kentucky.
- **Site root:** `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\` — static site (single page + `services/` + `locations/` if Phase 7 ran), pure HTML/CSS/JS, no build step.
- **Backend:** Google Apps Script web app (`BlueGridAPI`) receiving the Free Estimate form at `?action=leads.create`, writing to the `BlueGrid Leads` Google Sheet. POSTs use `Content-Type: text/plain;charset=utf-8` with a JSON body; the response envelope is `{ success, data | error }` (HTTP always 200).
- **Code standards:** `codeStyle.md` at the site root.
- **Module schema (for the smoke test):** `docs/forestryModuleSchema.md`; a valid lead requires `fullName`, `phone`, `email`, `propertyAddress`, `serviceNeeded` (e.g., `Forestry Mulching`), plus client-generated `leadId` (`BG-` + 13-digit timestamp) and ISO `submittedAt`.

## Checklist

### 1. Hosting + domain + DNS

- Static host (Netlify / Cloudflare Pages / GitHub Pages — pick with the owner; no server runtime is needed).
- Custom domain connected; DNS A/CNAME per host docs; HTTPS certificate issued; apex ↔ `www` redirect chosen one way and enforced.
- Canonical URL decided (with/without `www`) and used consistently in canonicals, sitemap, and GBP link.

### 2. TODO swaps (grep the codebase for `TODO` — every hit must be resolved)

| Placeholder | Replace with |
|-------------|--------------|
| Owner phone number | Real number, identical everywhere (NAP consistency with GBP) |
| Owner email | Real address |
| Facebook URL | Real page URL |
| Hero drone video | Final video file — compressed (H.264/H.265, target < 8 MB), `poster` image set, `muted playsinline autoplay loop`, reduced-motion fallback to poster |
| Apps Script endpoint URL | Live `BlueGridAPI` deployment URL (`.../exec`) in the website form config constant |
| Any lorem/sample copy or placeholder image | Final content |

### 3. Head + identity assets

- Favicon set (ico + png sizes + apple-touch-icon), referenced on every page.
- Open Graph + Twitter card tags on every page: `og:title`, `og:description`, `og:image` (1200×630 branded job photo), `og:url`.
- `<html lang="en">`, correct `<meta name="viewport">`, canonical tag on every page.

### 4. 404 page

- `404.html` styled like the site, links back to homepage + estimate form; configured on the host (hosts differ — verify an actual bad URL returns it with HTTP 404).

### 5. Analytics

- GA4 (or the owner's chosen lightweight alternative) on every page.
- Events: form submission success (fires only on `json.success === true`), phone-number tap, estimate-form section view.
- Verify GBP UTM convention traffic (`utm_source=google&utm_medium=gbp`) is visible as a distinct source.

### 6. Form endpoint smoke test (live, end-to-end)

1. Submit a real test lead from the live domain on a phone (cell network, not Wi-Fi).
2. Verify: success message with `leadId` shown; row appended to the `leads` tab with all fields in the correct columns; `status` = `new`; owner notification email arrived; auto-reply arrived at the test email.
3. Submit again with the same `leadId` replayed (dev tools) — verify dedupe: success envelope, no second row.
4. Submit with a required field empty — verify field-keyed error surfaces in the UI and no row is written.
5. Delete test rows afterward and note the deletion in the report.

### 7. sitemap.xml + robots.txt

- `sitemap.xml`: every canonical page (homepage, all `services/`, all `locations/`, 404 excluded), absolute URLs on the canonical domain.
- `robots.txt`: allow all, `Sitemap:` line pointing at the sitemap URL.
- Submit the sitemap in Google Search Console; verify the property (DNS or HTML-file method); request indexing of the homepage and the forestry mulching service page.

### 8. Final sweep

- Run a broken-link check across all pages (internal + outbound).
- Load the live site cold on mobile: hero video plays (or poster shows), no mixed-content warnings, no console errors.
- Lighthouse quick pass on homepage ≥ 90 all four categories (full QA matrix is Phase 9 — do not skip Phase 9 because this passed).

## Acceptance Criteria

- [ ] Site serves on the custom domain over HTTPS with the chosen canonical host name.
- [ ] `grep -ri "TODO" site files` returns zero actionable hits.
- [ ] Smoke test steps 1–5 all pass against the live endpoint.
- [ ] Sitemap submitted and accepted in Search Console; robots.txt reachable.
- [ ] Analytics receiving events from the live domain.
- [ ] Written launch report: date, host, domain records created, smoke-test evidence, anything deferred.

## Outputs Required for Later Phases

- Live base URL + Search Console access — Phase 9 (QA) runs against production; Phase 7/13 pages must be added to the sitemap as they ship.
- The deployed Apps Script URL recorded in `docs/` (Phase 2 dashboard config and Phase 11 photo service need it).
