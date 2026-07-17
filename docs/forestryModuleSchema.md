# Forestry Module — Data Architecture & Schema

BlueGrid Land Solutions · Forestry mulching and land clearing · Southern Ohio + Eastern Kentucky

This document is the single source of truth for the Forestry Module data layer. Every layer of the system — website form, Apps Script API, Google Sheet, and dashboard — conforms to the field dictionary and the `LEADS_HEADERS` contract defined here. If this document and any implementation disagree, the implementation is wrong.

---

## Module Identity

The Forestry Module is an isolated Nulo Edge vertical module, following the pattern proven by the 740Eatz integration (Website → Apps Script API → Google Sheet → Dashboard):

| Layer | System | Location |
|-------|--------|----------|
| Lead capture | BlueGrid website Free Estimate form | `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\` |
| API | Google Apps Script web app (`BlueGridAPI`) | Local project: `C:\Dev\NuloWorkspace\BlueGridAPI\` (Phase 10) |
| Database | Google Sheet "BlueGrid Leads" | Client's Google Workspace (Phase 3) |
| Operations UI | Forestry Module dashboard SPA (`BlueGridDashboard`) | `C:\Dev\NuloWorkspace\BlueGridDashboard\` (Phase 2) |

Isolation rule: the module owns its own spreadsheet and its own Apps Script deployment. It shares no runtime resources with any other Nulo Edge module. Integration with the shared Nulo Edge shell happens later at the UI and auth layer only (see "Nulo Edge Integration Path" below).

---

## Field Dictionary

Enum values are exact, case-sensitive strings.

### Form fields (set by the website)

The estimate experience is two-stage: a hero mini-form (`fullName`, `phone`, `serviceNeeded` → Continue) opens a fullscreen multi-step modal that collects the rest (`propertyAddress` + `estimatedAcres` → `projectDescription` → `email` + `preferredContactMethod` + `preferredTime` → photos → review). State persists across steps; everything lands in one payload on final submit.

| Field | Type | Required | Values / Format | Example | Set By |
|-------|------|----------|-----------------|---------|--------|
| `leadId` | string | yes | `"BG-" + Date.now()` → `BG-` + 13 digits | `BG-1768594832000` | Website (client-side) |
| `submittedAt` | string | yes | ISO 8601 | `2026-07-16T14:32:08.000Z` | Website (server re-stamps if missing/invalid) |
| `fullName` | string | yes | max 100 chars | `Dale Compton` | Website (user input) |
| `phone` | string | yes | free-form, max 30 chars | `(606) 555-0142` | Website (user input) |
| `email` | string | yes | must contain `@` and `.`, max 254 chars | `dale.compton@example.com` | Website (user input) |
| `propertyAddress` | string | yes | max 250 chars | `1284 Twin Branch Rd, Ashland, KY 41101` | Website (user input) |
| `estimatedAcres` | string | no | numeric string ≥ 0 (acres of work requested, not parcel size); empty when the lead is unsure | `3.5` | Website (user input, "Approximate Acres") |
| `serviceNeeded` | enum | yes | `Forestry Mulching` \| `Land Clearing` \| `Brush Removal` \| `Trail Cutting` \| `Storm Cleanup` \| `Property Cleanup` \| `Hunting Property Prep` \| `Other` | `Forestry Mulching` | Website (user select) |
| `projectDescription` | string | no | max 2000 chars | `About 3 acres of overgrown brush behind the house...` | Website (user input) |
| `preferredContactMethod` | enum | no | `Phone Call` \| `Text` \| `Email` | `Text` | Website (user select) |
| `preferredTime` | enum | no | `Morning` \| `Afternoon` \| `Evening` \| `Anytime` | `Evening` | Website (user select) |
| `photoCount` | number | no | integer ≥ 0, default `0` | `2` | Website (computed) |
| `photoNames` | array | no | JSON array of file name strings | `["backLot1.jpg","backLot2.jpg"]` | Website (computed) |
| `sourcePage` | string | no | page path + optional anchor, max 200 chars | `index.html#estimateForm` | Website (computed) |

