# Google Sheet Architecture — BlueGrid Leads

Forestry Module · BlueGrid Land Solutions · Nulo Edge

The spreadsheet is the module's database. The Apps Script web app (`appsScript/`) is the **only writer** for the `leads` tab; the owner reads and occasionally hand-edits; the dashboard reads through the API only.

Authoritative schema: [`forestryModuleSchema.md`](forestryModuleSchema.md). Deployment steps: [`../appsScript/README.md`](../appsScript/README.md).

> **You do not have to build this by hand.** Running `setupSpreadsheet()` once from the Apps Script editor creates and repairs every tab, header, dropdown, config row, and named range below. It is idempotent — safe to re-run at any time, including against a sheet that already holds leads. This document is the human-readable contract and the verification checklist.

---

## Spreadsheet

| Property | Value |
|----------|-------|
| Name | `BlueGrid Leads` |
| Owner | The Google account that will send notification emails |
| Tabs | `leads`, `errorLog`, `config`, `dropdowns`, `dashboardMetrics` |
| Script binding | Apps Script project `BlueGridAPI`, bound via **Extensions → Apps Script** |

### Logging model

The **`leads` tab is the audit trail.** A submission is successful the moment its row is committed; the owner email is best-effort and cannot un-succeed a saved lead.

The **`errorLog` tab records failures only.** There is deliberately **no ActivityLog** in this project — `leads` already records every success, so a second log of successful traffic would add noise and quota cost without adding information.

---

## Tab: `leads`

Row 1 is the `LEADS_HEADERS` contract — exactly these 29 headers, columns **A through AC**, in this order:

| Col | Header | Written by | Notes |
|-----|--------|-----------|-------|
| A | `leadId` | API | `BG-` + a sequential number, zero-padded to 4 (`BG-0001`). Internal. Server-assigned. |
| B | `submittedAt` | Website | ISO 8601. Server re-stamps if missing/invalid. |
| C | `fullName` | Website | Max 100 |
| D | `phone` | Website | Max 30 |
| E | `email` | Website | Max 254 |
| F | `propertyAddress` | Website | Max 250 |
| G | `estimatedAcres` | Website | Numeric string `[0, 100000]`, or empty |
| H | `serviceNeeded` | Website | Enum — dropdown `serviceValues` |
| I | `projectDescription` | Website | Max 2000 |
| J | `preferredContactMethod` | Website | Enum — dropdown `contactMethodValues` |
| K | `preferredTime` | Website | Enum — dropdown `preferredTimeValues` |
| L | `photoCount` | Website | Integer ≥ 0 |
| M | `photoNames` | Website | JSON array string |
| N | `photoUrls` | API | JSON array string of Drive links, resolved from storage on create |
| O | `sourcePage` | Website | e.g. `services/forestryMulching.html#estimateForm` |
| P | `leadSource` | Website | `website` for all Phase 1 leads |
| Q | `utmSource` | Website | Truncated, never rejected |
| R | `utmMedium` | Website | Truncated, never rejected |
| S | `utmCampaign` | Website | Truncated, never rejected |
| T | `facebookCampaign` | Website | `fbclid`, or campaign when `utm_source=facebook` |
| U | `propertySize` | Dashboard | Total parcel acreage. Empty in Phase 1. |
| V | `terrainType` | Dashboard | Enum — dropdown `terrainTypeValues`. Empty in Phase 1. |
| W | `status` | API on create (`new`), Dashboard after | Enum — dropdown `statusValues` |
| X | `estimateAmount` | Dashboard | Numeric string |
| Y | `assignedTo` | Dashboard | Free text |
| Z | `internalNotes` | Dashboard | Max 5000 |
| AA | `lastUpdated` | API | ISO 8601, stamped on every create/update |
| AB | `referenceId` | Website | `BG-` + 13 digits. The customer-facing confirmation number, and the dedupe key. |
| AC | `photoFolderUrl` | API | Drive folder holding this row's photos |

