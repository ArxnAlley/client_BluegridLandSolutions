# Phase 10 Prompt — BlueGridAPI (Apps Script Web App)

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

**Sequencing note:** despite the number, this phase executes early — after Phase 3/4 (spreadsheet) and before Phase 2 (dashboard) can run against live data and before Phase 8 (launch) can smoke-test the form. It was added because phases 2–9 consume the API but none of them builds it.

---

You are building the Forestry Module's API: a Google Apps Script web app that receives website leads, serves them to the dashboard, and accepts pipeline updates.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching and land clearing, Southern Ohio + Eastern Kentucky.
- **Studio:** Nulo Studio. Read `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\codeStyle.md` first (camelCase, section banners, expanded formatting) — it applies to `.gs` files too.
- **Pattern (Nulo Edge):** Website form → Apps Script web app → Google Sheet → dashboard SPA. Precedent: the 740Eatz module's `740EatzAPI` (`C:\Dev\NuloWorkspace\740EatzAPI\`) — mirror its architecture (routes table, envelope, utilities) but share zero code at runtime; this module is isolated.
- **Local project location:** `C:\Dev\NuloWorkspace\BlueGridAPI\` (source of truth; deployed by pasting into the Apps Script editor bound to the client's spreadsheet).
- **Database:** Google Sheet `BlueGrid Leads` — tabs `leads`, `config`, `dropdowns`, `dashboardMetrics`; named ranges `leadsHeaders`, `configTable` (spec: `docs/googleSheetArchitecture.md` if Phase 3 ran; the API must not hard-depend on it — see auto-heal below).
- **Authoritative schema:** `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\docs\forestryModuleSchema.md`. Contract inlined below.

## Data Contract (inline)

`LEADS_HEADERS` — defined once in `leads.gs`; sheet row 1, API record shape, and dashboard row shape are all this list:

```
leadId, submittedAt, fullName, phone, email, propertyAddress,
estimatedAcres, serviceNeeded, projectDescription, preferredContactMethod, preferredTime,
photoCount, photoNames, photoUrls, sourcePage,
leadSource, utmSource, utmMedium, utmCampaign, facebookCampaign,
propertySize, terrainType,
status, estimateAmount, assignedTo, internalNotes, lastUpdated
```

Enums (exact, case-sensitive):

- `serviceNeeded`: `Forestry Mulching` | `Land Clearing` | `Brush Removal` | `Trail Cutting` | `Storm Cleanup` | `Property Cleanup` | `Hunting Property Prep` | `Other`
- `preferredContactMethod`: `Phone Call` | `Text` | `Email`
- `preferredTime`: `Morning` | `Afternoon` | `Evening` | `Anytime`
- `terrainType`: `flat` | `rolling` | `steep` | `mixed` | `woodedWetland`
- `status`: `new` | `contacted` | `estimated` | `scheduled` | `inProgress` | `completed` | `lost`

Required on create: `fullName`, `phone`, `email`, `propertyAddress`, `serviceNeeded`. Max lengths: fullName 100, phone 30, email 254, propertyAddress 250, projectDescription 2000, internalNotes 5000, sourcePage 200, attribution fields (`leadSource`/`utmSource`/`utmMedium`/`utmCampaign`) 200 and `facebookCampaign` 300 — attribution values are truncated, never rejected (attribution must never block a lead). `estimatedAcres`: optional; if non-empty must parse as a number in `[0, 100000]`. `leadId` pattern `^BG-\d{13}$` (server generates if missing/invalid). `photoNames`/`photoUrls` stored as JSON array strings. `photoUrls` always `[]` on create (Phase 11 fills it). `propertySize`/`terrainType` always `""` on create (dashboard-set later).

## Endpoints

| Method | Action | Auth | Purpose |
|--------|--------|------|---------|
| GET | `ping` | none | `{ success: true, data: { module: "forestryModule", time } }` |
| GET | `leads.list` | apiKey | All leads newest-first: `{ leads: [...], count }` |
| POST | `leads.create` | none — public form endpoint | Create lead; returns full record |
| POST | `leads.update` | apiKey | `{ leadId, status?, estimateAmount?, assignedTo?, internalNotes?, propertySize?, terrainType? }` → updated record |

Transport rules (Apps Script web app realities — encode them, don't fight them):

- POST bodies arrive as `text/plain;charset=utf-8` containing JSON (no CORS preflight support; the website and dashboard both post this way).
- Always return HTTP 200 with envelope `{ success: true, data }` or `{ success: false, error: { code, message, fields? } }` via `ContentService` JSON.
- Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `LOCK_TIMEOUT`, `UNKNOWN_ACTION`.
- Auth: `apiKey` as query param (GET) or body field (POST), compared against a Script Property `MODULE_API_KEY` (never in code or the sheet). `leads.create` is deliberately public; the honeypot + validation are its gate.

## Required Behavior

1. **Server-authoritative fields.** `leads.create` never accepts `status`, `photoUrls`, `propertySize`, `terrainType`, `estimateAmount`, `assignedTo`, `internalNotes`, or `lastUpdated` from the client: status = `new`, photoUrls = `[]`, propertySize/terrainType = `""`, lastUpdated = server ISO time. Client `submittedAt` kept if it parses; otherwise server-stamped.
2. **Dedupe by `leadId`.** Under lock, scan the `leadId` column before append; existing id → `{ success: true, data: { lead: existingRecord, duplicate: true } }`, no write. Create is idempotent.
3. **Locking.** `LockService` script lock around dedupe+append and around update read-modify-write (30 s → `LOCK_TIMEOUT`).
4. **Canonical header enforcement.** `getOrCreateSheet('leads')` creates the tab with `LEADS_HEADERS` if missing and repairs row 1 to canonical (without touching data) if it deviates — never trust pre-existing headers (this exact defect caused the 740Eatz orders audit).
5. **Plain-text cells.** Format written ranges as `@`; `normalizeCellValue()` rescues Date cells introduced by hand edits so ISO strings round-trip.
6. **Update whitelist.** `leads.update` may modify only `status`, `estimateAmount`, `assignedTo`, `internalNotes` (+ stamps `lastUpdated`). Invalid `status` enum → `VALIDATION_ERROR`; unknown `leadId` → `NOT_FOUND`.
7. **Honeypot.** If the configured hidden field (check the website form for its name; default `companyWebsite`) is non-empty: return a fake success envelope, write nothing, send nothing.
8. **Notifications are best-effort.** After a successful append, call the notification functions (owner alert, auto-reply — Phase 5 spec, gated by `config` flags). A mail failure must never fail the lead write.
9. **Config from the sheet.** `clientId`, `notificationEmail`, flags read from the `config` tab (`configTable`), cached per execution.

## Deliverables

```
BlueGridAPI/
    Code.gs           (doGet/doPost entry, action dispatch, envelope helpers)
    routes.gs         (action → handler registry, auth requirements per action)
    leads.gs          (LEADS_HEADERS, handleCreateLead, handleListLeads, handleUpdateLead)
    validation.gs     (field/enum/length validators, honeypot check)
    notifications.gs  (stubs or full Phase 5 implementations, config-gated)
    utilities.gs      (getOrCreateSheet, enforceCanonicalHeaders, tableToObjects,
                       objectToRow, normalizeCellValue, json helpers, getConfig)
    config.gs         (CLIENT_ID, sheet/tab names, Script Property key names)
    README.md         (endpoints, payloads, deployment steps, manual test plan)
