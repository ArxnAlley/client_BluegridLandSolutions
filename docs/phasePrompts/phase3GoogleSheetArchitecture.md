# Phase 3 Prompt — BlueGrid Leads Spreadsheet Architecture

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

---

You are producing the build specification for the Forestry Module's Google Sheet database. Output of this phase is a precise, hand-executable spec document (and optionally an Apps Script setup function) — the sheet itself lives in the client's Google Workspace and is created there.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching and land clearing, Southern Ohio + Eastern Kentucky.
- **Studio:** Nulo Studio. Docs standards: `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\codeStyle.md` (camelCase names, clean professional markdown).
- **Pattern (Nulo Edge):** the Google Sheet is the module's database. A Google Apps Script web app (`BlueGridAPI`, Phase 10) is the only writer for the `leads` tab; the owner reads and occasionally hand-edits; the dashboard SPA (Phase 2) reads through the API only.
- **Authoritative schema:** `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\docs\forestryModuleSchema.md` (contract inlined below).
- **Deliverable location:** write the spec to `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\docs\googleSheetArchitecture.md`. Phase 4 turns this spec into a Gemini-in-Sheets prompt.

## Spreadsheet Definition

- **Spreadsheet name:** `BlueGrid Leads`
- **Tabs (exact names):** `leads`, `config`, `dropdowns`, `dashboardMetrics`

### Tab: `leads`

Row 1 is the `LEADS_HEADERS` contract — exactly these 27 headers, columns A–AA, in this order:

```
leadId, submittedAt, fullName, phone, email, propertyAddress,
estimatedAcres, serviceNeeded, projectDescription, preferredContactMethod, preferredTime,
photoCount, photoNames, photoUrls, sourcePage,
leadSource, utmSource, utmMedium, utmCampaign, facebookCampaign,
propertySize, terrainType,
status, estimateAmount, assignedTo, internalNotes, lastUpdated
```

Requirements:

- All cells formatted plain text (`@`) — ISO dates and phone numbers must never coerce to Date/number cells.
- Header row: frozen, bold, background fill, protected (warning-only for the owner; hard-protected against other editors).
- `photoNames` / `photoUrls` cells hold JSON array strings (e.g., `["backLot1.jpg","backLot2.jpg"]`).
- Data validation (dropdown, reject invalid input, applied to columns for rows 2:1000):
  - `serviceNeeded` (H) → named range `serviceValues`
  - `preferredContactMethod` (J) → named range `contactMethodValues`
  - `preferredTime` (K) → named range `preferredTimeValues`
  - `terrainType` (V) → named range `terrainTypeValues`
  - `status` (W) → named range `statusValues`
- Conditional formatting on `status`: `new` = highlight (attention), `completed` = green, `lost` = gray. Keep it subtle.

### Tab: `dropdowns`

One column per enum, header in row 1, exact values:

| A: `statusValues` | B: `serviceValues` | C: `contactMethodValues` | D: `preferredTimeValues` | E: `terrainTypeValues` |
|---|---|---|---|---|
| new | Forestry Mulching | Phone Call | Morning | flat |
| contacted | Land Clearing | Text | Afternoon | rolling |
| estimated | Brush Removal | Email | Evening | steep |
| scheduled | Trail Cutting | | Anytime | mixed |
| inProgress | Storm Cleanup | | | woodedWetland |
| completed | Property Cleanup | | | |
| lost | Hunting Property Prep | | | |
| | Other | | | |

Entire tab protected (owner warning-only). These values mirror the schema doc; changing them requires a coordinated website + API + dashboard update — say so in a note cell.

### Tab: `config`

Two columns, `key` / `value`, plain text, protected (owner warning-only). Seed rows:

| key | value |
|-----|-------|
| clientId | bluegrid |
| moduleName | forestryModule |
| notificationEmail | (owner email — TODO) |
| notificationsEnabled | true |
| autoReplyEnabled | true |
| weeklySummaryDay | Monday |

The Apps Script reads this tab at runtime; keys are camelCase and case-sensitive.

### Tab: `dashboardMetrics`

Owner-facing, formula-driven (the dashboard SPA computes its own numbers from the API; this tab is for the owner inside Sheets):

- Lead counts by `status` (COUNTIF over `leads!W:W` per status value).
- Lead counts by `leadSource` (COUNTIF over `leads!P:P`) — attribution reporting for the owner.
- Leads this week / this month (COUNTIFS on `submittedAt` prefix or date-parse of column B).
- Sum of `estimateAmount` for active statuses (`estimated`, `scheduled`, `inProgress`).
- Conversion rate: `completed / (completed + lost)` guarded against divide-by-zero.

All formula cells protected; label cells editable.

### Named ranges (used by the Apps Script and validation)

| Name | Range |
|------|-------|
| `leadsHeaders` | `leads!A1:AA1` |
| `statusValues` | `dropdowns!A2:A8` |
| `serviceValues` | `dropdowns!B2:B9` |
| `contactMethodValues` | `dropdowns!C2:C4` |
| `preferredTimeValues` | `dropdowns!D2:D5` |
| `terrainTypeValues` | `dropdowns!E2:E6` |
| `configTable` | `config!A2:B20` |

## Objectives

1. Produce `docs/googleSheetArchitecture.md` capturing everything above as a step-by-step, hand-executable build spec (a non-developer following it in a browser must end up with a correct sheet).
2. Include a verification checklist (below) as its final section.
3. Optional but preferred: an idempotent Apps Script `setupSpreadsheet()` function (as a fenced code block in the spec) that creates/repairs all tabs, headers, formats, validations, named ranges, and protections — safe to run repeatedly.

## Acceptance Criteria

- [ ] Spec reproduces `LEADS_HEADERS` exactly (27 columns, A–AA, order above) — zero paraphrasing.
- [ ] Every enum value byte-identical to the schema doc (case-sensitive).
- [ ] All seven named ranges specified with exact A1 notations.
- [ ] Protection model stated per tab (who can edit what).
- [ ] Verification checklist covers: header row text equality, plain-text formatting spot-check, each validation rule rejects a bad value, each named range resolves, config keys present.

## Outputs Required for Later Phases

- `docs/googleSheetArchitecture.md` — Phase 4 (Gemini prompt) is generated from it; Phase 10 (Apps Script API) reads `configTable` and `leadsHeaders` by these exact names.
- Note in the spec: the API self-heals a missing `leads` tab and enforces canonical headers, so the sheet spec is the human-readable contract, not a fragile prerequisite.
