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
| `Code.gs` | `doGet` / `doPost`, body parsing, `setupSpreadsheet()`, `removeObsoleteConfigKeys()`, `previewLeadIdentifierMigration()` / `migrateLeadIdentifiers()`, `runSelfTest()` |
| `routes.gs` | Action → handler registry; per-action method and auth requirements |
| `leads.gs` | `LEADS_HEADERS` contract, create / list / update handlers, sequential id allocation, `findLeadById` / `findLeadByReferenceId` |
| `photoStorage.gs` | Drive folders, `leads.addPhotos` handler, photo resolution for `leads.create` |
| `validation.gs` | Sanitization, field/enum/length validation, honeypot, formula-injection defense |
| `notifications.gs` | Owner email, customer auto-reply, message formatting |
| `utilities.gs` | Sheet access, header enforcement, row/object mapping, config, envelopes, auth, **error logging** |
| `config.gs` | Constants, enums, limits, error codes, default recipient |
| `appsscript.json` | **Project manifest.** Declares the OAuth scopes explicitly — see *OAuth scopes* below. Pasted into the manifest editor, not created as a script file. |
| `localTestRunner.js` | **Development tool — do not paste into Apps Script.** Node harness that runs everything against in-memory Google mocks. |

Paste order does not matter — Apps Script loads all files into one global scope before running.

---

## OAuth scopes

`appsscript.json` declares `oauthScopes` explicitly. **An explicit list replaces the automatically derived one — it does not add to it**, so this array has to name every scope the project needs, not just the one that was missing.

These are the complete minimum for the current code. Each was taken from the Authorization section of the relevant Apps Script reference page, not inferred.

| Scope | Why it is required | Called by |
|---|---|---|
| `.../auth/drive` | Photo storage creates folders and files, renames the per-lead folder, changes its sharing, and trashes the preflight probe. `drive.readonly` — the only narrower scope `DriveApp` accepts — cannot do any of that, and `getFoldersByName` searches beyond app-created files. | `photoStorage.gs` (`getPhotoRootFolder`, `getLeadPhotoFolder`, `applyPhotoFolderAccess`, `handleAddPhoto`, `labelPhotoFolder`), `Code.gs` (`checkPhotoStorage`) |
| `.../auth/spreadsheets` | Reading and writing the `leads`, `errorLog` and `config` tabs. **`spreadsheets.currentonly` is deliberately not used**: `getSpreadsheet()` falls back to `SpreadsheetApp.openById()` when the script runs standalone, and the narrower scope would break that path. | `utilities.gs` (`getSpreadsheet`) and everything that writes a row |
| `.../auth/script.send_mail` | The owner notification and the customer auto-reply. `MailApp` only ever needs this one; it is much narrower than the `mail.google.com` scope `GmailApp` would have required. | `notifications.gs` |

**Nothing else needs a scope.** `PropertiesService`, `LockService`, `Utilities`, `ContentService` and `Session.getScriptTimeZone()` are all documented as requiring none. There is no `UrlFetchApp` (so no `script.external_request`), no `ScriptApp`, no advanced services, and nothing reads user identity (so no `userinfo.email`).

> **The trade-off of declaring scopes explicitly:** adding a new Google service to the code will now fail at runtime instead of quietly widening the consent prompt. If you add one, add its scope here in the same change. `checkPhotoStorage()` and `runSelfTest()` will both catch it before a customer does.

---

## Endpoints

Base URL is the Web App deployment URL, ending in `/exec`.

| Method | Action | Auth | Purpose |
|--------|--------|------|---------|
| GET | `?action=ping` | none | Health check |
| GET | `?action=leads.list&apiKey=…` | apiKey | All leads, newest first |
| POST | `?action=leads.create` | none (public) | Create a lead from the website form |
| POST | `?action=leads.addPhotos` | none (public) | Store one submitted photo against a `referenceId` |
| POST | `?action=leads.update` | apiKey | Update pipeline fields from the dashboard |

### Transport rules

- The website POSTs `Content-Type: text/plain;charset=utf-8` with a JSON string body. This is deliberate: Apps Script web apps cannot answer a CORS preflight, and `application/json` would trigger one and fail from the browser.
- **Every response is HTTP 200.** The envelope carries the real status:

```json
{ "success": true,  "data": { "lead": { } } }
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "email": "Required." } } }
```

- Error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `LOCK_TIMEOUT`, `UNKNOWN_ACTION`, `SERVER_ERROR`.

### The two identifiers