### Attribution fields (set by the website, automatically)

Captured by the website JS at page load and carried through submit. Empty string when absent — never omitted from the payload.

| Field | Type | Required | Values / Format | Example | Set By |
|-------|------|----------|-----------------|---------|--------|
| `leadSource` | string | no | fixed `website` for all Phase 1 leads; other channels (e.g., `gbp`, `referral`) entered module-side later | `website` | Website (computed) |
| `utmSource` | string | no | `utm_source` query param, max 200 chars | `facebook` | Website (computed) |
| `utmMedium` | string | no | `utm_medium` query param, max 200 chars | `paidSocial` | Website (computed) |
| `utmCampaign` | string | no | `utm_campaign` query param, max 200 chars | `stormCleanup2026` | Website (computed) |
| `facebookCampaign` | string | no | `fbclid` query param; else `utm_campaign` when `utm_source=facebook`; else empty. Max 300 chars | `IwAR2xk…` | Website (computed) |

### Pipeline fields (module-side; never accepted from the website)

| Field | Type | Required | Values / Format | Example | Set By |
|-------|------|----------|-----------------|---------|--------|
| `photoUrls` | array | no | JSON array of Drive URL strings; empty until Phase 2 photo upload ships | `["https://drive.google.com/..."]` | API (Phase 11) |
| `propertySize` | string | no | numeric string ≥ 0 — TOTAL parcel acreage (distinct from `estimatedAcres`, the acres of work requested); reserved empty in Phase 1 | `42` | Dashboard (owner, after site review) |
| `terrainType` | enum | no | `flat` \| `rolling` \| `steep` \| `mixed` \| `woodedWetland`; reserved empty in Phase 1 | `rolling` | Dashboard (owner, after site review) |
| `status` | enum | yes | `new` \| `contacted` \| `estimated` \| `scheduled` \| `inProgress` \| `completed` \| `lost` | `new` | API on create (`new`); Dashboard thereafter |
| `estimateAmount` | string | no | numeric string, blank until estimated | `2400` | Dashboard |
| `assignedTo` | string | no | crew member / owner name | `Owner` | Dashboard |
| `internalNotes` | string | no | max 5000 chars | `Walked property 7/18, mostly cedar and honeysuckle` | Dashboard |
| `lastUpdated` | string | yes | ISO 8601, server time | `2026-07-16T14:32:09.412Z` | API (stamped on every create/update) |

---

## LEADS_HEADERS — Column Contract

Defined once, in `leads.gs`, as `LEADS_HEADERS`. This exact ordered list is the Sheet's row 1, the shape of every API record, and the Dashboard's row object — the same field set defined once, per the 740Eatz `ORDERS_HEADERS` precedent.

```
leadId, submittedAt, fullName, phone, email, propertyAddress,
estimatedAcres, serviceNeeded, projectDescription, preferredContactMethod, preferredTime,
photoCount, photoNames, photoUrls, sourcePage,
leadSource, utmSource, utmMedium, utmCampaign, facebookCampaign,
propertySize, terrainType,
status, estimateAmount, assignedTo, internalNotes, lastUpdated
```

27 columns, A through AA.

Contract rules (each one is a lesson paid for during the 740Eatz orders audit):