### Formatting requirements

- **All cells plain text (`@`).** ISO dates and phone numbers must never coerce into Date or number cells. The API sets this on every written row and rescues Date cells created by hand edits.
- Header row: frozen, bold, dark fill, white text.
- `photoNames` / `photoUrls` hold JSON array strings — e.g. `["backLot1.jpg","backLot2.jpg"]`. Empty is `[]`.

### Data validation (rows 2:1000)

| Column | Named range |
|--------|-------------|
| H `serviceNeeded` | `serviceValues` |
| J `preferredContactMethod` | `contactMethodValues` |
| K `preferredTime` | `preferredTimeValues` |
| V `terrainType` | `terrainTypeValues` |
| W `status` | `statusValues` |

### Conditional formatting on `status` (W)

Keep it subtle: `new` = attention highlight, `completed` = green, `lost` = gray.

### Contract rules

1. **Row 1 is canonical and enforced.** The API compares row 1 to `LEADS_HEADERS` on every access and repairs labels without touching data.
2. **Writes are positional; reads key off row 1 text.** A single mislabeled header silently drops fields — hence rule 1.
3. **Columns are append-only.** New fields go after `lastUpdated`. Never insert mid-contract. Renames are forbidden — deprecate instead. `referenceId` and `photoFolderUrl` were appended under this rule on 2026-08-13, which is why the customer-facing reference sits in column AB rather than beside `leadId` where it reads better.
4. **`leadId` and `referenceId` are not interchangeable.** `leadId` is the internal sequential number the owner organises by and `leads.update` writes against. `referenceId` is what the customer was quoted and what `leads.create` dedupes on. Sorting the sheet by `leadId` gives chronological lead order; sorting by `referenceId` happens to as well, but only by accident of the timestamp.

---

## Tab: `errorLog`

Failures only. Written by `writeErrorLog()` in `appsScript/utilities.gs`. Row 1 is exactly these 5 headers, columns **A through E**:

| Col | Header | Notes |
|-----|--------|-------|
| A | `timestamp` | ISO 8601, server time |
| B | `leadId` | The join key back to the `leads` row. Holds the `referenceId` for failures during create, because the sequential `leadId` does not exist until the row is written. Empty when neither existed yet. |
| C | `functionName` | Where it failed, e.g. `handleCreateLead`, `sendOwnerNotification` |
| D | `errorMessage` | Truncated to 1000 chars |
| E | `stackTrace` | Truncated to 2000 chars; empty for validation failures |

### What gets logged here

| Event | Logged | Why |
|-------|--------|-----|
| Sheet write failure | Yes | The lead was lost — the one failure that must never be silent |
| Email delivery failure | Yes | The lead is safe in `leads`, but the owner was not told |
| Validation failure | Yes | A real person may have been turned away by the form |
| Unexpected exception | Yes | With stack trace |
| Successful submission | **No** | The `leads` row *is* the success record |
| Honeypot trip | **No** | Routine bot traffic, not a failure |

Never contains customer names or email addresses — the `leadId` is the join key back to the full row.

**Recursion guard:** `writeErrorLog()` cannot re-enter itself. If writing to this sheet fails, it falls back to the Apps Script execution log and gives up quietly rather than looping.

**Header enforcement:** row 1 is verified and repaired on every access, exactly like the `leads` tab.

---

## Tab: `dropdowns`

One column per enum, header in row 1. Values are exact and case-sensitive.

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

> Changing any value here requires a coordinated website + API + dashboard update. The website `<select>` options, `ENUM_VALUES` in `appsScript/config.gs`, and this tab must stay byte-identical.

---

## Tab: `config`

Two columns, `key` / `value`, plain text. The API reads this at runtime and caches per execution, so edits take effect on the next submission — **no redeploy needed**.