| | `leadId` | `referenceId` |
|---|---|---|
| Example | `BG-0001` | `BG-1786635839698` |
| Who mints it | The server | The browser |
| Audience | Internal — the owner and the dashboard | The customer, as a confirmation number |
| Role | How a lead is organised and updated | The key `leads.create` dedupes on |

Only the browser can mint the dedupe key, because only the browser knows a second POST is a retry of the first. Only the server can mint the sequential number, because only the server can serialise the allocation. Hence one of each.

**The client never sends a `leadId`.** It is allocated inside the same `LockService` section that already serialises writes, and only *after* the dedupe check — so a retry returns the original row and consumes no number. The next number is derived from the sheet rather than a stored counter, which means clearing rows before launch is the entire reset.

### `leads.addPhotos`

One photo per request, posted **before** `leads.create` so the owner's notification can carry links rather than filenames.

```json
{ "referenceId": "BG-1786635839698", "index": 1, "fileName": "backLot.jpg",
  "mimeType": "image/jpeg", "dataBase64": "…" }
```

Each photo is stored in Drive under `BlueGrid Lead Photos/<referenceId>/`, named `01-backLot.jpg` so order survives. `leads.create` then reads that folder itself and writes the URLs to the row — **it never accepts photo URLs from the client**, so a hand-crafted POST cannot put an arbitrary link in front of the owner. Once the row exists the folder is relabelled `BG-0001 · Name · BG-1786635839698`.

Retries are idempotent by filename: re-uploading the same photo returns the stored one instead of a second copy.

See *Upload policy* below for everything this endpoint enforces. The browser downscales to 1600px on the long edge first.

---

## Upload policy

**Enforced twice.** The website applies every limit so a customer gets instant feedback; the API applies all of them again against the bytes that actually arrive. `leads.addPhotos` is public and anonymous, so **the front end is a courtesy and the server is the control** — a direct POST is subject to the identical policy.

| Limit | Value | Server-side enforcement |
|---|---|---|
| Photos per estimate | **5** | Counted from the lead folder's real contents |
| Per photo | **8 MB** | Base64 length, checked before any decode |
| Combined per estimate | **25 MB** | Summed from the folder, since each photo is its own POST |
| Formats | **JPEG, PNG, WebP** | **Content signature**, not the declared type |
| Reference age | 24 hours | `isReferenceIdRecent` |
| Global ceiling | 120 uploads/hour | `photoUploadsPerHour`, script cache |

### Content is authoritative

`mimeType` and `fileName` are claims. A direct POST can set both to anything, so **the leading bytes of every upload are inspected** against `PHOTO_CONTENT_SIGNATURES` and the file is rejected unless they are genuinely one of the accepted formats. An `.exe` renamed `holiday.jpg` and declared `image/jpeg` fails here and nowhere earlier.

Explicitly detected and refused, each logged by what it actually was: SVG, XML, HTML, Windows/Linux/Mach-O executables, ZIP, RAR, gzip, PDF, shell scripts, GIF, BMP. Anything matching no accepted signature is refused regardless.

Three deliberate nuances:

- **A missing `mimeType` is not fatal** when the bytes are a real image — Android pickers and drag-and-drop often send nothing, and the content settles it.
- **A wrong-but-still-image `mimeType`** (a PNG announced as JPEG) is stored as what the bytes are, and the disagreement is logged. Refusing it would invent a way for honest uploads to fail without preventing anything an attacker could not trivially avoid.
- **A non-image `mimeType`** (`application/pdf`, `image/svg+xml`) is refused outright even when the bytes are a valid photo. Nothing legitimate does that.

### HEIC/HEIF — removed 2026-08-15

Accepted until then. Now refused, for three reasons that only add up together:

1. **iOS already converts.** On the default *Automatic* / *Most Compatible* camera setting an iPhone hands a file input a JPEG. HEIC arrives only from the non-default *Current* setting or a Files-app pick.
2. **It was the one format bypassing our own downscaling.** Canvas cannot decode HEIC, so the browser fell back to the original bytes and it uploaded full size while everything else arrived at 1600px.
3. **Its signature was the weakest rule here.** HEIC is ISO-BMFF — the same container as MP4/MOV — so it needed a brand allowlist at offset 8 rather than an exact magic number. Removing it left every accepted format on an exact byte match.

The container signature is **kept in the rejected list**, so an iPhone photo logs as `HEIC/HEIF or MP4/MOV container` rather than `unrecognised binary`, and the front end gives the customer the fix (*Settings › Camera › Formats › Most Compatible*) instead of a flat refusal.

**Watch this in early live traffic.** If real iPhone users are being turned away, re-accepting is a two-line change: add `image/heic` back to `ALLOWED_PHOTO_MIME_TYPES` and restore its `PHOTO_CONTENT_SIGNATURES` entry.