1. **Row 1 is canonical and enforced.** The API validates row 1 against `LEADS_HEADERS` on every sheet access (`enforceCanonicalHeaders`), repairing labels without touching data. Never trust pre-existing headers.
2. **Writes are positional.** `appendRow()` writes in `LEADS_HEADERS` order; reads key strictly off row 1 text. A single mislabeled header silently drops fields — hence rule 1.
3. **All cells are plain-text formatted (`@`).** ISO dates and phone numbers must round-trip as strings, never as Date/number cells. The API additionally rescues Date cells introduced by manual sheet edits.
4. **Arrays are stored as JSON strings.** `photoNames` and `photoUrls` are serialized with `JSON.stringify` into their single cell and parsed on read. Empty array → `[]`.
5. **`photoUrls`, `propertySize`, and `terrainType` are reserved now, populated later.** Reserving these columns in the day-one contract means the photo upload feature (Phase 11) and owner-side property fields ship without a schema migration.
6. **Columns are append-only once deployed.** New fields go after `lastUpdated`, never inserted mid-contract. Renames are forbidden; deprecate instead. (The July 2026 pre-deployment restructure to 27 columns was the last free reorder — nothing was live yet.)

---

## Website JSON Payload

The Free Estimate form POSTs this exact shape. Field name attributes on the form match these keys one-for-one.

```json
{
    "leadId": "BG-1768594832000",
    "submittedAt": "2026-07-16T14:32:08.000Z",
    "fullName": "Dale Compton",
    "phone": "(606) 555-0142",
    "email": "dale.compton@example.com",
    "propertyAddress": "1284 Twin Branch Rd, Ashland, KY 41101",
    "estimatedAcres": "3.5",
    "serviceNeeded": "Forestry Mulching",
    "projectDescription": "About 3 acres of overgrown brush and small cedars behind the house. Want it mulched down for pasture.",
    "preferredContactMethod": "Text",
    "preferredTime": "Evening",
    "photoCount": 2,
    "photoNames": ["backLot1.jpg", "backLot2.jpg"],
    "sourcePage": "index.html#estimateForm",
    "leadSource": "website",
    "utmSource": "facebook",
    "utmMedium": "paidSocial",
    "utmCampaign": "stormCleanup2026",
    "facebookCampaign": "stormCleanup2026"
}
```

The website never sends `photoUrls`, `propertySize`, `terrainType`, `status`, `estimateAmount`, `assignedTo`, `internalNotes`, or `lastUpdated`. If present in a payload, the API ignores them.

---

## Apps Script `doPost` Handling Expectations

Full build spec lives in `phasePrompts/phase10AppsScriptApi.md`. The contract-level expectations:

### Transport

- The website POSTs with `Content-Type: text/plain;charset=utf-8`, body is the JSON string. Apps Script web apps do not answer CORS preflight (OPTIONS), so `application/json` would fail from the browser. This is the proven 740Eatz pattern.
- Routing by query param: `?action=leads.create`. GET actions: `ping`, `leads.list`. POST actions: `leads.create`, `leads.update`.
- Apps Script always returns HTTP 200. The response envelope is the real status:

```json
{ "success": true, "data": { "lead": { } } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "fields": { "email": "Required" } } }
```

### Validation (on `leads.create`)

