# Phase 2 Prompt — Nulo Edge Forestry Module Dashboard

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

---

You are building the operations dashboard for the Forestry Module — an isolated Nulo Edge vertical module.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching and land clearing, Southern Ohio + Eastern Kentucky.
- **Studio:** Nulo Studio. Before writing any code, read `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\codeStyle.md` and follow it exactly (camelCase classes/IDs/files, expanded formatting, section banners, generous whitespace).
- **Pattern (Nulo Edge):** static dashboard SPA in pure HTML/CSS/JS + Google Sheet database + Google Apps Script web app API. Precedent: the 740Eatz bakery module (`C:\Dev\NuloWorkspace\740EatzDashboard\`) — skim it for structure and conventions, but this module is fully isolated and shares no code or data with it.
- **What already exists:** the BlueGrid marketing website (`C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\`) submits leads via `?action=leads.create` to the module's Apps Script API (`BlueGridAPI`, built in Phase 10, local project at `C:\Dev\NuloWorkspace\BlueGridAPI\`). The API reads/writes the "BlueGrid Leads" Google Sheet (Phase 3).
- **Authoritative schema:** `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\docs\forestryModuleSchema.md`. The essentials are inlined below.

## Data Contract (inline)

Every lead record has exactly these fields, in this order (`LEADS_HEADERS`):

```
leadId, submittedAt, fullName, phone, email, propertyAddress,
estimatedAcres, serviceNeeded, projectDescription, preferredContactMethod, preferredTime,
photoCount, photoNames, photoUrls, sourcePage,
leadSource, utmSource, utmMedium, utmCampaign, facebookCampaign,
propertySize, terrainType,
status, estimateAmount, assignedTo, internalNotes, lastUpdated
```

- `status` enum (pipeline order): `new` → `contacted` → `estimated` → `scheduled` → `inProgress` → `completed`; `lost` is terminal from any active status. Forward skips are legal.
- `serviceNeeded` enum: `Forestry Mulching`, `Land Clearing`, `Brush Removal`, `Trail Cutting`, `Storm Cleanup`, `Property Cleanup`, `Hunting Property Prep`, `Other`.
- `terrainType` enum: `flat`, `rolling`, `steep`, `mixed`, `woodedWetland` — owner-set after site review; empty on new leads.
- `estimatedAcres` is a numeric string from the website's estimate modal ("Approximate Acres"); may be empty. `propertySize` (TOTAL parcel acres, owner-set) is distinct from it.
- Attribution fields (`leadSource`, `utmSource`, `utmMedium`, `utmCampaign`, `facebookCampaign`) are website-stamped strings; empty string when absent.
- `photoNames` / `photoUrls` arrive as JSON arrays (may be empty). `photoUrls` is populated only after the Phase 11 photo upload service ships — render gracefully either way.
- Timestamps are ISO 8601 strings.

### API endpoints (Apps Script web app; base URL provided at deploy time)

| Method | Action | Request | Response |
|--------|--------|---------|----------|
| GET | `?action=leads.list&apiKey=...` | — | `{ success, data: { leads: [...], count } }`, newest first |
| POST | `?action=leads.update` | `{ apiKey, leadId, status?, estimateAmount?, assignedTo?, internalNotes?, propertySize?, terrainType? }` | `{ success, data: { lead } }` |

- POST with `Content-Type: text/plain;charset=utf-8`, JSON body (Apps Script answers no CORS preflight).
- HTTP is always 200; `json.success` is the real status. On failure surface `error.message`.
- Error codes you must handle: `VALIDATION_ERROR` (field-keyed), `NOT_FOUND`, `UNAUTHORIZED`, `LOCK_TIMEOUT`.

## Objectives

Build a standalone dashboard SPA at `C:\Dev\NuloWorkspace\BlueGridDashboard\` that lets the owner work leads end to end: see new leads, move them through the pipeline, record estimates, and keep notes.

## Deliverables

```
BlueGridDashboard/
    index.html
    css/styleDashboard.css
    js/dashboardConfig.js     (API base URL + apiKey constants, single source)
    js/dashboardAPI.js        (ALL fetch logic — no fetch calls anywhere else)
    js/dashboardJS.js         (state, rendering, event handlers)
```

Screens (client-side view switching, one HTML file):

1. **Overview** — stat tiles: new leads, leads this week, active pipeline count, total estimated value (sum of `estimateAmount` for `estimated`/`scheduled`/`inProgress`), plus a recent-leads list and a lead-source breakdown (counts by `leadSource` / `utmCampaign` — the attribution fields make marketing ROI visible for free).
2. **Pipeline board** — one column per status in pipeline order (`lost` as a collapsed/last column). Cards show `fullName`, `serviceNeeded`, city parsed from `propertyAddress` (best effort), age of lead. Clicking a card opens the lead detail.
3. **Leads table** — sortable/filterable table (filter by `status`, `serviceNeeded`; search by name/phone/address), newest first.
4. **Lead detail** (drawer or panel) — every field; photos section (Phase 1: list `photoNames` + `photoCount` with a "photos not yet uploaded" note; if `photoUrls` is non-empty render thumbnails linking to Drive); status action buttons (only legal transitions); `estimateAmount`, `assignedTo`, `internalNotes`, `propertySize`, `terrainType` editing with an explicit Save.

Behavioral requirements:

- **Pessimistic updates:** every status change or field save awaits `leads.update` success before mutating in-memory state and re-rendering. One shared write helper — all action sites flow through it (740Eatz lesson).
- **Graceful degradation:** if `leads.list` fails, show a persistent amber banner ("Can't reach the leads API — showing nothing / last loaded data") and keep the UI alive. Re-check on manual refresh action.
- **Empty states** for every screen (zero leads is day-one reality).
- **No demo data pretending to be real.** If `dashboardConfig.js` has a blank API URL, show a clearly labeled setup notice — not fake leads.
- Escape all user-originated strings on render (XSS: names, notes, addresses come from a public form).
- Responsive: usable on a phone (the owner lives in a truck); board degrades to stacked columns.
- No frameworks, no build step, no external dependencies.

## Acceptance Criteria

- [ ] `leads.list` renders real sheet rows across all four screens; count matches the sheet.
- [ ] Status change on the board persists (verify the sheet row changed) and survives a hard refresh.
- [ ] Saving `estimateAmount` + `internalNotes` persists and re-renders; `lastUpdated` visibly updates.
- [ ] Illegal transitions are not offered (e.g., `completed` from `new`); `lost` offered from all active statuses.
- [ ] API-down state shows the amber banner; no console exceptions; UI still navigates.
- [ ] All code passes the `codeStyle.md` quality check (banners, camelCase, expanded formatting).

## Outputs Required for Later Phases

- `js/dashboardConfig.js` documented at the top of the file: where to paste the Apps Script deployment URL and apiKey (Phase 8 launch checklist swaps these).
- A short `README.md` in `BlueGridDashboard/` listing the screens and the single write helper — this is the integration surface when the module later mounts inside the shared Nulo Edge shell (shared auth + shell nav replace `dashboardConfig.js` constants and the standalone header; screens stay unchanged).