### Throttle

Apps Script gives a web app **no client IP**, so per-caller rate limiting is not possible. `photoUploadsPerHour` is a deliberately blunt global ceiling — far above any real hour for a local-service business, far below what an unattended script could do. It fails **open** if the cache is unavailable: a cache outage must not stop a real customer, and every per-lead cap still applies.

### Failure behaviour

Unchanged and load-bearing: **a photo problem never costs the lead.** A rejected file is never written to Drive, the estimate is still created, the owner's email says plainly that photos did not arrive, and the customer sees only a short neutral message. The specific reason — including the detected file type — goes to `errorLog`.

**A photo failure can never fail a lead.** Every path in `photoStorage.gs` returns empty or logs and returns, and the owner's email says plainly when photos did not arrive.

---

## Photo access architecture

**Approved 2026-08-15. Root-folder Viewer inheritance.**

```
admin@nulostudio.com  (owns the script, the spreadsheet and the Drive storage)
│
└── BlueGrid Lead Photos          ← BlueGrid owner granted VIEWER here, ONCE
    ├── BG-0001 · Name · BG-…     ← inherits Viewer
    │   ├── 01-frontField.jpg     ← inherits Viewer
    │   └── 02-backLot.jpg        ← inherits Viewer
    └── BG-0002 · Name · BG-…     ← inherits Viewer
```

**Nulo Studio owns everything. The BlueGrid owner receives Viewer on the root once. Every existing and future lead folder and photo inherits it. Customer submissions perform no Drive sharing operation whatsoever.**

### What this deliberately avoids

The previous model called `addViewer()` on **every lead folder** at creation. That meant one sharing operation per estimate — a potential Drive "shared with you" email per customer submission, one *Shared with me* entry per lead accumulating forever, and one more thing to fail silently on the submission path. One grant on the root replaces all of it.

### The security boundary

Google Drive permissions apply to **one item and inherit downward only**. There is no upward traversal. Granting Viewer on `BlueGrid Lead Photos` therefore exposes that folder and its descendants — and nothing else.

| The BlueGrid owner CAN | The BlueGrid owner CANNOT |
|---|---|
| See `BlueGrid Lead Photos` in *Shared with me* | Browse `admin@nulostudio.com`'s My Drive |
| Open every lead folder, past and future | See the root's **parent** folder |
| View and download every customer photo | See any **sibling** of the root — other Nulo folders, other clients' files |
| Use both email link types | Open the Apps Script project or the leads spreadsheet |
| | Edit, delete, rename or restructure anything — **Viewer is read-only** |
| | Re-share the folder with anyone else |

### `photoViewerEmail` is not `notificationEmail`

Two keys, two questions, never collapsed:

| Key | Answers | Typical value during testing |
|---|---|---|
| `notificationEmail` | *Who is emailed about a new lead?* | `admin@nulostudio.com` |
| `photoViewerEmail` | *Whose Google account can open the photographs?* | a temporary test account, later Chase's |

They are independent by design: during acceptance testing estimate mail goes to Nulo Studio while Drive access sits with a throwaway account. `photoViewerEmail` is **blank by default and never guessed** — `shareRootFolderWithOwner()` refuses to run rather than granting access to an assumed address.

### Admin functions — editor only, never on the submission path

None of these is reachable from `routes.gs`; no HTTP request can trigger them.

| Function | Does |
|---|---|
| `shareRootFolderWithOwner()` | Grants Viewer on the photo root to `photoViewerEmail`. Idempotent — re-running when already shared makes no second grant and says so. Throws loudly on a blank/malformed address or a sharing failure. Reports the folder name, id, URL and the account. |
| `revokeRootFolderViewer(email)` | Removes Viewer again. Defaults to `photoViewerEmail` when called with no argument. Safe to run twice. |
| `listRootFolderAccess()` | Read-only. Who can currently see the root, plus the active `photoAccess` mode. The fastest answer to *"can the owner actually open these links yet?"* |
| `checkPhotoStorage()` | Full storage preflight, now also reporting whether `photoViewerEmail` holds access — so *"photos upload fine"* can never again be mistaken for *"the owner can see them"*. |

### Granting or replacing the photo viewer

To point Drive access at a different Google account — swapping a test account for Chase's, or changing it later:

1. Open the `config` tab and set **`photoViewerEmail`** to the new address.
2. In the editor, run **`shareRootFolderWithOwner()`**. Confirm the log names the right folder and account.
3. Run **`revokeRootFolderViewer("old@address.com")`** with the address being replaced.
4. Run **`listRootFolderAccess()`** and confirm only the intended account is listed.

