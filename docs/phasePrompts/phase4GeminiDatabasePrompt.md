# Phase 4 — Gemini-in-Sheets Database Prompt

This phase needs no Claude Code session. It is executed inside the client's Google Workspace, where Gemini is the tool of choice.

**How to use:**

1. Open (or create) the Google Spreadsheet named `BlueGrid Leads` in the client's Google account.
2. Open Gemini in Sheets (Gemini side panel).
3. Paste the entire prompt block below.
4. Gemini side panel edits can be limited; anything it cannot do directly, it will output as exact click-path instructions — follow them manually, or run the `setupSpreadsheet()` Apps Script from `docs/googleSheetArchitecture.md` (Phase 3) via Extensions → Apps Script instead.
5. Finish with the verification checklist at the bottom of the prompt. Every box must pass before Phase 10 (API) points at this spreadsheet.

---

## Paste-ready Gemini prompt

```
You are setting up the lead database spreadsheet for BlueGrid Land Solutions, a forestry
mulching and land clearing company. This spreadsheet is written to by an automated API,
so EXACT tab names, header text, ordering, and casing are critical. Do not improvise,
rename, reorder, or "improve" anything.

Build or verify the following in THIS spreadsheet (named "BlueGrid Leads"):

TAB 1 — "leads" (all lowercase)
Row 1 must contain exactly these 27 headers in columns A through AA, exact spelling and
camelCase casing:
leadId | submittedAt | fullName | phone | email | propertyAddress | estimatedAcres |
serviceNeeded | projectDescription | preferredContactMethod | preferredTime | photoCount |
photoNames | photoUrls | sourcePage | leadSource | utmSource | utmMedium | utmCampaign |
facebookCampaign | propertySize | terrainType | status | estimateAmount | assignedTo |
internalNotes | lastUpdated

- Format the ENTIRE sheet as Plain text (Format > Number > Plain text). Dates and phone
  numbers must stay as text, never auto-convert.
- Freeze row 1, make it bold with a light gray background.
- Protect row 1 (warning-only protection).

TAB 2 — "dropdowns" (all lowercase)
Row 1 headers: statusValues | serviceValues | contactMethodValues | preferredTimeValues | terrainTypeValues
Fill the columns starting at row 2, exact values and casing:
- Column A (statusValues): new, contacted, estimated, scheduled, inProgress, completed, lost
- Column B (serviceValues): Forestry Mulching, Land Clearing, Brush Removal, Trail Cutting,
  Storm Cleanup, Property Cleanup, Hunting Property Prep, Other
- Column C (contactMethodValues): Phone Call, Text, Email
- Column D (preferredTimeValues): Morning, Afternoon, Evening, Anytime
- Column E (terrainTypeValues): flat, rolling, steep, mixed, woodedWetland
Protect the whole tab (warning-only). Add a note to A1: "These values are wired into the
website, API, and dashboard. Do not edit without a coordinated code update."

TAB 3 — "config" (all lowercase)
Row 1 headers: key | value. Plain text formatting. Rows starting at 2:
clientId = bluegrid
moduleName = forestryModule
notificationEmail = TODO@example.com
notificationsEnabled = true
autoReplyEnabled = true
weeklySummaryDay = Monday
Protect the tab (warning-only).

TAB 4 — "dashboardMetrics" (exact camelCase)
Owner-facing metrics computed by formula from the leads tab:
- One row per status (new, contacted, estimated, scheduled, inProgress, completed, lost)
  with =COUNTIF(leads!$W:$W, "<status>")
- "Leads this month" counting rows where the text in leads!B:B begins with the current
  year-month (submittedAt is an ISO text string like 2026-07-16T14:32:08.000Z)
- "Active estimate value": =SUMPRODUCT of VALUE(leads!X2:X1000) where leads!W2:W1000 is
  one of estimated, scheduled, inProgress (treat blank/non-numeric as 0)
- "Won rate": completed / (completed + lost), shown as a percentage, guarded with IFERROR

NAMED RANGES (Data > Named ranges) — exact names:
leadsHeaders        = leads!A1:AA1
statusValues        = dropdowns!A2:A8
serviceValues       = dropdowns!B2:B9
contactMethodValues = dropdowns!C2:C4
preferredTimeValues = dropdowns!D2:D5
terrainTypeValues   = dropdowns!E2:E6
configTable         = config!A2:B20

DATA VALIDATION on the leads tab, rows 2:1000, dropdown from range, reject invalid input:
- Column H (serviceNeeded)          -> =serviceValues
- Column J (preferredContactMethod) -> =contactMethodValues
- Column K (preferredTime)          -> =preferredTimeValues
- Column V (terrainType)            -> =terrainTypeValues
- Column W (status)                 -> =statusValues

CONDITIONAL FORMATTING on leads column W: "new" light yellow fill, "completed" light
green fill, "lost" light gray fill.

VERIFICATION — after building, check each item and report pass/fail:
[ ] leads!A1:AA1 matches the 27 headers exactly (spelling, order, casing)
[ ] leads tab number format is Plain text (type 2026-07-16 in an empty cell; it must NOT
    right-align or become a date — then delete it)
[ ] Each of the 5 validation columns rejects an invalid value (try "Bulldozing" in H2,
    then delete it)
[ ] All 7 named ranges exist with the exact ranges listed
[ ] dropdowns and config tabs are protected; leads row 1 is protected
[ ] config contains all 6 keys with camelCase casing
List anything that could not be completed from the side panel as numbered manual steps
with exact menu paths.
```

---

## Acceptance Criteria (for this phase overall)

- [ ] Spreadsheet `BlueGrid Leads` exists in the client's account with all four tabs passing the verification block above.
- [ ] Spreadsheet ID copied and recorded — Phase 10 (`BlueGridAPI` `config.gs`) needs it.
- [ ] The Apps Script API (Phase 10) can be bound to or pointed at this spreadsheet.

## Outputs Required for Later Phases

- The spreadsheet ID (Phase 10 config).
- Confirmation that `notificationEmail` in `config` has been replaced with the owner's real address before Phase 5 notifications go live.