```

Plus a Node-based mock test runner (mocking `SpreadsheetApp`, `LockService`, `Utilities`, `MailApp`) exercising: ping; create happy path; every validation failure; dedupe replay; honeypot; header self-heal from a foreign header row; update happy path / NOT_FOUND / bad enum; unauthorized list/update; Date-cell rescue. (Precedent: the 740Eatz 44-check suite.)

## Deployment (document in README.md)

Apps Script editor bound to the `BlueGrid Leads` spreadsheet → paste files → set Script Property `MODULE_API_KEY` → Deploy as Web App, execute as **Me**, access **Anyone** → record the `/exec` URL. Redeploys must create a **new version** of the existing deployment so the URL never changes.

## Acceptance Criteria

- [ ] Full mock suite green; count reported.
- [ ] Live `ping` returns success from the deployed URL.
- [ ] Browser-fired `leads.create` (text/plain) from the local website file appends a correctly-columned row; duplicate replay adds nothing.
- [ ] `leads.list` without a valid apiKey → `UNAUTHORIZED`; with it → correct records with parsed `photoNames`/`photoUrls` arrays.
- [ ] `leads.update` round-trips a status change and stamps `lastUpdated`.
- [ ] Foreign header row self-heals on the next call without data loss.

## Outputs Required for Later Phases

- Deployed `/exec` URL → website form config (Phase 8 swap), dashboard config (Phase 2), photo service (Phase 11).
- `MODULE_API_KEY` handed to the dashboard via `dashboardConfig.js` (Phase 2).
- `routes.gs` registry is the extension point for Phase 11's `leads.addPhotos`.