| key | value | Purpose |
|-----|-------|---------|
| `clientId` | `bluegrid` | Module identity |
| `moduleName` | `forestryModule` | Module identity |
| `notificationEmail` | `Bluegridls@gmail.com` | **The owner — sole recipient** of customer submissions |
| `notificationsEnabled` | `true` | `false` silences owner alerts without code changes |
| `autoReplyEnabled` | `true` | `false` stops the customer confirmation email |
| `weeklySummaryDay` | `Monday` | Reserved for the Phase 5 weekly digest |

Keys are camelCase and case-sensitive. If the tab or a key is missing, the `appsScript/config.gs` default applies — the same address.

> **There is intentionally no second recipient key.** The business owner is the only recipient of customer submissions; Nulo Studio is not copied and does not sit in the customer's email thread. Operational problems surface in the `errorLog` tab instead of an inbox. Re-running `setupSpreadsheet()` deletes a legacy `secondaryNotificationEmail` row if one exists from an earlier build.

---

## Tab: `dashboardMetrics`

Owner-facing and formula-driven. The dashboard SPA computes its own numbers from the API; this tab is for the owner working inside Sheets.

- Lead counts by `status` — `COUNTIF` over `leads!W:W` per status value
- Lead counts by `leadSource` — `COUNTIF` over `leads!P:P` (attribution reporting)
- Leads this week / this month — `COUNTIFS` on the `submittedAt` prefix (column B)
- Sum of `estimateAmount` for active statuses (`estimated`, `scheduled`, `inProgress`)
- Conversion rate — `completed / (completed + lost)`, guarded against divide-by-zero

---

## Named ranges

| Name | Range |
|------|-------|
| `leadsHeaders` | `leads!A1:AC1` |
| `statusValues` | `dropdowns!A2:A8` |
| `serviceValues` | `dropdowns!B2:B9` |
| `contactMethodValues` | `dropdowns!C2:C4` |
| `preferredTimeValues` | `dropdowns!D2:D5` |
| `terrainTypeValues` | `dropdowns!E2:E6` |
| `configTable` | `config!A2:B20` |

---

## Script Properties

Set under **Project Settings → Script Properties**. Never in code, never in the sheet.

| Property | Required | Purpose |
|----------|----------|---------|
| `MODULE_API_KEY` | Yes | Authenticates `leads.list` and `leads.update` (dashboard). `leads.create` is public. |
| `LEADS_SPREADSHEET_ID` | Only if unbound | Lets a standalone script find the spreadsheet. Bound deployments ignore it. |

---

## Protection model

| Tab | Protection |
|-----|-----------|
| `leads` header row | Protected; warning-only for the owner, hard-protected against other editors |
| `dropdowns` | Whole tab protected, owner warning-only |
| `config` | Whole tab protected, owner warning-only |
| `dashboardMetrics` | Formula cells protected; label cells editable |

---

## Verification checklist

- [ ] Spreadsheet is named `BlueGrid Leads` and has all **five** tabs.
- [ ] `leads!A1:AC1` matches the 29 headers above **exactly** (text equality, not "close enough").
- [ ] `errorLog!A1:E1` reads `timestamp, leadId, functionName, errorMessage, stackTrace`.
- [ ] A cell in column B holds an ISO string that stays a string after reload (plain-text spot check).
- [ ] Each of the five validation columns rejects a bad value.
- [ ] All seven named ranges resolve (**Data → Named ranges**).
- [ ] `config` contains all six keys, with `notificationEmail` correct and **no** `secondaryNotificationEmail` row.
- [ ] `MODULE_API_KEY` is set in Script Properties.
- [ ] `runSelfTest()` reports six PASS lines and leaves no test rows behind.
- [ ] Running `setupSpreadsheet()` three times still yields five tabs, one header row each, and no duplicate config rows.
- [ ] A real form submission produces: one `leads` row, one email to the owner, an auto-reply to the customer, **no** Nulo Studio copy, and an empty `errorLog`.
- [ ] Forcing an email failure still saves the lead and records the failure in `errorLog`.
