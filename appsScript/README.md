# BlueGridAPI — Apps Script Web App

Forestry Module · BlueGrid Land Solutions · Nulo Edge

This folder is the **source of truth** for the Google Apps Script project that receives website leads, writes them to the `BlueGrid Leads` spreadsheet, and emails the owner. The `.gs` files are pasted into the Apps Script editor — this folder is not itself deployed.

Authoritative data contract: [`../docs/forestryModuleSchema.md`](../docs/forestryModuleSchema.md). Sheet spec: [`../docs/googleSheetArchitecture.md`](../docs/googleSheetArchitecture.md). If this code and those documents ever disagree, the code is wrong.

---

## Architecture principles

1. **The `leads` sheet is the audit trail.** A submission is successful the moment its row is committed. Everything after that — owner email, auto-reply — is best-effort and cannot un-succeed the lead.
2. **Failures go to the `errorLog` sheet, successes do not.** There is deliberately **no ActivityLog** in this project: the `leads` sheet already records every success, so a second log of successful traffic would be noise and quota cost.
3. **The owner is the only recipient of customer submissions.** Nulo Studio is not copied and does not sit in the customer's email thread. Operational problems surface in `errorLog`, not in an inbox.
4. **Modules stay separate.** One responsibility per file; no merging.

---

## Files

| File | Responsibility |
|------|----------------|
| `Code.gs` | `doGet` / `doPost`, body parsing, `setupSpreadsheet()`, `removeObsoleteConfigKeys()`, `runSelfTest()` |
| `routes.gs` | Action → handler registry; per-action method and auth requirements |
| `leads.gs` | `LEADS_HEADERS` contract, create / list / update handlers, `findLeadById` |
| `validation.gs` | Sanitization, field/enum/length validation, honeypot, formula-injection defense |
| `notifications.gs` | Owner email, customer auto-reply, message formatting |
| `utilities.gs` | Sheet access, header enforcement, row/object mapping, config, envelopes, auth, **error logging** |
| `config.gs` | Constants, enums, limits, error codes, default recipient |
| `localTestRunner.js` | **Development tool — do not paste into Apps Script.** Node harness that runs everything against in-memory Google mocks. |

Paste order does not matter — Apps Script loads all files into one global scope before running.

---

## Endpoints

Base URL is the Web App deployment URL, ending in `/exec`.

| Method | Action | Auth | Purpose |
|--------|--------|------|---------|
| GET | `?action=ping` | none | Health check |
| GET | `?action=leads.list&apiKey=…` | apiKey | All leads, newest first |
| POST | `?action=leads.create` | none (public) | Create a lead from the website form |
| POST | `?action=leads.update` | apiKey | Update pipeline fields from the dashboard |

### Transport rules

- The website POSTs `Content-Type: text/plain;charset=utf-8` with a JSON string body. This is deliberate: Apps Script web apps cannot answer a CORS preflight, and `application/json` would trigger one and fail from the browser.
- **Every response is HTTP 200.** The envelope carries the real status:

```json
{ "success": true,  "data": { "lead": { } } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "email": "Required." } } }
```

- Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `LOCK_TIMEOUT`, `UNKNOWN_ACTION`, `SERVER_ERROR`.

---

## Run the tests before deploying

From this folder, with Node installed:

```
node localTestRunner.js
```

Expect `passed: 64   failed: 0`. This exercises setup idempotency, the full create path, dedupe, honeypot, every validation rule, error logging, the "email failure must not fail the lead" guarantee, formula-injection defense, header self-heal, auth, and update — all without touching Google.

---

## Deployment sequence

Do these in order, signed in as the account that should **own** the spreadsheet and **send** the emails.

> **Decide first: which Google account deploys.** `MailApp` sends *from the deploying account*, so that address becomes the "From" on the owner's alerts and on every customer auto-reply. Deploying as Chase looks right to customers; deploying as a studio account keeps script control with Nulo Studio. Changing it later means re-deploying under the other account.

### 1 · Create the spreadsheet

1. Go to <https://sheets.google.com>, create a blank spreadsheet.
2. Rename it exactly **`BlueGrid Leads`**.

### 2 · Open the bound script editor

1. In that spreadsheet: **Extensions → Apps Script**.
2. Rename the Apps Script project to **`BlueGridAPI`** (top-left).

### 3 · Paste the seven `.gs` files

1. Delete the contents of the default `Code.gs`.
2. For each `.gs` file in this folder, create a matching script file (**＋ → Script**) and paste its contents. Use these names: `Code`, `routes`, `leads`, `validation`, `notifications`, `utilities`, `config`.
   *(Apps Script appends `.gs` automatically — do not type the extension.)*
3. **Do not paste `localTestRunner.js`.** It is a Node development tool and will not run in Apps Script.
4. **Save** (Ctrl/Cmd + S).

### 4 · Set the API key

1. **Project Settings** (gear) → **Script Properties** → **Add script property**.
2. Property: `MODULE_API_KEY`
3. Value: a long random string you generate. Store it in the password manager — the dashboard will need it in Phase 2.
4. **Save script properties.**

> `leads.create` is public by design (a browser cannot hold a secret). Only `leads.list` and `leads.update` require this key.

### 5 · Build the spreadsheet structure

1. In the editor, select the function **`setupSpreadsheet`** and click **Run**.
2. Approve the authorization prompt on first run (**Advanced → Go to BlueGridAPI (unsafe) → Allow** — expected for a personal, unverified script).
3. Confirm the spreadsheet now has five tabs: **`leads`** (27 headers), **`errorLog`** (5 headers), **`config`**, **`dropdowns`**, **`dashboardMetrics`**.