No redeploy is needed for any of this — these are editor-run functions and config values, not deployed code.

### Retention — an open policy decision, not implemented

These folders accumulate customer photographs and names indefinitely. Nothing in this codebase deletes them, and **nothing should be added that does until a retention period is decided** with the client: how long photos are kept after a job closes or a lead goes cold, whether deletion is manual or scheduled, and what the customer was told at submission. Recorded here as an open decision, deliberately unimplemented.

---

## Run the tests before deploying

From this folder, with Node installed:

```
node localTestRunner.js
```

Expect `passed: 116   failed: 0`. This exercises setup idempotency, the full create path, dedupe, honeypot, every validation rule, error logging, the "email failure must not fail the lead" guarantee, formula-injection defense, header self-heal, auth, update, sequential lead numbering, photo storage and its public-endpoint limits, and the identifier migration — all without touching Google.

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

### 3 · Paste the eight `.gs` files

1. Delete the contents of the default `Code.gs`.
2. For each `.gs` file in this folder, create a matching script file (**＋ → Script**) and paste its contents. Use these names: `Code`, `routes`, `leads`, `photoStorage`, `validation`, `notifications`, `utilities`, `config`.
   *(Apps Script appends `.gs` automatically — do not type the extension.)*
3. **Do not paste `localTestRunner.js`.** It is a Node development tool and will not run in Apps Script.
4. **Save** (Ctrl/Cmd + S).

### 3b · Paste the manifest

1. **Project Settings** (gear) → tick **Show "appsscript.json" manifest file in editor**.
2. Back in the **Editor**, open `appsscript.json` and replace its contents with [`appsscript.json`](appsscript.json) from this folder.
3. **Keep your own `timeZone` if it differs** — everything else in the file should match.
4. **Save.**

This step is what grants Drive access. Without the explicit `oauthScopes` array, a project that gained `DriveApp` after it was first authorized keeps its older scope set: `leads.create` keeps working (Sheets and Mail were already granted) while every photo upload throws `You do not have permission to call DriveApp.getFoldersByName`. See *OAuth scopes* above.

**After saving the manifest, re-authorize:** select `checkPhotoStorage` → **Run** → approve the prompt, which will now ask for Drive. Expect `PASS` in the execution log.

### 4 · Set the API key

1. **Project Settings** (gear) → **Script Properties** → **Add script property**.
2. Property: `MODULE_API_KEY`
3. Value: a long random string you generate. Store it in the password manager — the dashboard will need it in Phase 2.
4. **Save script properties.**

> `leads.create` is public by design (a browser cannot hold a secret). Only `leads.list` and `leads.update` require this key.

### 5 · Build the spreadsheet structure

1. In the editor, select the function **`setupSpreadsheet`** and click **Run**.
2. Approve the authorization prompt on first run (**Advanced → Go to BlueGridAPI (unsafe) → Allow** — expected for a personal, unverified script).
3. Confirm the spreadsheet now has five tabs: **`leads`** (29 headers), **`errorLog`** (5 headers), **`config`**, **`dropdowns`**, **`dashboardMetrics`**.

**`setupSpreadsheet()` is idempotent** — re-run it any time, including against a sheet that already holds leads. It creates nothing twice: no duplicate sheets, no duplicate headers, no duplicate config rows, no duplicate named ranges. It also deletes config keys retired by architecture changes.

### 6 · Confirm the notification address

Open the `config` tab:

| key | value | purpose |
|-----|-------|---------|
| `notificationEmail` | the address that receives lead alerts | **email delivery only** |
| `notificationsEnabled` | `true` | **email delivery only** |
| `autoReplyEnabled` | `true` | **email delivery only** |
| `photoAccess` | `rootInherited` | Drive sharing behaviour |
| `photoViewerEmail` | *(blank until set deliberately)* | Drive access only |
| `photoUploadsPerHour` | `120` | upload throttle ceiling |

Editing these takes effect on the next submission — **no redeploy needed**. There is intentionally no second recipient key.

**The notification keys and the photo keys are independent and must stay that way.** `notificationEmail` decides who is *emailed*; `photoViewerEmail` decides whose Google account can *open the photographs*. During acceptance testing they are different addresses. Never repurpose one for the other.

**`photoAccess`** decides how submitted photos are shared. See *Photo access architecture* below.