- Required: `fullName`, `phone`, `email`, `propertyAddress`, `serviceNeeded`.
- Enum fields must match the exact values in the field dictionary; invalid enum → field-keyed `VALIDATION_ERROR`.
- Max lengths per the field dictionary; oversize → `VALIDATION_ERROR`.
- `estimatedAcres`: if non-empty, must parse as a number in `[0, 100000]`; otherwise `VALIDATION_ERROR`.
- Attribution fields (`leadSource`, `utmSource`, `utmMedium`, `utmCampaign`, `facebookCampaign`): free strings, truncated to their max lengths, never rejected — attribution must never block a lead.
- `leadId` must match `^BG-\d{13}$`; if missing or malformed the server generates one (client value preferred so the visitor's confirmation reference matches the sheet).
- `submittedAt` must parse as a valid date; otherwise the server stamps it.
- Honeypot: if the hidden trap field carries a value, return a fake success envelope and write nothing.

### Dedupe by `leadId`

Before appending, scan the `leadId` column. If the id already exists, return `{ "success": true, "data": { "lead": <existing row>, "duplicate": true } }` and write nothing. This makes `leads.create` idempotent — safe against double-taps and mobile retry logic.

### Write path

1. Acquire `LockService` script lock (30s timeout → `LOCK_TIMEOUT` error).
2. `getOrCreateSheet('leads')` — auto-creates the tab with `LEADS_HEADERS` if absent, enforces canonical headers if present, formats all cells plain-text.
3. Dedupe check (above).
4. Compose the row in `LEADS_HEADERS` order: form + attribution fields from the payload, `photoUrls` = `[]`, `propertySize`/`terrainType` = `""`, `status` = `new`, `estimateAmount`/`assignedTo`/`internalNotes` = `""`, `lastUpdated` = server ISO time.
5. `appendRow()`, release lock, return the full lead record in the envelope.
6. Fire the new-lead notification (see `phasePrompts/phase5Zapier.md` — Apps Script `MailApp` is the primary mechanism).

### `leads.update` (Dashboard only)

Accepts `{ leadId, status?, estimateAmount?, assignedTo?, internalNotes?, propertySize?, terrainType? }` plus the module API key. Whitelist: only those six fields are writable; everything else is immutable after create. Stamps `lastUpdated`. Unknown `leadId` → `NOT_FOUND`. Invalid `status` or `terrainType` → `VALIDATION_ERROR`.

---

## Photo Upload Strategy

| Phase | Behavior |
|-------|----------|
| Phase 1 (now) | The form's file input never uploads bytes. The website records `photoCount` and `photoNames` only, so the owner knows photos exist and can request them by text/email. `photoUrls` stays `[]`. |
| Phase 2+ (Phase 11 prompt) | After a successful `leads.create`, the website downscales images client-side (≤ 1600px longest edge, JPEG ~0.8 quality, max 6 photos) and POSTs `leads.addPhotos` with `{ leadId, photos: [{ name, mimeType, base64 }] }`. The API writes each file to a Drive folder per lead (`BlueGrid Lead Photos/<leadId>/`), then writes the Drive URLs into the `photoUrls` column. Photo upload failure never invalidates the lead — the lead row already exists. |

---

## Status Pipeline

`status` is the single workflow state. The API sets `new`; every later transition comes from the Dashboard via `leads.update`.

| Status | Meaning | Typical Next |
|--------|---------|--------------|
| `new` | Lead received, no contact yet | `contacted`, `lost` |
| `contacted` | Owner reached the lead (call/text/email) | `estimated`, `lost` |
| `estimated` | Estimate delivered; `estimateAmount` should be set | `scheduled`, `lost` |
| `scheduled` | Job booked on the calendar | `inProgress`, `lost` |
| `inProgress` | Equipment on site, work underway | `completed` |
| `completed` | Job done and paid — terminal | — |
| `lost` | Lead went cold or declined — terminal, reachable from any active status | — |

Forward skips are legal (a phone call can go straight to `scheduled`). The Dashboard renders these as the pipeline board columns in this order.

---

## Nulo Edge Integration Path

**Now (isolated):** own spreadsheet, own Apps Script deployment URL, own dashboard SPA, own API key. Nothing shared. The module can be built, sold, and operated standalone.

**Later (plugged into Nulo Edge):**

| Concern | Isolated (now) | Shared shell (later) |
|---------|----------------|----------------------|
| Auth | Static module API key in the dashboard | Nulo Edge shared login/session; per-client scoping |
| Dashboard shell | Standalone SPA with own nav | Module mounts inside the Nulo Edge shell nav; module screens unchanged |
| Data | `BlueGrid Leads` spreadsheet | Same spreadsheet (or Supabase migration) — the `LEADS_HEADERS` contract is the stable seam |
| Client identity | Implicit (single client) | `clientId` config value already carried in `config.gs`, mirroring 740Eatz `CLIENT_ID` |

Design consequence: the dashboard keeps all data access behind one API module (`js/dashboardAPI.js`) and all rendering behind screen-level functions, so re-hosting inside the shared shell touches configuration and navigation, not lead logic. The `LEADS_HEADERS` contract never changes at integration time.