**`setupSpreadsheet()` is idempotent** — re-run it any time, including against a sheet that already holds leads. It creates nothing twice: no duplicate sheets, no duplicate headers, no duplicate config rows, no duplicate named ranges. It also deletes config keys retired by architecture changes.

### 6 · Confirm the notification address

Open the `config` tab:

| key | value |
|-----|-------|
| `notificationEmail` | `Bluegridls@gmail.com` |
| `notificationsEnabled` | `true` |
| `autoReplyEnabled` | `true` |

Editing these takes effect on the next submission — **no redeploy needed**. There is intentionally no second recipient key.

### 7 · Run the built-in self test

1. Select **`runSelfTest`** → **Run**.
2. Open **Execution log**. Expect exactly:

```
create: PASS
dedupe: PASS
honeypot: PASS
validation: PASS
errorLog: PASS
cleanup: PASS
```

3. Confirm `Bluegridls@gmail.com` received a "New Estimate Request — Self Test" email.
4. The test rows delete themselves; `leads` and `errorLog` return to just their header rows.

### 8 · Deploy as a Web App

1. **Deploy → New deployment** → gear → **Web app**.
2. Description: `BlueGridAPI v1`
3. Execute as: **Me**
4. Who has access: **Anyone** ← required. "Anyone with Google account" will break the public form.
5. **Deploy**, approve access, and **copy the Web app URL** (ends in `/exec`).

### 9 · Wire the website

Open [`../js/indexJS.js`](../js/indexJS.js) and paste the URL into `businessConfig`:

```javascript
estimateEndpoint: 'https://script.google.com/macros/s/AKfycb…/exec',
```

That is the only website change required. All 8 pages (homepage + 7 service pages) share this one file.

### 10 · Verify end to end

Submit a real request on the live site and confirm all five:

1. A new row in `leads` with `status` = `new`
2. An email at `Bluegridls@gmail.com`
3. **No** copy to any Nulo Studio address
4. An auto-reply at the address you submitted
5. The on-screen success panel

Then check `errorLog` is still empty.

---

## Redeploying after code changes

**Deploy → Manage deployments → (pencil) → Version: New version → Deploy.**

Editing the existing deployment keeps the `/exec` URL stable. Creating a *new deployment* mints a new URL and silently breaks the website — never do that for this project.

---

## Manual test plan

| # | Test | Expected |
|---|------|----------|
| 1 | `GET /exec?action=ping` | `{"success":true,"data":{"module":"forestryModule",…}}` |
| 2 | Submit the website form | Row added; owner email; auto-reply; success panel; `errorLog` untouched |
| 3 | Submit twice with the same `leadId` | One row only; second response has `"duplicate": true` |
| 4 | Fill the hidden `companyWebsite` field | `success: true`, `honeypot: true`, **no row, no email** |
| 5 | Submit with a blank name | `VALIDATION_ERROR` with `fields.fullName`; site highlights the input; row appears in `errorLog` |
| 6 | Submit `estimatedAcres` = `abc` | `VALIDATION_ERROR` with `fields.estimatedAcres` |
| 7 | Set `notificationEmail` to an invalid address, submit | **Lead still saved**; failure recorded in `errorLog` |
| 8 | `GET ?action=leads.list` with no key | `UNAUTHORIZED` |
| 9 | `GET ?action=leads.list&apiKey=…` | Lead array; `photoNames` parsed as a real array |
| 10 | Rename a header in `leads` row 1, then submit | Header self-heals to canonical; no data lost |
| 11 | Type `=1+1` into a form field | Stored as text (`'=1+1`), not evaluated |
| 12 | Run `setupSpreadsheet()` three times | Still five tabs, one header row each, no duplicate config rows |

---

## Behavior notes

- **Sheet-first.** The row is committed before any email is attempted. If mail fails, the visitor still sees success, the lead is still in the sheet, and the failure is in `errorLog`.
- **Dedupe.** `leads.create` is idempotent on `leadId`. Double-taps and mobile retries cannot create two rows.
- **Locking.** A script lock (30 s) wraps dedupe + append and the update read-modify-write. Timeout returns `LOCK_TIMEOUT`.
- **Header self-heal.** Row 1 of both `leads` and `errorLog` is compared to its canonical list on every access and repaired if it drifts — data rows are never touched.
- **Plain text everywhere.** Cells are formatted `@` so ISO timestamps and phone numbers round-trip as strings. `normalizeCellValue()` rescues Date cells created by hand edits.
- **Formula injection.** Values starting `=`, `+`, `-`, or `@` are prefixed with an apostrophe so a malicious submission cannot execute in the owner's spreadsheet.
- **Error-log recursion guard.** `writeErrorLog` cannot re-enter itself; if it fails it falls back to the execution log and gives up quietly rather than looping.
- **No personal data in logs.** `errorLog` records the `leadId` as the join key back to the row, never the customer's name or email.
- **Photos.** Phase 1 records `photoCount` and `photoNames` only — no bytes are uploaded and `photoUrls` stays `[]`. The owner email says so explicitly. Phase 11 adds `leads.addPhotos`.
- **MailApp quota.** Consumer Gmail allows ~100 recipients/day. Each lead uses 2 (owner + auto-reply).

---

## Adding an endpoint later

Add a row to `ROUTES` in `routes.gs` and write the handler. Nothing else changes — this is the extension point for Phase 11's `leads.addPhotos`.