| value | effect |
|-------|--------|
| `rootInherited` | **Default and approved model.** A submission performs **no Drive sharing call at all**. Access comes from one Viewer grant on the photo root, applied once by `shareRootFolderWithOwner()`, which every lead folder and photo inherits. |
| `anyoneWithLink` | Per-lead link sharing — anyone holding the URL can view. **Not part of the approved model**; it shares during the submission and makes customer photographs readable by anyone with the link. Escape hatch only. |

`ownerEmail` and `private` were retired on 2026-08-15. A sheet still holding either is not an error — the value is unrecognised, the mode falls back to `rootInherited`, and the fallback is logged. **The fallback is the safe mode**, so an un-migrated sheet lands on the approved behaviour rather than an unsafe one.

**`photoViewerEmail`** is the Google account that gets Viewer on the photo root. It is **deliberately separate from `notificationEmail`** — see below.

### 7 · Run the built-in self test

1. Select **`runSelfTest`** → **Run**.
2. Open **Execution log**. Expect exactly:

```
create: PASS
identifiers: PASS
dedupe: PASS
dedupe keeps leadId: PASS
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

1. A new row in `leads` with `status` = `new`, a sequential `leadId`, and a long `referenceId`
2. An email at `Bluegridls@gmail.com` showing that `referenceId` as **Reference**
3. **No** copy to any Nulo Studio address
4. An auto-reply at the address you submitted, quoting the `referenceId` and never the sequential number
5. The on-screen success panel

Submit at least one of these **with photos attached** and confirm the sixth: every photo is a working link in the owner's email, and opening one shows the image.

Then check `errorLog` is still empty.

---

## Migrating an existing spreadsheet

Only needed for a sheet that holds rows written **before** the identifier split — those have a long id in the `leadId` column and nothing in `referenceId`.

1. Paste the updated `.gs` files, including the new `photoStorage.gs`.
2. Run **`setupSpreadsheet`**. It appends the two new headers (`referenceId`, `photoFolderUrl`) and seeds `photoAccess`. Existing rows are untouched — the new columns are simply blank on them.
3. Run **`previewLeadIdentifierMigration`** and read the Execution log. It writes nothing and reports exactly which rows would change.
4. If the plan looks right, run **`migrateLeadIdentifiers`**. Each legacy row's long id moves into `referenceId` and the row gets a sequential `leadId`, in sheet order.

The migration deletes no rows, removes no columns, touches no other cell, and is safe to run twice — the second run finds nothing to do. Rows it cannot interpret are reported rather than guessed at.

### Before launch: starting real leads at BG-0001

Sequential numbering is derived from the `leads` sheet, so **deleting the test rows is the whole reset.** There is no counter to clear.

When the test leads are no longer wanted, by hand:

1. In the `leads` tab, select the test data rows (everything below row 1) and **delete the rows** — not just their contents, and never row 1.
2. Optionally clear `errorLog` the same way.
3. Optionally delete the test folders under **`BlueGrid Lead Photos`** in Drive.
4. Confirm `config!notificationEmail` is the owner's real address.

The next real submission is then `BG-0001`. Nothing in the code does any of this for you, deliberately.

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
| 3 | Submit twice with the same `referenceId` | One row only; second response has `"duplicate": true`, and the same `leadId` |
| 4 | Fill the hidden `companyWebsite` field | `success: true`, `honeypot: true`, **no row, no email** |
| 5 | Submit with a blank name | `VALIDATION_ERROR` with `fields.fullName`; site highlights the input; row appears in `errorLog` |
| 6 | Submit `estimatedAcres` = `abc` | `VALIDATION_ERROR` with `fields.estimatedAcres` |
| 7 | Set `notificationEmail` to an invalid address, submit | **Lead still saved**; failure recorded in `errorLog` |
| 8 | `GET ?action=leads.list` with no key | `UNAUTHORIZED` |
| 9 | `GET ?action=leads.list&apiKey=…` | Lead array; `photoNames` parsed as a real array |
| 10 | Rename a header in `leads` row 1, then submit | Header self-heals to canonical; no data lost |
| 11 | Type `=1+1` into a form field | Stored as text (`'=1+1`), not evaluated |
| 12 | Run `setupSpreadsheet()` three times | Still five tabs, one header row each, no duplicate config rows |
| 13 | Submit with two photos | Both appear in `BlueGrid Lead Photos/<referenceId>/`; owner email links each and offers the folder; `photoUrls` and `photoFolderUrl` populated on the row |
| 14 | Submit with photos, then submit again after a forced failure | Photos are not stored twice; one row only |
| 15 | Three consecutive real submissions | `leadId` runs `BG-000n`, `BG-000n+1`, `BG-000n+2` with no gaps |
| 16 | Run `migrateLeadIdentifiers()` twice | Second run reports zero changes; no row count change |

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
