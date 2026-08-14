# Engineering Journal — BlueGrid Land Solutions

Append-only. Newest entry at the top.

---

## 2026-08-13 — P0 SEO IMPLEMENTATION

**Commit `4b3df59`** — 33 files, 8,786 insertions.

### What the inventory changed about the plan

The brief assumed a site that needed an SEO pass. The site had already had one on 2026-08-11: unique titles and descriptions on all 24 pages, canonicals, OG, per-page-kind schema, breadcrumbs, an intent map enforced by `validateSeo`, and zero H1 intent collisions. Re-doing that would have been churn.

So the work went where the gaps actually were, and the inventory found five:

- **No `robots.txt` and no `sitemap.xml`.** Neither had ever existed.
- **No service-area hub.** `locations/` had nine town pages and no index. They were reachable only from the header panel and the footer, which is chrome — so every one of them was a content orphan, and nothing on the site answered "do you come out to where I am?"
- **No pages for Minford, Piketon or Jackson**, the three places with photograph-verified provenance.
- **No tree page**, which the brief assumed existed and audited. It does not.
- **The Service Areas panel's featured card said "View All Service Areas" and pointed at a homepage anchor.** It had nowhere else to point.

### The claims audit found evidence nobody had opened

The brief listed claims not to invent — insurance, pricing, response times, capability limits. Before touching any of them I checked what the repository could actually prove, and the answer was sitting in `graphics/images/` the whole time: three of those files are **Chase's own advertisements**, not job photos.

They settle a lot. "FULLY INSURED" is a badge on two of them. "LOCALLY OWNED & OPERATED" is on one. The phone number the debt file has called an unconfirmed placeholder since Phase 1 is printed across the middle of `whatTheyDo2.jpg` — **the flyer was the evidence, and it had never been looked at.** The "1–2 days" claim is the headline of `BeforeandAfter.jpg`. The service list on `whatTheyDo.jpg` includes tree and brush cleanup, which is the one service with first-party backing and no page.

What the adverts do *not* mention is any response time. So "Free estimates within 24 hours." — stated flat in three homepage descriptions while the on-page copy hedged it as "*most* quotes" — was brought into line with the hedged version rather than deleted, and flagged. Same reasoning retired "storm cleanup jumps the line … machine on site within days": Chase's own storm advert says "when the storm clears, we're just getting started", which is restoration, not emergency dispatch. Priority scheduling stayed, because that is his call to make; the on-site timeframe went, because the site cannot promise it on his behalf.

Nothing else needed touching. No pricing figure exists anywhere on the site, no coverage amount, no diameter limit, and no schema block carries an address, coordinates or a `priceRange`.

### Three location pages, written rather than templated

Minford, Piketon and Jackson were built from the existing location architecture — same URL convention, same donor chrome spliced in byte-identically and proven so by diffing two donors before writing. What is *not* shared is the content: each page has its own terrain writing, its own landowner problems, its own five FAQs and its own nearby list. Swapping a city name through one template is the specific thing the brief forbade and the thing `validateSite`'s pairwise-overlap check would have caught anyway.

**The restraint rule got its own section in the content data.** A location-coded filename proves where a photo was taken and nothing else. So the proof blocks say BlueGrid has completed *land-service work* in that place, the captions describe only what is visible in the frame, and no page calls its photographed project forestry mulching, pasture restoration, hunting work or reclamation. The H1s still say "Forestry Mulching in Minford, OH" because that is a statement of service availability — which is what a location page is for — not a claim about the job in the photograph.

Four of the five orphaned photos from the rename session found their home here; one, `afterForestryMulching_minfordOH.jpg`, is now doing real work on the Minford page.

### The hub, and two validators that had to learn about it

`locations/index.html` answers the availability question, lists both regions county by county, links all nine town pages, and states plainly that there is no branch office in any of these towns. Its schema is an `ItemList` of the location pages — deliberately **not** a `LocalBusiness` per city, which would be a fabricated address nine times over.

Two existing checks failed it, and both were right to on their own terms:

- `validateSite` forbids a location page linking sideways to another location page. The hub does nothing but that. Exempted by path, with the reasoning written into the check: the rule exists to stop town pages cannibalising each other, and the hub is what stops them being orphans.
- `validateSeo` requires `Service` schema on anything under `locations/`. The hub describes a territory, not one service in one place, so it became its own page kind.

`validateMegaMenus` also failed, for the most useful reason of all: it asserts the Service Areas panel has exactly 13 rows, and adding Minford and Piketon made it 15. The contract was updated with a note saying why. That check earned its keep.

### The sitemap generates from the canonicals

`sitemap.xml` is built by reading the canonical tag off each page rather than from file paths, so the two cannot drift — if a canonical is wrong the sitemap is wrong identically, which is visible instead of hidden. It refuses to write if the canonicals span more than one origin, and it skips anything carrying `noindex`. The production domain is still undecided, so the generator inherits whatever origin the pages declare and both files carry a TODO; when the domain is settled, the canonicals get swept and this regenerates.

### The lead path was not touched

`js/indexJS.js` and every file under `appsScript/` are byte-identical to where they started — confirmed with `git diff --stat`. The estimate form section on the new pages is lifted verbatim from the donor rather than regenerated, behind a guard that refuses to write if the extracted block is missing the form or the honeypot. All 28 pages carry `estimateForm`, `estimateModal` and `companyWebsite`.

The one edit inside that block was deliberate: the donor's "Most quotes answered within 24 hours by the owner" bullet became "Answered by the owner, not a call centre" on new pages, so the P0 work did not propagate an unevidenced claim onto four fresh URLs.

### Validation

13/13 validator suites, 116/116 Apps Script harness, `node --check` clean, 331 asset references resolving with exact casing. Nothing has been seen in a browser.

### One thing this session broke and the closeout caught

Writing these journal and debt entries through scripts that emitted `\n` left **mixed line endings** in `engineeringJournal.md` (1607 CRLF + 59 bare LF) and `technicalDebt.md` (373 + 30). It bit immediately: the next scripted edit detected CRLF from the file as a whole, built its search string with `\r\n`, and failed to match a heading that happened to sit in an LF region.

Normalised both files back to uniform CRLF at closeout. **`git diff` confirmed zero content change** from the normalisation — `core.autocrlf` is `true`, so the committed bytes were always LF either way, and this only ever affected the working tree.

Worth knowing because the mitigation already exists and was not followed: every guarded assembler in this project detects the line ending per file and restores it, precisely so scripted edits stay reliable. The one-off doc scripts did not, and that is the whole lesson.

---

## 2026-08-13 — PROJECT PHOTOS RENAMED WITH LOCATIONS; ASSET REFERENCES REPAIRED

**Commit `8fadfe0`.**

### Brief

Aron renamed the real project photos in `graphics/images/` to carry their confirmed locations, which broke references across the site. Repair every one. Do not redesign, do not move imagery, do not rename anything again.

### Establishing the mapping by content, not by name

The obvious approach — match `work.jpg` to `workJacksonOH.jpg` because the names look alike — is exactly what the brief warned against, and it would have been wrong at least once: `after.JPG`, `hero_after.jpg` and `afterForestryMulching_minfordOH.jpg` are three different photographs whose names all contain "after".

So the mapping came from bytes. `git ls-tree HEAD` gives the ten filenames the repository knew about; hashing each blob with `git cat-file blob HEAD:<path> | sha256sum` and comparing against a hash of every file now on disk produced ten exact matches and no ambiguity at all. Sizes agreed too. **Every replacement is provably the same physical image**, which is the only basis on which this task could be done without a human eyeballing eighteen photographs.

That also separated the renames from the additions: four files on disk match no blob in `HEAD`, so they are new photos Aron dropped in rather than anything that needed repointing.

| Renamed (content-verified) | | New, unreferenced |
|---|---|---|
| `after.JPG` → `after_minfordOH.JPG` | `overGrowth.JPG` → `overGrowth_minfordOH.JPG` | `B4MulchingJob_minfordOH.jpg` |
| `cleanCut.JPG` → `cleanCut_minfordOH.JPG` | `overGrowthCleanedup.JPG` → `overGrowthCleanedup_minfordOH.JPG` | `mulchingJob_minfordOH.jpg` |
| `excavator2.jpg` → `excavator2_PiketonOH.jpg` | `work.jpg` → `workJacksonOH.jpg` | `b4ForestryMulch_minfordOH.jpg` |
| `freshMulching.JPG` → `freshMulching_minfordOH.JPG` | `work2.jpg` → `work2JacksonOH.jpg` | `afterForestryMulching_minfordOH.jpg` |
| `hero_after.jpg` → `hero_after_minfordOH.jpg` | `hero_b4.JPG` → `hero_b4_minfordOH.JPG` | |

`BeforeandAfter.jpg`, `excavator.jpg`, `whatTheyDo.jpg` and `whatTheyDo2.jpg` were not renamed and were left alone.

### The repair

**75 references across 24 files.** Only basenames were replaced, so the two relative-path forms this site uses — `graphics/images/…` from root pages and `../graphics/images/…` from every one-level folder — were preserved without the script needing to know about either.

The replacement script refused to write unless its guards passed: every target had to exist on disk, and no old name could survive in a file it had rewritten. It also checked that no old name was a substring of any other old *or new* name, since a plain replace would corrupt a neighbouring reference.

**That guard had a gap worth recording.** `after.JPG` *is* a substring of `hero_after.JPG` — but `hero_after.JPG` was not in the map (the tracked file was lowercase `hero_after.jpg`), so the guard never compared them. It happened to be harmless: had an uppercase `hero_after.JPG` existed anywhere, the `after.JPG` rule would have rewritten it to `hero_after_minfordOH.JPG`, which is the correct name anyway. Harmless by luck, not by design. What actually caught it was resolving every reference against the filesystem afterwards, which is the check that does not depend on reasoning about string overlap being right.

Docs were treated differently on purpose. `heroSpecification.md` names the two source plates used to manufacture the hero, and `technicalDebt.md` item 22 names the orphan file — both operational, both updated, both carrying a short "renamed from" note so the provenance survives. **`engineeringJournal.md` and `projectState.md` were deliberately left alone**: their mentions are narrative about past renames ("the single rename is the Phase 2C `hero_after.JPG → after.JPG` casing fix"), and rewriting those would falsify the record of what happened.

### `validateAssets.js` — and what validateSite was missing

Verification found the repair clean, but writing the check exposed that the existing coverage was thinner than the phrase "24 pages, zero broken" in `projectState.md` suggested. `validateSite` reads `href=` and `src=` only, and it resolves with `fs.existsSync`. Two consequences:

- **Every location page points `og:image` and `twitter:image` at a relative path inside a `content=` attribute.** Ten such references existed and nothing had ever checked them.
- **`fs.existsSync` is case-insensitive on Windows.** A reference to `hero_b4.jpg` when the file is `hero_b4.JPG` passes locally and 404s on GitHub Pages. **This project has already shipped that exact bug once** — see the entry below about `hero_after.JPG` arriving on disk as `hero_after.jpg` while git kept tracking the uppercase name.

So `validateAssets.js` compares against the real directory listing rather than asking the filesystem, and reports a case-only difference as its own distinct failure with the actual casing named. It covers `src`/`href`, meta image `content` in both attribute orders, `srcset` and inline `url()` (neither exists today — they are there so that adding one cannot escape the check), CSS `url()`, and the asset paths held in `js/indexJS.js`. **284 references checked**, against the ~90 the old sweep saw.

Proven by injection, one at a time: a missing file in an `og:image`, a case-only mismatch, and a stale old filename in an `img src`. The new validator caught all three; `validateSite` caught only the third.

It also reports orphans. That found six unreferenced project photos — the four new ones, the long-known `after_minfordOH.JPG`, and **`whatTheyDo.jpg`, which nothing has ever referenced** and which no previous session had noticed. `whatTheyDo2.jpg` is on the site; its sibling never was. Reported, not fixed: which photo belongs on which page is an editorial call, and this project deliberately does not put every image it owns onto the site.

### One note the validator emits rather than fails on

`js/indexJS.js` holds `introVideoPoster: 'graphics/images/excavator2_PiketonOH.jpg'`. That is a page-relative path in a script shared by all 24 pages, so it resolves on root pages and would 404 from any one-level folder. It is correct today because the intro-video section exists only on `index.html` and is gated off by `introVideoConfigured: false`. Left exactly as it was — pre-existing, inert, and outside a brief that said not to redesign — but the validator now says so out loud every run instead of leaving it to be rediscovered.

### Validation

**13/13 validator suites** (twelve existing plus the new one), 116/116 Apps Script harness, `node --check` clean. Zero stale references in any HTML, CSS or JS; every one of the 284 asset references resolves with exact casing.

---

## 2026-08-13 — LEAD PIPELINE FINALIZATION: PHOTO STORAGE + IDENTIFIER SPLIT

**Commits `18c8845` and `9990055`.** Repo-side only — not deployed.

### Brief

Finalize the lead pipeline after the live test. Two defects: submitted photos were recognized but not accessible to the owner, and the single long lead identifier needed splitting into an internal `leadId` and a customer-facing `referenceId`. Explicitly: do not rebuild the working lead system, make the smallest robust changes, stop before touching the live deployment or Sheet.

### Photo root cause — the bytes never left the browser

The trace took one pass and the answer was worse than "the upload endpoint is missing".

`addPhotoFiles()` put each `File` object into an in-memory `photoFiles` array and made a local `blob:` preview URL. `buildEstimatePayload()` then sent `photoCount` and `photoNames` — the filename strings, nothing else. Server-side, `handleCreateLead()` hardcoded `photoUrls: []` and `notifications.gs` told the owner in as many words that "photos are not uploaded yet". So the owner's email named a file that existed nowhere but on the customer's phone. That much was already documented as item 24.

**What was not documented is the part that makes it a defect rather than a known limitation.** `simulateUploadProgress()` ran a 160ms timer that filled each preview's progress bar to 100%, with a random increment to make it look like network jitter. Nothing was being sent. The visitor watched their photos "upload", saw every bar complete, and submitted — which is precisely why the first real lead produced a confused owner rather than a shrug. A missing feature is a gap; a progress bar that lies about a missing feature is a defect, and it is the reason this was found by a person instead of by a checklist.

### Photos: upload before create, and never trust the client for a URL

The ordering question decided the architecture. The owner's notification is sent inside `handleCreateLead()`, so for it to carry links the photos have to already exist. Uploading afterwards would mean either a second "your photos arrived" email or delaying the notification until the browser says it is finished — and a lead notification that depends on the browser staying open is worse than one with no photo links. So: **photos upload first, one request each, then the lead is created.**

One request per photo rather than one big payload, because this is a rural trade whose customers are regularly on one bar of signal. Twelve photos in a single 7MB POST is one thing to lose; twelve small ones are twelve things to retry, and only the failures need retrying. Sequential rather than parallel for the same reason.

**`leads.create` does not accept photo URLs from the client.** It was tempting — the browser already has them back from `addPhotos` — and it would have been an injection hole straight into the owner's inbox: a hand-crafted POST could have put any link at all in front of him under his own website's name. Instead each photo is filed under the `referenceId`, and `resolveLeadPhotos()` reads that folder itself. The client sends nothing about photos except what it always sent. That also made the security question disappear rather than needing to be defended, which is the better kind of answer.

Being public, `leads.addPhotos` is bounded by a well-formed `referenceId` no older than 24 hours, an allowed MIME type, 8MB per file, and 12 files per lead — the caps enforced server-side because the browser's own limits are a courtesy, not a control. Uploads are idempotent by filename, so a retry returns the stored file rather than a second copy. Recorded honestly as debt 24b: bounded is not closed.

### Identifiers: only the client can dedupe, only the server can sequence

The split fell out of one observation. A retry is only recognisable as a retry by the browser that sent both requests, so the dedupe key has to be client-minted — that is the long `referenceId`, and it keeps working exactly as the old `leadId` did. A sequential number cannot be handed out by a client without racing, so `leadId` has to be server-assigned, inside the `LockService` section that already serialises every write for exactly this reason.

The ordering inside the lock is the part worth remembering: **dedupe first, allocate second.** Reversed, every double-tap would burn a lead number and the owner's list would grow gaps. There is a test for it, and the test survives because the design makes the property structural.

Numbering derives from the sheet rather than a stored counter. That costs one column read — the read dedupe already pays — and buys two things: the numbering cannot drift out of step with the rows it describes, and **clearing the test rows before launch is the entire reset**, with no Script Property left holding a stale count. That directly serves the requirement that the first production lead be `BG-0001`.

**The trap this created, and the guard for it.** Pre-split rows hold `BG-1786635839698` in the `leadId` column. Read naively as a sequence number that is 1.7 trillion, and the next real lead would be `BG-1786635839699` — permanently, for the life of the spreadsheet, from a single unmigrated row. `parseLeadNumber()` returns 0 for anything above `MAX_SEQUENTIAL_LEAD_NUMBER`, so an unmigrated sheet still numbers correctly instead of silently exploding. Verified by deleting the guard and confirming four checks fail, including the migration's own.

Both new columns were **appended** after `lastUpdated` rather than slotted beside the fields they belong with. `referenceId` reads better next to `leadId` and sits in column AB instead; the append-only rule in `LEADS_HEADERS`' own header comment is what keeps every pre-existing row readable, and it was written down precisely so a later session would not talk itself out of it.

### Migration: preview, then apply, and never invent a reference

`migrateLeadIdentifiers()` moves each legacy long id into `referenceId` and assigns a sequential `leadId` in sheet order. It deletes no rows, removes no columns, touches no other cell, and is idempotent — someone will run it twice.

`previewLeadIdentifierMigration()` reports the identical plan without writing, and both call one `planLeadIdentifierMigration()` so the preview and the run cannot disagree about what will happen. Rows it cannot interpret — a sequential id with no reference, say — are **reported rather than guessed at**: the customer was quoted some number, and this code does not know what it was.

Nothing destructive is automated. The pre-launch reset is documented in `appsScript/README.md` as manual steps, because a function that deletes lead rows is a function that can delete the wrong lead rows.

### What the tests are worth

The harness went 64 → **116 checks**, which needed a DriveApp mock with real `hasNext()/next()` iterators rather than arrays, because the production code is written against that shape and a friendlier mock would not have proven anything.

Nine regressions were injected one at a time and every one was caught: `photoUrls` reverted to `[]`; the dedupe check removed; dedupe keyed on the wrong column; the allocator ignoring the sheet; the legacy-id guard deleted; the email falling back to filenames; folder sharing skipped; uploads made non-idempotent; a column inserted mid-contract instead of appended. Three more on the client — photos never uploaded, `leadId` sent in the payload, `referenceId` minted per attempt — were caught by `simulateEstimateFlow` and `validateLeadFlow`.

**One injection was not caught, and it turned out not to be a defect.** Allocating a lead number before the dedupe check changed nothing, because allocation is a pure function of the sheet: with no counter, there is nothing to consume. The test asserting "a duplicate consumes no sequence number" is still worth keeping — it is a real requirement — but the design is what makes it true, not the ordering.

`simulateEstimateFlow` needed restructuring: `submitEstimateRequest()` now defers its request behind `uploadPendingPhotos()`, so reading the captured payload synchronously saw `null` and reported a submission that had simply not happened yet. Wrapped in an async main with a `settle()` drain, then given a third path that drives the real uploader against a mocked `File` and asserts the thing that was false before — that photo bytes are transmitted, and transmitted **before** the lead is created.

`validateLeadFlow` had to be told the truth about two fetch call sites. The rule it was really protecting was never "one fetch" but "one endpoint constant", so it now asserts that every call site builds its URL from `businessConfig.estimateEndpoint` — which keeps a redeploy a one-line edit, the thing that actually matters.

### Deliberately not done

- **The owner's HTML email still interpolates several field values unescaped.** Pre-existing, found while adding the photo links, and genuinely unrelated to photos or identifiers — the brief said not to change unrelated functionality. Values added by this session are escaped. Recorded as item 24e with the reason the array mixes escaped and deliberately-HTML cells, since that is what makes the fix easy to get wrong.
- **No orphan-folder cleanup.** A scheduled job that deletes Drive folders is a job that can delete a customer's photos when its "has no lead" test is wrong. Item 24c.
- **Nothing deployed, nothing in the live Sheet touched.**

### Files touched

`appsScript/photoStorage.gs` (new), `leads.gs`, `validation.gs`, `config.gs`, `notifications.gs`, `routes.gs`, `Code.gs`, `localTestRunner.js`, `README.md`; `js/indexJS.js`; `docs/forestryModuleSchema.md`, `docs/googleSheetArchitecture.md`, and the three continuity docs. The scratchpad's `validateLeadFlow` and `simulateEstimateFlow` were updated in place and remain outside the repository (item 10i).

### Validation

**12/12 validator suites, 116/116 Apps Script harness, `node --check` clean on `indexJS.js` and `localTestRunner.js`, all eight `.gs` modules parse.** No behaviour is proven in a browser — see item 4g, which is now the largest untested-by-eye item on the site.

---

## 2026-08-13 — SESSION CLOSEOUT SOP + CLOSEOUT

### Brief

Two things: create a permanent, local, gitignored SOP (`docs/sessionCloseout.md`) that any future session can execute on request without needing the full instructions re-typed, then immediately use it to close out this session.

### The SOP itself

Written to `docs/sessionCloseout.md`, opening with the exact sentence requested so a future session recognizes it as self-executing on request rather than needing re-briefing. Core discipline it encodes: inspect the actual repository before writing anything, never trust a prior session's docs over `git` output, keep the three continuity files' responsibilities distinct (state / history / debt), never claim something is verified when it wasn't checked, and never push a closeout commit without being asked.

**Verified four independent ways before touching anything else**, because "add to `.gitignore`" is exactly the kind of thing that's easy to get wrong silently: `git status --short` doesn't list the file, `git ls-files --error-unmatch` confirms it was never tracked (so there was nothing to `git rm --cached`), `git check-ignore -v` resolves it to the new rule by name and line number, and `git status --ignored` shows it with the `!!` marker. All four agreed.

### What "inspect before trusting the docs" caught immediately

The previous session's closeout left `projectState.md` saying `main` was 12 ahead of `origin/main`, with explicit instructions across several sessions not to push. Running `git status -sb` at the start of this session showed **no ahead/behind at all** — `git rev-list --left-right --count origin/main...HEAD` returned `0 0`. `origin/main` had moved to match local `HEAD` (`ab802b9`) since the last session closed. Nothing in this repository's history explains who pushed or when; it happened outside every session recorded here.

Same pattern, second instance: `git remote -v` showed `origin` already pointing at `https://github.com/ArxnAlley/client_BluegridLandSolutions.git` — the corrected URL `technicalDebt.md` item 10h had been asking for since 2026-08-07. Also fixed outside any recorded session.

Neither of these was hard to check. The point of writing them up is that a closeout that trusted the carried-forward numbers instead of running two `git` commands would have shipped a wrong header for a second time in a row — which is exactly the failure mode the SOP exists to prevent, demonstrated on itself on the first run.

### The live lead test — recorded, not verified

Aron reported a real end-to-end submission: reached the Sheet, owner notification reached a temporary test recipient, field data arrived correctly. This session has no access to the Sheet, the inbox, or the Apps Script execution log, so none of that is independently confirmed here — it's recorded as reported, attributed, per the SOP's own rule about claims this repository cannot check.

One part of it *is* checkable, and checking it changed the project's priorities: the notification named an uploaded photo's filename, and the owner could not open the photo. That is not a new defect — `appsScript/leads.gs` has hard-coded `photoUrls: []` since Phase 1, and the owner email says outright that photos aren't uploaded yet. What changed is that a real person just hit it in a real test, which is why it moved from `technicalDebt.md`'s Low Priority section to the top of the next session's queue rather than staying a documented-but-quiet gap.

### Lead id / reference id — captured as a design problem, not implemented

Read `handleCreateLead()` in full to understand exactly what "split the id" would touch, since the brief was explicit that this is next-session work and closeout should describe it accurately rather than start it. The current `leadId` (`'BG-' + Date.now()`) is client-generated and is the *entire* idempotency mechanism — `LockService` serializes the critical section, then `findLeadById()` checks for that exact value before writing. Moving to a sequential internal id means moving generation server-side, inside that same lock, which is a real design decision (how far to scan, whether to use a Script Property counter, what happens to a lock timeout mid-assignment) — not something to sketch in a documentation pass. `LEADS_HEADERS`' own comment forbids renaming columns or inserting mid-contract, which narrows the safe migration shape without picking it. Wrote this up in both `technicalDebt.md` (new item 24a) and `projectState.md` in enough detail that the next session can start designing immediately rather than re-deriving the constraints.

### Files touched

- `docs/sessionCloseout.md` — new, gitignored, never committed
- `.gitignore` — one rule added
- `docs/projectState.md`, `docs/technicalDebt.md` — this entry's findings, plus stale header/remote/sync corrections
- No site or Apps Script code touched this session

### Validation

Twelve suites green (`validateSite`, `validateNav`, `validateHeader`, `validateHero`, `validateLeadFlow`, `validateMegaMenus`, `validateProcessSequence`, `validateSeo`, `validateFloatingCta`, `validateEstimateCtas`, `heroLoopHarness`, `simulateEstimateFlow`), Apps Script harness 64/64, `node --check` clean. Run in full despite no code changing this session, because "nothing changed" is exactly the kind of claim the SOP says to verify rather than assume.

### Left for next session

The lead pipeline finalization — photo accessibility and the leadId/referenceId split — is the resume task, detailed in `projectState.md`. Confirm whether `config!notificationEmail` has been restored to Chase's address before treating the pipeline as production-safe.

---

## 2026-08-11 — ESTIMATE CTAs OPEN THE MODAL DIRECTLY  (supersedes the arrival-focus fix)

### Brief

The previous fix (scroll to the mini-form, focus its first field) did not solve the reported problem — real browser QA confirmed the page still scrolls and repositions. The actual requirement, stated plainly this time: every true estimate CTA should open the existing multi-step modal directly, starting at Step 1, with no anchor jump at all.

### What "open the modal directly" actually required

Audited `openEstimateModal()` and the modal's markup before touching anything, per instruction. Finding: **the modal's 5 steps never ask for Full Name, Phone, or Service Needed.** Step 1 is "Where's the property?" (address, acres). Step 3 is "How do we reach you?" (email, contact preference, best time). Those three fields exist in exactly one place — the hero mini-form (`#estimateForm`) — and `buildEstimatePayload()` read them straight from that form's DOM elements.

`appsScript/config.gs` hard-requires all three server-side (`REQUIRED_CREATE_FIELDS`). Traced `showSubmissionError()`'s field-mapping too: a server rejection on `fullName`/`phone`/`serviceNeeded` reveals the error on `#fullNameError`/`#phoneError`/`#serviceNeededError` — elements that live in the mini-form, not anywhere inside the modal. So the literal implementation of "open the modal directly, skip the mini-form" produced a specific, verifiable failure mode: a visitor completes all 5 steps, clicks Submit, and gets "please check the highlighted details" pointing at nothing they can see, every single time. No lead is created through any CTA that took this path.

That is a direct conflict between two things both explicitly required — "open the modal directly" and "preserve all existing modal validation/submission behavior" / "do not redesign anything." Rather than guess which one gives, surfaced the finding and three concrete resolutions (add the fields to the modal; keep the scroll-focus architecture; ship it broken as literally specified) and asked. The chosen path: add the three fields to the modal.

### What changed

Modal Step 1 gained three fields — same labels, same copy, same validators, same `serviceNeeded` enum order as the mini-form (verified against `appsScript/config.gs` programmatically before writing anything) — at new ids: `modalFullName`, `modalPhone`, `modalServiceNeeded`. The step heading, "Where's the property?", was left exactly as it reads today, per instruction not to touch copy — it now describes only two of the step's five fields. Recorded as a known, deliberate trade-off, not an oversight.

The mini-form is completely untouched: same three fields at their original ids, same `validateMiniForm()`, Continue is still a plain `type="submit"` button. It now calls one new function, `copyMiniFormIntoModal()`, immediately before `openEstimateModal()` — copying whatever was just typed into the modal's new fields, so "Continue... with the entered data" is literally true rather than asking twice.

Every `a[href="#estimateForm"]` — 131 of them, wired once in the shared script — now has a click handler that calls `preventDefault()` and `openEstimateModal()`. The mini-form's Continue button was never one of these anchors (it is a `<button>` inside the form, not an `<a>`), so it needed no change to stay excluded.

**The change that mattered most:** `buildEstimatePayload()`, `validateModalStep(1)`, `buildReviewSummary()`, and `showSubmissionError()` all had to be repointed at the modal's own fields. Leaving even one of them reading the mini-form's ids would have shipped a silent, hard-to-notice defect — the modal would look and behave correctly right up until the payload left the browser with a blank `fullName` or `phone` for anyone who used a direct CTA. This is exactly the failure class the whole investigation started by ruling out; the fix had to not reintroduce it through a missed reference.

`openEstimateModal()` itself was deliberately left alone. `currentModalStep` already starts at 1, so a first-time visitor lands on Step 1 regardless of which CTA opened it — the requirement is satisfied without touching the function. The existing "closing and reopening keeps every value and the current step" behavior (an intentional, documented feature — "nothing is ever re-entered") was preserved rather than force-reset, since resetting it on every CTA click would have discarded a visitor's in-progress fill the moment they clicked a second CTA by mistake.

### Validation had to prove behavior, not just presence

The static validator from the previous session (`validateEstimateCtas.js`) asserted the *opposite* of the new architecture — no `preventDefault`, focus the mini-form — and would have reported a green build on a completely broken implementation if left as-is. Rewrote it: mini-form untouched, modal Step 1 carries the three fields with the right enum order, no duplicate ids anywhere, the CTA listener calls `preventDefault()` + `openEstimateModal()`, and — the load-bearing checks — `buildEstimatePayload()` reads `fullName`/`phone`/`serviceNeeded` from the modal's ids and explicitly does *not* read them from the mini-form's.

Static checks confirm the right strings are in the right functions; they don't prove the code actually behaves correctly when run. Built `simulateEstimateFlow.js` to close that gap: it loads the real `js/indexJS.js` into a hand-built DOM mock (no new dependency — same `vm.runInContext` pattern `localTestRunner.js` and `validateProcessSequence.js` already use) and actually drives both real paths:

- **Direct CTA** — dispatch a click on a mocked header/hero/footer anchor, confirm `preventDefault` fired and the modal opened with the mini-form untouched, confirm Step 1 genuinely rejects an empty submission (not just that error markup exists), fill all five fields, submit, and inspect the captured (never sent) network payload.
- **Mini-form Continue** — fill the three mini-form fields, confirm `validateMiniForm()` passes, call the same handoff the real submit event triggers, confirm Step 1 arrives pre-filled with exactly those values and still correctly blocks on the two fields Continue can't know (address, acres), complete it, submit, and inspect that payload too.

25 functional assertions, all passing against the real script. Both this harness and the rewritten static validator were proven to have teeth the same way: reverted `buildEstimatePayload()`'s `fullName` read to the mini-form's id, confirmed each caught it independently with a precise failure message, then restored the file.

### Files touched

- `js/indexJS.js` — CTA listener, `copyMiniFormIntoModal()` (new), `validateModalStep(1)`, `buildEstimatePayload()`, `buildReviewSummary()`, `showSubmissionError()`
- **24 HTML pages** — three new fields in modal Step 1, by one guarded assembler that matched the existing Step 1 markup byte-for-byte on every page before writing

### Validation

12 suites green (the eleven standing plus the new `simulateEstimateFlow`), Apps Script harness 64/64 — unchanged, since nothing on the backend was touched — `node --check`, CSS brace balance.

### Left for a browser

The actual click-through: does Step 1 read reasonably with five fields under a heading that only names one of them? Does the modal feel like it opened *instead of* the page moving, with no visible scroll or flash of the old anchor behavior? Confirm close/reopen still resumes correctly, and that the mini-form's Continue path — now carrying data across into a modal step that was blank before — doesn't feel like a jump.

---

## 2026-08-11 — ESTIMATE CTA ARRIVAL FIX + NOTIFICATION CONFIG RESTORE

### Brief

Two items from real browser QA. First: clicking "Get My Free Estimate" "only moves/slides slightly and leaves me around the hero area" — trace the actual estimate flow and fix the underlying cause, not the symptom. Second: reconcile a discrepancy between a previous session's report (`DEFAULT_NOTIFICATION_EMAIL = 'Bluegridls@gmail.com'`) and what the repository currently showed (`admin@nulostudio.com`).

### There is no "estimateForm page" — and that's correct

Audited every anchor on all 24 pages whose label matched `estimate|quote` (227 anchors). Every single "Free Estimate" / "Get My Free Estimate" / "Request Your Free Estimate" / "Get an Estimate" CTA resolves to the bare fragment `#estimateForm` — never a cross-page href, never a path-prefixed one. `id="estimateForm"` exists exactly once on every page: a self-contained mini-form (name, phone, service) embedded on that same page, which on submit opens the five-step `#estimateModal` for the rest. Interior pages carry it in a `pageFormSection` near the bottom; the homepage carries it inside the hero itself.

**This means Issue 1, as originally framed — "make CTAs navigate there consistently using the correct relative path for each page depth" — describes a bug that does not exist.** There is nothing for page depth to get wrong: a same-page fragment needs no prefix at any depth, and none of the 227 anchors had one. The architecture is already exactly what a self-contained, no-orphan-pages site should look like.

### The real cause: the CTA and its target already share one screen

`.heroSection` is `min-height: 100svh` — the whole hero, including both grid columns, is designed to fit in one viewport. `.heroInner` is a two-column grid (`1.15fr 0.85fr`) holding `.heroContent` (kicker, headline, lede, the "Get My Free Estimate" button, then stats) beside `.estimateFormCard` (`align-self: end`, so its bottom pins to the bottom of that same row — landing it low, near where the CTA button and stats already sit).

On a typical desktop viewport, that means the click origin and the anchor target are **both already on screen at the same time**. The browser's anchor navigation is completely correct — it scrolls exactly as far as `scroll-padding-top` requires, which on the homepage is often a handful of pixels. Under `prefers-reduced-motion` (`scroll-behavior: auto` in that block, confirmed at `styleIndex.css:7602`) that handful of pixels happens as an instant jump with no animation at all. Either condition reads, correctly, as "nothing happened."

Interior pages don't have this problem — their mini form sits in a `pageFormSection` far down a long page, so the scroll is large and obvious. The symptom is specific to the homepage hero, which is also the first place anyone testing the site would click "Get My Free Estimate."

### The fix adds arrival, not distance

Rewriting the hero to force a bigger scroll would be a redesign of an intentional, already-approved layout, for a problem that isn't really about distance — it's that a correct, tiny scroll gives no confirmation that anything happened. So `js/indexJS.js` (single file, shared by all 24 pages, confirmed via script-tag audit at both `js/indexJS.js` and `../js/indexJS.js` depths) now wires every `a[href="#estimateForm"]` — 131 of them — to focus `#fullName` on click:

```js
estimateFormCtas.forEach(function (cta)
{
    cta.addEventListener('click', function ()
    {
        const firstField = document.getElementById('fullName');
        if (firstField) { firstField.focus({ preventScroll: true }); }
    });
});
```

No `preventDefault()` — the native anchor navigation, its scroll, and its history entry are completely untouched, so back-navigation behaves exactly as it always has. `preventScroll: true` on the `focus()` call stops the focus itself from triggering a second, competing scroll; the anchor's own navigation remains the only thing that moves the viewport. `#fullName` was confirmed to lead every mini form on every page, ahead of `#phone`, with the honeypot excluded from the tab order it precedes it in.

This resolves the actual complaint — arrival is now unmistakable, keyboard caret lands in the form, mobile keyboards open ready to type — without touching layout, without redesigning the hero, and without changing what the CTA has always correctly done.

### Issue 2: the discrepancy was real, and the test suite already knew

`appsScript/config.gs` currently read `DEFAULT_NOTIFICATION_EMAIL = 'admin@nulostudio.com'` in the working tree. `git log --all -p` on that file shows only one value was ever committed: `'Bluegridls@gmail.com'`, from the original commit. `git diff` confirmed the `admin@nulostudio.com` value was **uncommitted, working-tree-only drift** — not a change I or any prior recorded session made, and not reflected in any documentation (`googleSheetArchitecture.md`, `appsScript/README.md`, and the Sheet itself, per the user, all agree on `Bluegridls@gmail.com`).

`appsScript/localTestRunner.js` — the project's own committed test harness — already asserts `no recipient anywhere is admin@nulostudio.com` in its self-test. Running it against the corrupted file **failed exactly that check**: `owner email goes to Bluegridls@gmail.com  ->  to=admin@nulostudio.com`. Concrete, reproducible proof, not a guess. Since `notifications.gs` only reaches this constant when the Sheet's `config.notificationEmail` is blank or missing, the practical exposure was narrow but real — a blank config cell would have sent lead notifications to Nulo Studio, which `notifications.gs`'s own header comment says must never happen ("the studio must not sit in the customer's email thread").

Reverted the single line to the committed, documented value. `git diff` on the file is now empty — it matches `HEAD` exactly, so there is nothing new to commit for it; the fix is a cleanup of stray local drift, not a shipped change. Apps Script harness returns to 64/64.

**Important caveat, stated plainly:** the live Apps Script deployment is a manually pasted copy (`appsScript/README.md`: "this folder is not itself deployed"). This fix corrects the repository, which is the source of truth for the *next* deployment or copy-paste — it does not and cannot reach whatever is currently pasted into the Apps Script editor. Because the Sheet's `notificationEmail` value takes precedence whenever it is present, and the user confirmed it currently reads `Bluegridls@gmail.com`, normal live submissions are unaffected by whatever the live deployment's own fallback constant currently says. The fallback only matters if that Sheet cell goes blank.

### New validator

`validateEstimateCtas` (scratchpad, not committed — see `technicalDebt.md` item 10i) encodes what this investigation established, so none of it can silently regress: every page owns exactly one `#estimateForm` with `#fullName` leading it; every CTA resolves to the bare `#estimateForm` fragment at any depth; the shared script's click listener targets `#fullName`, passes `preventScroll: true`, and never calls `preventDefault`; the script tag resolves at the correct depth on all 24 pages; and the two facts the root-cause explanation depends on (`.heroSection { min-height: 100svh }`, `.estimateFormCard { align-self: end }`) are still true, so a future layout change doesn't leave this journal entry describing a hero that no longer exists. Verified the `preventDefault` and wrong-target guards by injecting each defect and confirming the validator caught it before restoring the file.

### Files touched

- `js/indexJS.js` — one selector, one listener block, 42 lines
- `appsScript/config.gs` — one line, reverted to match `HEAD`

### Validation

11 suites green (the ten standing suites plus the new `validateEstimateCtas`), Apps Script harness 64/64, `node --check`, CSS brace balance.

### Left for a browser

Click "Get My Free Estimate" on the homepage at a real desktop width and confirm the field visibly receives focus (a focus ring, or the caret blinking in "Full Name") even though the scroll is short. Then confirm the same on an interior page, where the scroll is large — focus should land the same way, just less noticeably needed. And confirm back-navigation after either still returns to the exact prior scroll position, unchanged from before this fix.

---

## 2026-08-11 — LOGO MIGRATION, COPY CLEANUP, ON-PAGE SEO SWEEP

### Brief

Three passes in one session: retire the old primary logo for one of two newer assets, strip the dashes that were making the copy read as machine-written, and audit every indexable page for search intent.

### The logo decision was made by measurement, not by looking

Two candidates. The one with the fuller lockup lost on a single number.

```
  circleBG_logo.png    290x290    alpha mean 0.785
  newBG_logo.png      1200x1200   alpha mean 1.000
```

**0.785 is π/4** — the alpha coverage of a circle inscribed in a square. `circleBG_logo.png` is a transparent circular badge with exactly the silhouette of the asset it replaces, which made it a drop-in. **1.000 means fully opaque**: `newBG_logo.png` has white corners and would render as a white box on the header. Its content also occupies only the middle band of a 1200px square, so at the header's 69px slot its tagline would land near 4px.

Rendered at the real header size, the old badge's arc text is an unreadable smear and the new mark is clean. That arc is also where the **FORESTRV** misspelling lives, so the migration retires a debt item that had been open since 2026-08-02 without anyone touching the artwork.

76 references, 24 pages, one 45KB file replacing 215KB + 57KB. Both marks are 1:1 and every rendered size is CSS-driven, so layout could not shift. `newBG_logo.png` is kept for Open Graph, GBP and print, where a white background and room for the tagline are exactly what it wants.

Favicons were checked and left alone: they are a **different mark entirely**, a simplified tree circle, not a small badge.

### 447 em dashes

That was the tell. Not the word choice — the punctuation. The site leaned on the em dash for asides, appositives, definitions, and dramatic pauses, several times per paragraph.

Surveying first was worth it. Of 447, only **213 were unique strings**, because the shared chrome repeats across 24 pages. That turned an intractable edit into 215 hand-written rules.

**Two things the survey got wrong before it got them right:**

- The first extractor split text nodes on newlines, so a sentence that wrapped across three source lines arrived as three fragments and half the rules matched nothing. Rewritten to normalise whole text nodes and re-wrap them at their original indentation afterwards.
- My first `MAINTENANCE`-style measurement mistake repeated in a new form: an unanchored `href="..."` match read `data-confighref="phoneHref"` as a link and reported nine broken files.

**The structured data was the real trap.** The copy pass protected every `<script>` block, which is correct for JavaScript and wrong for `application/ld+json` — the FAQ answers and service descriptions live there too. Protecting them left schema disagreeing with the visible copy, and Google requires FAQPage answers to match the rendered text. 61 further replacements, every block re-parsed and its key set compared before writing.

Kept deliberately: compound words, numeric ranges, and one en dash in `1–2 day`. It is the only dash left in prose on the site.

Also found while reading every sentence: **British spellings mixed with American ones**, sometimes in neighbouring paragraphs, on an Ohio/Kentucky local business site.

### The site was already good at SEO, and failing its own rule

The audit found 24 of 24 pages with exactly one non-empty H1, no skipped heading levels, unique titles and descriptions, descriptive anchor text, and zero intent collisions. The location pages in particular are strong: exact-match H1s over genuinely local content.

What it also found: the **service pages were breaking the site's own Content Guideline 2** — "Every H2 is a real search intent. If it isn't searchable, it's a design element, not an H2." Their H2s were `Marked, Cleared, Walked`, `Thickets Back to Clean Ground`, `Precise Where It Has to Be`. Good writing sitting exactly where a topic needed to be.

The fix was available because of how the pages are already built: **every section carries a `.sectionKicker` above its heading** ("How It Runs", "Real Jobs", "Straight Answers"). The voice lives there. So the topic could move into the H2 without flattening anything. 36 headings rewritten, each page's set covering distinct subtopics rather than the repetitive "X Services / Best X Services" pattern that a keyword pass produces.

### The homepage H1 was broken in a way only a crawler would see

```html
<span class="heroHeadlineFixed">Take Back</span>
<span class="heroTypedWrap"> ...animated, aria-hidden... </span>
<span class="visuallyHidden">Take back your property.</span>
```

Rendered: "Take Back" plus a typed phrase. Crawled: **"Take Back Take back your property."** Duplicated, and carrying no service and no geography on the most important page of the site.

**The first fix was wrong.** I added `aria-hidden="true"` to the fixed span, which cleaned the accessibility tree and changed nothing about indexing — `aria-hidden` is not `display: none`. Reverted. The correct fix was to make the hidden fallback *complete* the visible phrase instead of repeating it:

```
Take Back your property. Forestry mulching and land clearing in
Southern Ohio and Eastern Kentucky.
```

Which is now what both a screen reader and a crawler get, and it matches what a sighted visitor sees.

### Three FAQ schema mismatches, all pre-existing

`validateSeo` compares every `FAQPage` question against the rendered text. Three did not match, on three different service pages. In all three the schema carried the longer, better-targeted phrasing and the page carried a shortened version, so the **rendered question moved to match the schema** rather than the reverse. That fixes a guidelines violation and improves the heading at the same time.

### The floating CTA was cropped by 1.44px, and the cause was arithmetic

Reported as the sticky Call Now / Free Estimate bar being cut off along its bottom edge on mobile, with the rounded corners not rendering cleanly.

Everything that usually causes this was already right. The bar is `position: fixed` directly on `<body>`, so `overflow-x: hidden` on `html`/`body` cannot reach it and there is no transformed ancestor. The insets already read `bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px))` and `left`/`right: max(1rem, env(safe-area-inset-*, 0px))`, which is both safe-area aware and incapable of causing horizontal overflow.

The bug was in the box:

```
  <=640px   height 60px - padding 13.44 - border 2 = 44.56px content
            buttons 46px  ->  1.44px too tall
  <=360px   height 58px - padding 13.44 - border 2 = 42.56px content
            buttons 44px  ->  1.44px too tall
```

`box-sizing: border-box` is global, so the declared height is the outer box and the buttons had less room than the number suggested. `align-items: center` split the surplus, putting each button **0.72px past the top and bottom**. Nothing clips the bar, so the buttons simply painted over its 1px border — and being 999px pills on a 24px-radius container, at the bottom corners their edge crossed the border on a different curve. Hence "cropped by a few pixels".

The fix is to delete the fixed heights. The bar then measures its buttons plus its own padding and border, which is 61.44px and 59.44px: 1.44px taller than before, invisible, and structurally unable to disagree with itself again. Radius, shadow, colours and the scroll trigger are untouched.

Worth noting what was *not* done: adding a pixel or two of bottom offset would have moved the bar down and left the buttons still crossing the border. The symptom would have looked fixed at one size.

`validateFloatingCta` encodes the rule rather than the number: it fails if the bar declares a height at all, and if one is ever reintroduced it recomputes the content box and fails when the buttons do not fit. It also checks the 44px touch-target minimum, the safe-area insets, and that the bar sits outside `<main>` and `<footer>` on all 24 pages. Verified by reintroducing `height: 60px` and watching it report the 1.44px overflow, then reverting.

### Files touched

- `graphics/logos/web/bluegridMark290.png` — new, plus the two client source assets committed
- **24 HTML pages** — logo references, 440 copy rewrites, 61 schema rewrites, 36 H2s, 4 H1s, 4 metadata fixes, 3 editorial links
- `docs/seoPlan.md` — the intent map
- `docs/` — the other three

### Validation

Eleven suites green, plus `node --check` and CSS brace balance. **New: `validateFloatingCta`** (box model, touch targets, safe areas, clipping ancestors) and **`validateSeo`** — one H1 per page, heading hierarchy, title and description uniqueness and budget, canonicals, breadcrumbs, per-page-kind schema, FAQ schema matching rendered questions, alt coverage, anchor text quality, content-level inbound links (chrome links do not count), and H1 intent collision.

### Left for a browser

The new header mark at every breakpoint, and the footer badge at 120px where a 290px source is doing the most work. Whether the rewritten H2s still read like the same site — that is a judgement about voice, and 36 of them changed. And the floating CTA bar on a real handset with a home indicator, where `env(safe-area-inset-bottom)` finally has a non-zero value to contribute.

---

## 2026-08-09 — OUR COMPANY MEGA MENU, COMPANY PAGE, TWO-PHASE PROCESS ANIMATION

### Brief

Two objectives. Add an **Our Company** primary nav item built on the existing shared mega-menu system rather than a fourth dropdown architecture; and refine the process animation into a one-time step reveal followed by a permanent arrow-only loop, fixing the responsive clipping reported from browser QA along the way.

### The header could not absorb a fifth item where it stood

Measured from the real Inter/Rokkitt files, as every header decision on this project has been. `Our Company` costs **144px including its gap**, taking the compact header from 988px to **1131px** and the full-spacing header from 1080px to **1236px**.

At the shipped 1150px switch that left **+20px** on Inter and **−22px** on the wider `'Segoe UI'` fallback — the bar would have wrapped on first paint for anyone whose cache was cold, which is the exact failure the breakpoint's ~45px design margin exists to prevent. The switch moved to **1200px**: +70px on Inter, +11px on the fallback. 1176px was the arithmetic minimum and left 4px, which is not a margin.

**The more interesting finding was above the fold, not below it.** With five items the *full-spacing* band became the tightest point on the entire sweep: at 1281px the bar cleared by only 45px, so the widest band was the one under most pressure — the wrong shape for a responsive header. The compact band therefore moved from 1280px to **1360px**, which is `.headerInner`'s own `max-width`, and that is the whole argument for the number. Above 1360px the inner is capped, so available width never changes and full spacing always clears by 124px; below it every pixel of viewport is a pixel of header, which is exactly where compact tokens belong. Crossing 1360px downward still makes the bar roomier (+124px → +229px).

No typography, phone chip, CTA padding or spacing token was touched to make any of this fit.

### Our Company, on the existing system

Four panels now, one architecture. The new panel is `class="megaPanel" id="companyMegaPanel"`, opened by a `.megaFeature`, with six rows in two labelled `.megaGroup`s, every row on `.megaRow`.

**Zero JavaScript.** `indexJS.js` drives `.navItem.hasMegaMenu` generically, so the hover bridge, keyboard handling, `aria-expanded` toggling, outside-click and Escape all applied to the fourth panel the moment it existed.

**Zero new CSS rules.** The company rows are the same icon-plus-text shape the services rows use, so rather than copying declarations the company classes **joined the existing selector groups** — `.megaServicesList, .megaCompanyList`, `.megaServiceLink, .megaCompanyLink`, and so on down to the reduced-motion block. One declaration, two names: the two panels cannot drift apart, and nothing renders differently. The two-column group grid joined `.megaAreasGroups`, which was already exactly that.

Panel content points at whoever owns the answer, which is the rule the FAQ panel already follows: *About BlueGrid* and the featured card go to the new company page; *Why Choose BlueGrid*, *Our Work*, *How It Works* and *Areas We Serve* go to the homepage sections that already hold that material; *Questions & Answers* goes to the FAQ hub.

Measured against its siblings: **414px** tall against services and areas at 392px and FAQ at 486px, so the family spread stays at 24% against a 45% gate.

### A company page, because the alternative was a table of contents

Six rows pointing at five homepage anchors would have made the menu a homepage index — and would have thrown a visitor reading a service page back to the homepage for every one of them. The site also had **no About page of any kind**, which for an owner-operated local business is a real gap rather than a stylistic one.

`company/index.html` is the 24th page. Built from `faq/index.html` as the donor because it sits at the same depth, so every relative path in the shared chrome is already correct and was carried across **byte for byte** — the assembler asserts that, comparing the chrome outside the head and `<main>` against the donor and refusing to write on any difference. 865 words, and **it needed no new CSS**: `pageHero`, `breadcrumbNav`, `intentSection`, `benefitGrid`, `localServiceList`, `localFactGrid`, `relatedGrid` and `pageFormSection` already covered every section.

Schema is `AboutPage` plus a breadcrumb. **Deliberately no second `LocalBusiness`** — the homepage carries the canonical one, and repeating it here would have two URLs competing to *be* the business rather than one describing it.

**Every factual claim on the page already appears somewhere on the site.** Owner-operated and locally based, fully insured with a certificate before work starts, the New Holland C337 with a Fecon head, estimates within 24 hours, one-to-two-day typical projects, 200+ acres reclaimed, mulch stays on site. Nothing about history, years in business, crew size, certifications or awards was written, and the owner is still not named.

### The process animation is a state machine now, not a loop that pauses

The old sequencer completed, held 2.6s, called `resetBoard()`, and told the whole story again. The requirement is not a slower loop — it is that the steps are told **once** and then stop being animated at all.

```
'idle'  ->  'revealing'  ->  'looping'
```

Those states only move forward. There is no transition back to `'idle'`, which is what makes "Phase A runs once" a property of the machine rather than of its timing. `resetBoard()` is gone entirely, and the assembler guards that it did not survive.

- **Phase A** — the reveal, 6.08s at five steps. A travelling flash: each arrow brightens, dims, and only then does the next step land, revealed from *inside* its arrow's dim callback.
- **Phase B** — arrows only, 3.56s per pass, and **cumulative**: arrow 1 lights and stays lit, then 1+2, then 1+2+3, then all four; a 1400ms hold with the row full; all four clear on a single tick; 900ms of dark; repeat. It cannot touch a step because it never references one.

The two phases deliberately **do not share a beat function**. `flashArrow()` dims an arrow before moving on, which is right for the reveal and wrong for the loop — the whole point of the loop is that nothing dims until the row is full. `lightArrow()` is its own beat, and the peak of four lit arrows is what proves the difference: if any arrow dimmed on the way across, the row could never reach four.

**One defect this refactor created and the design caught before it shipped.** `.processArrow.isActive` and `.isResting` carry equal specificity, so an arrow holding both renders as whichever is declared later — `isResting`, meaning it never appears to light. Phase A never hit this because it flashed each arrow exactly once, from nothing. Phase B lights arrows that are **already resting**, so the entire loop would have been invisible. Both `flashArrow()` and `lightArrow()` remove one class before adding the other and are the only two places that touch them; the JS, the CSS and the validator all say so.

**A smaller one, found by the validator rather than by reading.** The first cut of `lightArrow()` lit the last arrow and then scheduled one more step before handing to the hold, so the hold a visitor would actually see was `loopStepMs + loopHoldMs` — 1520ms against a config that said 1100. The recursion now ends when the last arrow lights. The config value is the hold.

Phase A is deliberately **uninterruptible** once started: it is seven seconds, it happens once, and stopping it half way would mean either losing the steps already up or replaying them. Only the endless phase answers to visibility — Phase B pauses off screen and on a hidden tab, and resumes without disturbing a single step.

### The reported clipping did not reproduce — and the number that explained it was wrong

The handoff located a pressure point: **"MAINTENANCE" at 143px against a 147px step column at 1081px.** Re-measuring reproduced the 143px exactly, and then found the pairing was wrong. "MAINTENANCE" is on `services/brushRemoval.html`, a **four**-step board, whose column at 1081px is **197px**, not 147px. It has 54px of clearance. The widest word on the five-step homepage board is "COMPLETE" at 104px against 147px.

Checked properly — every rendered title on all eight boards, uppercased as `text-transform` actually renders them, against its own board's column, at every width from 1081px to 1440px, with a 6% fallback-face inflation — **nothing overflows anywhere.** (My first pass measured the markup text rather than the uppercase render and understated every title; that is how a defect like this hides.)

The box model agrees: `.processStep` is `flex: 1 1 0` with `min-width: 0`, `box-sizing: border-box` is global, and there is no `100vw` anywhere in the process chain. **The board provably cannot overflow its container at any width in the band.**

So the fix is not a patch for a mechanism I cannot find. It is that **the horizontal row should never run compressed in the first place.** The board is `max-width: 1120px` inside `.sectionInner`'s 1.5rem padding, so **1120 + 48 = 1168px** is the narrowest viewport at which it can render at the width it was designed for. Below that it was being squeezed — 147px columns against a design value of 164px — and a squeezed five-across row is what browser QA was looking at.

The handover moved from 1080px to **1167px**, and out of the shared 1080px query into its own, because 1080px also drives the hero, the services grid and several section layouts that had no reason to move with it. The vertical layout itself is unchanged. `.processStepTitle` also gained `overflow-wrap: break-word` — a guard for the next title someone writes, not a fix for a current overflow, and recorded as such.

### Line endings: the documented split was stale

`projectState.md` said `index.html`, `js/indexJS.js` and `css/styleIndex.css` were CRLF while `faq/*`, `locations/*`, `insights/*` and `css/stylePages.css` were LF, and that scripted edits must detect per file.

Audited: **all 26 source files are CRLF in the working tree and LF in the index.** `core.autocrlf` is `true`, so Git normalises on commit and converts on checkout — there is no mixture to preserve. The detect-and-restore habit stays in every script here because it is free and correct, but the table was describing something that is not true.

### Two defects in my own tooling

- **The chrome-comparison guard read `data-confighref="phoneHref"` as a link.** An unanchored `href="..."` match caught the tail of the config attribute and reported nine broken links to files named `phoneHref` and `facebookUrl`. Anchored on whitespace.
- **A CSS anchor matched twice.** `.megaServiceIcon\n{` appears both as its own rule and as the tail of `.megaServiceLink:focus-visible .megaServiceIcon\n{`. The guard refused to write rather than editing the wrong one.

### Files touched

- `js/indexJS.js` — the whole `PROCESS SEQUENCE` section rewritten: `processSequenceConfig`, `initializeProcessSequences()`, `setupProcessBoard()`
- `css/styleIndex.css` — header breakpoints 1280→1360 and 1150→1200; a new 1167px process query with the vertical rules moved out of the 1080px query; company classes joined seven services selector groups; `overflow-wrap` on the step title; the arrow-state exclusivity note
- **24 HTML pages** — the Our Company nav item and panel, the mobile drawer link, and the footer Quick Links entry, by one guarded assembler
- `company/index.html` — new
- `docs/` — all three

### Validation

Nine suites, all green: `validateSite` (24 pages, 2,696 links), `validateNav`, `validateHeader`, `validateHero`, `validateLeadFlow`, `validateMegaMenus`, `validateProcessSequence`, `heroLoopHarness` (91 cycles), the Apps Script harness (64/64), plus `node --check` and CSS brace balance.

`validateProcessSequence` was rebuilt against the two-phase model and is **stricter than what it replaced**: the old suite proved a loop closed, the new one proves the loop cannot reach the steps. Over two minutes of virtual time with the board entering and leaving the viewport repeatedly it asserts five reveals and no repeats, **zero un-reveals ever**, and zero step events after the reveal.

Phase B is checked by **replaying the timeline into discrete passes** rather than sampling it. A pass opens when the first arrow lights on an empty row and closes when the row clears, and each of the 25 observed passes has to fill in the order 1, 1+2, 1+2+3, 1+2+3+4, **peak at exactly four**, hold at least 500ms, and clear every arrow on a single tick. The peak is the load-bearing assertion: if any arrow dimmed on the way across, four could never be lit at once, so a travelling flash cannot pass a cumulative test. The old "never more than one arrow bright" check was not deleted — it was narrowed to Phase A, where it is still true.

The VM harness underneath was kept verbatim through both rewrites.

`validateHeader` gained a **fallback-face sweep** — the criterion the new breakpoint was chosen on now has a test — and `measureHeader` now **reads the primary nav out of `index.html`** instead of carrying its own copy, which is what let the model describe a four-item bar while the site shipped five.

### Left for a browser

The Our Company panel next to its three siblings, and the shield-with-a-check featured icon, which was drawn blind like the pin and the question mark before it. The company page top to bottom. And the process section at 1168px and just below it, where the horizontal row now hands over to the vertical one — that boundary is the thing this session changed and cannot see.

The cumulative sweep also needs an eye on it. The simulation proves the row fills in order and empties as one gesture; it says nothing about whether four lit arrows at once reads as the progression completing or just as four bright arrows, or whether 3.56s per pass is a pulse or a fidget. Those are the two constants most likely to want a tuning pass: `loopStepMs` and `loopHoldMs`.

---

## 2026-08-07 — MERGE TO MAIN, PUSH, REPOSITORY HOUSEKEEPING, SESSION CLOSEOUT

### Merge

`phase2a-lead-capture` → `main`. Verified before touching anything: `main` was an exact ancestor of the feature branch, so the merge was a **fast-forward** and no conflict was possible. `main` was already identical to `origin/main` (0 ahead / 0 behind), so nothing needed pulling and no history was rewritten. The feature branch was 8 ahead of its own remote and 0 behind — the amends made earlier in the session were all on unpushed commits, so no published history had been rewritten either.

`git merge --ff-only` was used deliberately: it refuses to do anything except a fast-forward, so it cannot silently produce a merge commit or a conflict.

```
8108f94..bc4021d   17 commits   42 files   52,050 insertions   0 deletions
```

The only rename is the Phase 2C `hero_after.JPG → after.JPG` casing fix. Confirmed with `--diff-filter=D` that the merge deleted nothing.

Full validation re-run **on `main` after the merge** — 12/12 — before pushing. Then `main → origin/main` only; no feature branches, no force, and `phase2a-lead-capture` was not deleted.

### The remote has moved

The push succeeded but GitHub answered:

```
remote: This repository moved. Please use the new location:
remote:   https://github.com/ArxnAlley/client_BluegridLandSolutions.git
```

`origin` still points at the old URL and pushes work **via redirect only** — which stops working if anyone ever creates a new repository under the old name. Updating it was requested, then superseded by the housekeeping task before it ran. Still outstanding; recorded under *Waiting on Aron*.

### Repository housekeeping — the GBP asset decision

Two related decisions, both the owner's:

**`graphics/images/GBP_ForestryMulchingService.png` deleted.** Verified it had genuinely been tracked (`git ls-files --error-unmatch`), and found it entered the repository in `235a4a3` — swept in by a broad `git add -A` in the mega-menu commit rather than added deliberately. That is worth recording as a lesson: `add -A` put 2.6MB into the repository for a file the site never loaded. Verified zero references to it across the whole working tree and at `HEAD` before staging the deletion.

**`graphics/GBP - Services/` is intentionally local and now ignored.** It holds Google Business Profile marketing collateral, not website assets. Added the repository's **first** `.gitignore` — a no-build static site has no dependency or artifact directories to exclude, so the file carries exactly one rule and a comment explaining why. Deliberately no speculative boilerplate (`node_modules`, `dist`, …): nothing here produces any of it.

Verified after: `git check-ignore` traces the file to `.gitignore:18`, `git ls-files` returns nothing for the folder, and the folder and its contents are untouched on disk.

Commit `9237e53`, pushed.

### Closeout

All three project docs rewritten against the repository rather than carried forward. `projectState.md` in particular had gone stale in a way that would have actively misled a cold session — it still read *"Branch: phase2a-lead-capture — not merged, nothing pushed"* after the merge and push had happened.

Two pieces of next-session work were specified and recorded as **planned, not implemented**: an *Our Company* mega menu, and a two-phase refactor of the process animation. Both were measured or located at closeout so the next session starts with numbers rather than a survey:

- **Header capacity for a fifth nav item.** Measured from the real font metrics: `Our Company` adds **149px** (156px with its gap). The compact header goes 988px → **1131px**. At the current 1150px switch that leaves **+20px** — it fits, but the breakpoint was tuned to hold ~45px so the wider `'Segoe UI'` fallback could not wrap the bar before Inter loads. Recorded the expectation that the switch will need to move to roughly 1200px.
- **Process clipping report.** Located the suspect band (**1081–1280px**, where the horizontal layout applies) and the mechanism (`html { overflow-x: hidden }` clips rather than scrolls, which matches "disappears offscreen" instead of producing a scrollbar). Measured the pressure point: the longest unbreakable uppercase title word is **"MAINTENANCE" at 143px** against a **147px** text column at 1081px — 4px of clearance, with a wider fallback face behind it.

  **Recorded honestly that the arithmetic does not reproduce the reported defect.** By calculation the board fits at every width in the band, so the model is missing something real. The handoff says to reproduce it in a browser before changing layout, rather than letting the next session act on either my numbers or the report alone.

---

## 2026-08-07 — MEGA MENU DESIGN SYSTEM: SERVICE AREAS + FAQ

### Brief

The redesigned Services panel is the benchmark. Bring Service Areas and FAQ onto the same shell and design language without making the three identical — each keeps an internal architecture suited to its content.

### What was actually shared before, and what wasn't

Studying the three panels first was the point of the brief, and it paid: the shell was **almost** shared already, and the exceptions were the whole problem.

| | Services | Service Areas | FAQ |
|---|---|---|---|
| Width | 760px | `min-width: 420px` only | 760px |
| Top-edge highlight | yes | no | no |
| Featured panel | yes | none | none |
| Row treatment | `.megaServiceLink` + accent rule | bare `a` in a list | `.megaFaqLink`, no accent |
| CTA | inside the feature | none | separate footer |
| Heading | `.megaGroupHeading`, muted | `.megaAreasHeading`, sky display face | `.megaPanelHeading`, sky |

Three panels, three heading treatments, three row treatments, two CTA patterns, and Service Areas at roughly half the width of its siblings. That is what "separate/older components" was describing.

### The system

Extracted, each declared once and asserted to be declared once:

- **`.megaPanel`** now carries the width, padding, radius, surface, border, shadow **and** the top-edge highlight. The per-panel `.megaPanelServices` / `.megaPanelFaq` / `.megaPanelAreas` modifiers are retired — the panels are `class="megaPanel"` with unique `id`s, which is what `aria-controls` already used.
- **`.megaFeature`** — the featured card, unchanged from Services, now opening all three panels. Icon, eyebrow, display-face title, supporting line, cue with a sliding arrow. Zero new CSS; the Areas and FAQ cards are the same component with different content.
- **`.megaBody`** — the region under the feature: the divider and the rhythm, once.
- **`.megaRow`** — the row primitive. Padding, radius, hover tint, and the sky rule that grows down the leading edge. A service row adds an icon column; a town row adds a colour; an FAQ row adds question/answer type. The accent rule was previously Services-only, so hovering a town or a question now behaves like hovering a service.
- **`.megaGroup`** / **`.megaGroupHeading`** / **`.megaGroupIcon`** — one labelled-group treatment. Areas headings dropped the sky display face for the shared muted label.

Nine `--mega*` tokens from the previous session already carried surface, shadow, edge, rule, radius, tint, label and copy colours; nothing new was needed.

### Positioning: the panels stopped moving

The brief listed "inconsistent horizontal positioning" and "menus jumping around unnecessarily" as things to avoid. Panels were absolutely positioned against `.navItem`, so each opened centred on its own toggle and moving along the nav slid a different rectangle into place each time.

`position: relative` moved from `.navItem` to `.primaryNav`. All three panels now resolve against the nav and land on **exactly the same rectangle** — moving between Services, Service Areas and FAQ swaps the contents of one panel rather than shuffling three.

It also bought a lot of clearance. Centred per item, the Services panel sat **62px** from the left edge at 1151px; centred on the nav it sits at **214px**, and the worst margin at any tested width is 177px.

`.navItem` keeps its hover/open behaviour and stays the panel's DOM parent, which is all `indexJS.js` needs — it only ever queries `.navItem.hasMegaMenu`.

### A hover defect found on the way

The 14px gap between toggle and panel is not over the nav item, so crossing it fired `mouseleave` and closed the menu before the pointer arrived — the panel then reopened on `mouseenter`, a flicker on every single use. Pre-existing, and invisible in the source. Fixed with a transparent `::before` band on `.megaPanel` that bridges the gap and belongs to the item; it inherits `visibility: hidden` so it only exists while the panel is open.

### Service Areas

Featured card: *Where We Work* / **Southern Ohio & Eastern Kentucky**, with copy adapted from the site's own answer to "What areas do you serve?" rather than the generic line in the brief, and a **View All Service Areas** cue pointing at the existing `#serviceAreas` block.

Below it, two regions side by side. Each region's towns flow down a **two-column multi-column list** rather than a single-column stack: seven and six towns become four rows instead of seven, which is what keeps this panel the same height as Services. Multi-column rather than grid on purpose — columns balance an odd count themselves while still reading top-to-bottom, which a row-flowed grid does not.

A pin sits on each **region heading**, not on all thirteen towns. All 13 links preserved exactly.

### FAQ

Featured card: *Common Questions* / **Questions We Get Every Week** — the panel's own former heading, promoted, rather than the brief's suggested line — and **View All FAQs**. The separate footer CTA is gone, which is where a chunk of the height went.

Nine previews became **six**, the highest purchase-intent questions, exactly as listed in the brief. The three dropped ("Do you haul the debris away?", "What do you need from me first?", "What areas do you serve?") are informational rather than decision-making and all remain on the FAQ page.

Answers were cut to **one sentence** — the real opening sentence of the real answer, not a rewrite. With two-sentence previews the panel measured **34% taller** than the other two; the brief asked that FAQ not be dramatically taller than everything else, and this is where that height was.

### Measured balance

Heights are estimated from the real font metrics and the shipped CSS values:

```
  services   392px
  areas      392px
  faq        486px      spread 24%   (gate 45%)
```

Services and Areas land on the same height by construction. FAQ carries more words per row and stays 24% taller, which the brief allows explicitly — "they do not need mathematically identical dimensions if their content requires otherwise".

### Path handling simplified

The Services panel had been the site's one exception to the two-variant path rule, linking to bare siblings from inside `services/` while the FAQ panel on the same pages used `../services/…`. Both resolve to the same file; only one is worth remembering. The exception is retired — every panel now uses root-canonical hrefs rewritten with `../` for one-level pages, and `projectState.md`'s architecture note is back to two variants.

The rebuild's guard compares **resolved targets** rather than href strings, so re-spelling a path is allowed while inventing a destination is not. That is stricter than the string comparison it replaced: it would catch a typo that still looked plausible.

### Three defects in my own tooling

- **`validateNav` located the FAQ panel by the retired modifier class** and asserted 8–10 questions. Model and assertions updated to six; the genuinely useful check it feeds — that every `faq/index.html#anchor` the menu points at exists — was kept.
- **The class-coverage check matched by substring**, so `.megaGroup` passed on the strength of `.megaGroups` — exactly the typo the check exists to catch. Now word-boundary matched.
- **The "declared once" check was line-ending blind.** It matched a selector followed by `\n` against a CRLF stylesheet and found zero of everything, reporting all four shared rules as missing.

### Files touched

- `css/styleIndex.css` — shared shell, `.megaBody`, `.megaRow`, `.megaGroup`, `.megaGroupIcon`, Areas rebuilt, FAQ trimmed, positioning moved, reduced-motion coverage for the whole mega system
- **23 HTML pages** — all three panels, rebuilt by one guarded assembler
- `docs/` — all three

### Validation

New `validateMegaMenus` replaces `validateServicesMega` and covers the family: shared shell on all three, featured architecture complete, every row built on `.megaRow`, links resolving to real files with the right relative form for each page depth, no duplicate ids, toggles still wired via `aria-controls` and shipping collapsed, decorative SVGs out of the accessibility tree, retired classes gone from both stylesheet and markup, on-screen fit 1151–1600px, and the height spread gated at 45%.

All seven other suites pass, plus `node --check` and CSS brace balance.

### Left for a browser

The look. Panel proportions against each other, the two new featured icons (a pin and a question mark, both filled and both drawn blind), whether the muted region headings read as deliberate rather than washed out, and the hover-bridge fix.

---

## 2026-08-07 — PROCESS SECTION: SEQUENTIAL STEP REVEAL

### Brief

Turn the "how it works" process block into a sequence that walks the visitor through it — step reveals, arrow flashes, arrow dims, next step — looping while on screen. One reusable architecture across every page that has a process block, not seven copies.

### The brief described a section that did not exist

The request described the change as animation-only, on top of an established visual: a centred free-floating dark rectangle, arrowheads between steps, no connecting lines, CTA below. **None of that was in the repository.** What shipped was a white section with a horizontal gradient rule (`.processTrack`), numbered discs, and no arrowheads or container. Nothing in git had the described version — no branch, no stash, no commit — and no other client site under `ClientSites/` matched either.

So this entry covers both: the visual the brief assumed, and the sequencing it asked for.

### Two facts that shaped the architecture

**Step counts differ.** The homepage runs five steps; all seven service pages run four. The brief was written for five. Nothing in the CSS or the JS assumes a count — arrows are simply however many sit between the steps, and the validator exercises both a five-step and a four-step board.

**The old grid was hardcoded to five columns** (`repeat(5, 1fr)`) while seven of the eight pages had four steps, so those pages had been rendering with an empty fifth column. Replaced with flex, which also removes the need for a template that would have had to change per page.

### Layout

A `.processBoard` — dark gradient rectangle, `max-width: 1120px`, centred, floating on the white section, with the heading above it and the CTA below. Step type inverted for the dark surface. `.processSteps` became flex: steps `flex: 1 1 0`, arrows `flex: 0 0 auto`, interleaved in DOM order so reading order and animation order are the same list.

Arrows are chevrons only — no shaft, no connecting rule — nudged down `1.05rem` so they sit on the centre line of the numbered discs rather than floating above the copy.

### Responsive

Vertical from 1080px down, with the arrows rotated to point at the next step.

The old design switched to a **two-up grid** at that width, which cannot work with directional arrows: the arrow ending a row points right, into the edge of the board, rather than at the step that follows. The breakpoint itself did not move — 1080px is where this design already gave up on the horizontal row — only what it switches to.

The rotation is a custom property, `--processArrowTurn`, composed into every state's transform rather than restated per state. That was not tidiness: the reduced-motion block sits *later* in the stylesheet than the 1080px block, so a bare `transform: none` there would have straightened every arrow in the vertical layout. One token, and the reset cannot reach it.

### Sequencing

`initializeProcessSequences()` drives any element carrying `data-processsequence`. Per board: read the steps and arrows once, then a small state machine with a single pending timer.

The arrow is movement *into* the next step, so the next step is revealed from **inside** the arrow's dim callback rather than alongside it. It is structurally impossible for a step to appear before its preceding arrow has finished.

```
  step reveal        480ms
  pause after step   380ms
  arrow flash        420ms
  arrow dim          240ms
  completed hold    2600ms
  reset fade + gap   640ms
                          -> 10.18s per cycle at five steps, 8.7s at four
```

`setTimeout` here, deliberately, where the hero typing needed `requestAnimationFrame`. The distinction is what the timer is for: the hero committed a DOM write that had to land inside a specific frame, twelve times a second. This schedules roughly a dozen class toggles per ten-second cycle and lets CSS animate between them. Sub-frame precision would buy nothing.

### Viewport behaviour

`IntersectionObserver` with **asymmetric** enter and exit conditions. Entering needs a meaningful arrival — 40% ratio, or the board's top past the middle of the screen. Leaving needs the board to go completely off screen.

A single predicate for both would put start and stop on the same boundary, and a visitor parked there would restart the story on every scroll tremor. The positional fallback exists because a board taller than the viewport — the vertical mobile layout — can never reach a 40% ratio at all; the extra thresholds give that check callbacks to run in as a tall board scrolls up.

Leaving resets and clears the timer; returning replays from step one, because half a story is worse than none. A hidden tab pauses the same way — timers would otherwise spend the sequence where nobody is watching.

### Performance

The only DOM work is a class toggle on one element per beat. Nothing is created, removed, measured, or re-written; every property those classes touch is `opacity`, `transform`, or `filter`. Steps and arrows hold their space from the first paint — this is an opacity reveal, never `display`, so the board cannot resize as the story plays.

The hero typing profile was re-run afterwards and is unchanged to three decimal places: 10.015ms cadence jitter, 80.625ms mean, 0 characters swallowed, 0ms write-to-paint.

### Two defects found and fixed mid-implementation

- **Both assemblers were double-indenting.** They sliced from the opening tag, which left that line's existing indentation in the file and then added their own on top, so every generated block opened 16–20 spaces deeper than its own children. Present in the services mega panel committed the day before, too. Fixed in both by consuming the line's indentation as part of the replaced range, and the mega panel was regenerated.
- **The validator's own CSS block bound was wrong.** It sliced from the section banner to `indexOf('PARALLAX')` — a marker that exists in the JavaScript, not the stylesheet. `indexOf` returned −1, `slice(start, -1)` ran to end of file, and the check reported a `display:none` and a `height` transition it had no business looking at. Now bounded by the next banner, with an assertion on the block's own length.

### Files touched

- `js/indexJS.js` — `processSequenceConfig`, `initializeProcessSequences()`, `setupProcessBoard()`
- `css/styleIndex.css` — `.processBoard`, flex `.processSteps`, `.processArrow` and its three states, `.processCta`, inverted step type, the vertical layout, reduced-motion finished state; removed `.processTrack` and the orphaned `drawLine` primitive that existed only to animate it
- **8 HTML pages** — `index.html` and all 7 service pages, rebuilt by a guarded assembler that carries step content across untouched

### Validation

New `validateProcessSequence` runs the real `indexJS.js` in a VM with a virtual clock, drives the observer by hand, and asserts against a recording of every class change: 13 beats in exact order, never more than one arrow bright, no step hidden mid-cycle, reset clearing the board in one tick, the loop restarting, zero class changes while off screen or with the tab hidden, and reduced motion registering no observer and no timers at all. The four-step board is checked separately.

All eight prior suites still pass.

### Left for a browser

Everything about how it *looks*: the dark board on the white section, the flash brightness, whether 10.18s reads as deliberate or slow, and the vertical layout below 1080px.

---

## 2026-08-06 — LAUNCH POLISH: SERVICES MEGA MENU, HERO TYPING PERFORMANCE

### Brief

Two tasks, explicitly not feature work. Redesign the **visual presentation only** of the services mega menu — keeping every link, destination and behaviour — toward something more premium, with better hierarchy, whitespace, alignment, balance, grouping and a stronger visual entry point; consistent with the BlueGrid system, taking the Austin Ervin panel as inspiration rather than a template. Then **profile** the hero typing animation, find the actual bottleneck rather than guessing at one, fix it, re-measure, and stop when further work stops paying.

---

### Part 1 — Services mega menu

#### The problem with the old panel

Seven services in a two-column grid. Seven is odd, so the last row was always a hole — that lopsidedness is what reads as unfinished. There was no heading, no hierarchy between the flagship service and the rest, and no reason for the eye to land anywhere in particular.

#### What was built

A **featured band** across the top carrying Forestry Mulching: a 52px sky-tinted icon tile, a "Start Here" eyebrow, the title in the display face rather than the body face, one line of promise, and a "See how it works" cue whose arrow slides 4px on hover. It is the only *filled* surface in any mega panel on the site, so it wins the eye without needing to be loud.

Below a hairline, the remaining six sit in **three equal labelled groups of two**:

| Group | Services |
|---|---|
| Clearing & Site Prep | Land Clearing, Brush Removal |
| Access & Habitat | Trail Cutting, Hunting Property Prep |
| Cleanup & Recovery | Property Cleanup, Storm Cleanup |

Three-by-two has no hole, the columns are the same height by construction, and each label is honest about what its pair has in common. An earlier 3/2/1 split (*Clearing & Site Prep* / *Access & Habitat* / *Storm Response*) was discarded: it balanced on paper only because the extra heading in the second column happened to make up the height, and "Storm Response" as a group of one is a label pretending to be a category.

#### Why the panel is 760px and still centred

The instinct was to left-anchor a wide panel to its toggle, on the assumption that the nav sits next to the brand lockup. It does not: `.brandLockup` carries `margin-right: auto`, which pushes the nav and the actions to the **right** of the bar. So the Services toggle is much further right than it looks in the markup, and the existing centred positioning has more room than expected — no override was needed at all, which also keeps this panel positioned exactly like the other two.

760px matches the FAQ panel deliberately, so the site's two large panels are the same object at the same size.

Fit was measured rather than eyeballed, reusing the TrueType parser built for the header audit:

```
   1600px   panel  329 -> 1089    margins  329 /  511   ok
   1440px   panel  249 -> 1009    margins  249 /  431   ok
   1280px   panel  191 ->  951    margins  191 /  329   ok
   1151px   panel   62 ->  822    margins   62 /  329   ok
```

1151px is the narrowest viewport the desktop nav survives to, and the panel still clears the left edge by 62px. Inside the panel the tightest group title, *Hunting Property Prep*, needs 155px against 172px of column — 16px of slack, enough to absorb the wider Segoe UI fallback if Inter has not loaded.

#### Tokenized, because the brief said "design language"

Nine `--mega*` properties in `:root` now carry the panel surface, shadow, top edge, rule, row radius, hover tint, label colour and copy colour. **Every value is the one the panels already shipped with**, and the FAQ panel was repointed at them — so it renders identically while sharing the vocabulary, and a panel added for a future section inherits the surface for free. This is the part that makes the pattern portable to the next Nulo Studio site; the featured-band structure is the part that makes it BlueGrid's.

#### The guard earned its keep

The rebuild script refused to write anything on its first run:

```
services\forestryMulching.html: link set differs —
  missing [services/forestryMulching.html, ...]
  extra   [forestryMulching.html, ...]
```

Pages inside `services/` link to their siblings **bare** — `forestryMulching.html` — not `../services/forestryMulching.html`. So service links have **three** path forms, not the two the rest of the chrome uses. The two-variant rule in `projectState.md` was not wrong, it was just not the whole rule, and it has now been corrected there. Had the script trusted it, seven links on seven pages would have shipped broken.

---

### Part 2 — Hero typing performance

#### Method

No browser is available on this project, so the animation was profiled by running the **real shipped `indexJS.js`** in a VM against a virtual clock that models the browser's rendering lifecycle rather than just its timers: callbacks fire when scheduled, but a DOM change only becomes visible at a vsync tick. Both builds were driven from the same seeded random stream, so the comparison measures the change and not luck. Two scenarios: an idle main thread (assumption-free) and a contended one (a declared model, used only to check that the fix degrades better).

#### Finding 1 — the schedule asked for cadences the screen cannot show

`typeHeroPhrase()` scheduled one `setTimeout` per character, each writing straight into `.textContent`. Measured over three simulated minutes at 60Hz:

```
                  count     mean    stdev      min      max   spread
  scheduled         399     82.2      9.5     68.0    111.5     43.5
  rendered          400     82.1     11.8     66.7    116.7     50.0

  jitter added by the render step   +2.29ms stdev  (24%)
```

The design asks for restrained variation; the visitor gets a quarter more than that, because a timer fires at an arbitrary point inside a frame and the character waits out the rest of it — **8.5ms on average, 16.7ms at worst**. Under load two timers can land in one frame and the second write erases the first before it is ever painted.

#### Finding 2 — the layer is torn down mid-phrase

`.heroHeadline` gets `will-change: opacity, transform` from `html.jsEnabled [data-heroanimate]`, and `indexJS.js:757-768` **removes that attribute at t=2200ms**. Typing starts around t=900ms, so the de-promotion lands at roughly the **sixteenth character of the first phrase**. From that moment the typed line paints into the same layer as the hero photograph and the overlay gradient:

```
  invalid rect per character   926 x 125 px   (glyphs + the 24px text-shadow)
  tiles re-rastered                     10
  pixels redrawn per character        655k
  photo pixels resampled              655k    -> 8.0 megapixels/second
```

Every keystroke was resampling the photograph, for a change that only ever touches the glyphs.

#### What shipped

1. **Commits happen inside `requestAnimationFrame`.** Write-to-paint goes to zero, and one frame can only serve one commit, so a swallowed character is structurally impossible rather than merely unlikely.
2. **Deadlines chain from the frame that served the previous commit**, so exactly one rounding sits between any two characters and none of it accumulates.
3. **A cached `Text` node**, mutated via `nodeValue`, replaces re-assigning `.textContent` — 873 node teardowns in three minutes became 18.
4. **Strings are pre-computed** outside the frame callback, so nothing allocates inside it.
5. **`.heroTypedLine` holds its own compositing layer** for the life of the loop, zeroed under `prefers-reduced-motion` where nothing types.

```
                                   before     after
  jitter added by the render step    +24%        0%
  write -> paint                    8.5ms       0ms
  text nodes rebuilt (3 min)          873        18
  setTimeout allocated (3 min)        939       139
  characters swallowed                  0         0
```

Scheduled and rendered cadence are now **identical** — the schedule only asks for things the screen can actually show. Mean interval moved 82.1ms → 80.6ms, i.e. onto the 80ms the config always specified. `heroDuetConfig` was not edited.

#### Two wrong turns, both caught by measuring

- **An off-by-one in the frame counter** ran every interval one frame long: mean 82ms → **97ms**, an 18% slowdown that would have read as sluggish. The profile caught it immediately; no amount of reading the code would have.
- **A pure deadline chain** — chaining from the abstract deadline rather than from the serving frame — measured **11.95ms stdev against the baseline's 11.78ms**, i.e. no better than the timers it replaced. Two independent roundings, one at each end of every interval. Predicting it would help was wrong, and the measurement said so.

#### Why frames are not counted

Counting frames is the obvious way to express "wait five frames", and it measured very slightly smoother at 60Hz (10.0ms stdev against 10.1ms). It was rejected and the rejection verified:

```
  120Hz   frame-counted   mean 40.5ms      <- double speed
  120Hz   shipped         mean 81.8ms
```

A tenth of a millisecond is not worth an animation that runs at double speed on the panels in most current laptops and phones.

#### What was deliberately left alone

The `text-shadow: 0 3px 24px` on the typed line is the remaining per-character cost — a 24px blur over ~115k pixels of 73.6px display type, every keystroke. It is irreducible without changing how the hero looks, and the brief said not to. Logged as debt rather than quietly softened.

---

### Files touched

- `js/indexJS.js` — `heroTimingIsHeld()`, `writeHeroTypedText()`, `runHeroTypedSequence()`, rewritten `typeHeroPhrase()` / `deleteHeroPhrase()` as step builders
- `css/styleIndex.css` — nine `--mega*` tokens, the services panel and its featured band, group headings, restyled rows, `will-change` on `.heroTypedLine` and its reduced-motion opt-out
- All **23 HTML pages** — services mega panel markup, rebuilt by a guarded assembler
- `docs/projectState.md`, `docs/engineeringJournal.md`, `docs/technicalDebt.md`

### Validation

`validateSite`, `validateNav`, `validateHeader`, `validateHero`, `validateLeadFlow`, `heroLoopHarness` (91 cycles alternating, 6.16–7.01s), the Apps Script harness (**64/64**), `node --check`, and a new `validateServicesMega` covering all 23 pages — structure, links resolving to files that exist on disk, styling coverage in **both** directions (no unstyled class, no dead `.mega*` rule), decorative SVGs kept out of the accessibility tree, and on-screen fit from 1151px to 1600px. All pass.

---

## 2026-08-04 — SESSION SUMMARY (2026-08-02 → 2026-08-04)

> Session-level compaction. Each phase below has a detailed entry further down this file — this is the fast path for a session resuming cold.

### Summary

One continuous session covering six pieces of work: **Phase 2B** (first-wave service area pages), **Phase 2C** (hero mobile refinement), **Phase 2D** (connecting the live Apps Script backend), a **header navigation polish** and its **tokenization follow-up**, and a **navigation restructure with two new content sections**.

The site went from **8 pages with a form that silently discarded every submission** to **23 pages with live lead capture**, a location tier, an FAQ hub, and a resource centre.

### Files Created

**Location pages (6)** — `locations/forestry-mulching-{ashland-ky, portsmouth-oh, ironton-oh, chillicothe-oh, grayson-ky, morehead-ky}.html`

**FAQ hub (1)** — `faq/index.html`

**Insights (8)** — `insights/index.html` plus `benefits-of-forestry-mulching`, `brush-hogging-vs-forestry-mulching`, `when-to-clear-overgrown-property`, `preparing-land-for-building`, `storm-cleanup-best-practices`, `fence-line-clearing-tips`, `signs-your-property-needs-land-management`

### Files Modified

- `index.html` — service-area link wiring, town-by-town block, Rowan County in schema/map/FAQ, nav restructure, `hero_after` casing
- `services/*.html` (7) — service-area link wiring, nav restructure; `forestryMulching.html` additionally gained the "Where We Work" block
- `locations/*.html` (6) — nav restructure (after being created earlier in the session)
- `js/indexJS.js` — `rowan` service region; hero dissolve made awaitable + forward-sweep `error` fallback; production `/exec` endpoint; double-submit guard and stable `leadId`
- `css/styleIndex.css` — hero media decoupling, estimate band, overlay fade; header anti-wrap guards, compact band, 1150px switch, twelve `:root` tokens, unified `--headerTransition`; `.megaPanelFaq` and contents; `.serviceAreaTowns*`
- `css/stylePages.css` — location-page components (`.localSection`, `.localProse`, `.localProblemGrid`, `.nearbyList`), FAQ page components, Insights components
- `graphics/images/hero_after.JPG` → `hero_after.jpg` (git rename)
- All three `docs/` files

### Architecture Decisions

1. **Six location pages, not thirteen.** `seoPlan.md` rows 1–6 with genuinely local content over 13 doorway pages. The 7 cities without pages still point at the `#serviceAreas` anchor.
2. **Location pages link up, never sideways** — parent service page, homepage, all 7 services. Nearby towns are plain text, which is why `.nearbyList` styles `li` not `a`. Sitewide chrome *does* link to them; `seoPlan.md` rule 4 blesses that explicitly.
3. **Hero media decoupled from section height** rather than shrunk. An `inset: 0` layer is coupled to its container's content; every fix that is not decoupling is a workaround.
4. **The hero fade lives on `.heroOverlay`, not `.heroPlate`** — a bottom `mask-image` on the plates would overwrite `.heroPlateAfter`'s mask, which *is* the sweep animation.
5. **One endpoint, one call site.** Already true; this session verified it rather than assuming, and added checks so it stays true.
6. **`leadId` is stable for the page load** so the server's dedupe can collapse a retry into the original row.
7. **Header compact band starts at 1280px, above the 1207px wrap point**, so crossing it makes the bar roomier rather than snapping tighter.
8. **The mobile-nav switch is a header-only media query** — the existing 1080px query also drives the hero and services grid, and retargeting it would have been a redesign of sections nobody asked about.
9. **Header dimensions are `:root` tokens** with a single `--headerTransition`; reduced motion zeroes the whole morph in one declaration.
10. **New pages live one level deep** (`faq/index.html`, `insights/*`) so they reuse the proven one-level chrome instead of needing a third path variant.
11. **The FAQ hub carries only new questions.** The site had 75; `seoPlan.md` bans duplicates; the hub took the 28 that were left.
12. **The FAQ mega menu links to whoever owns the answer** — several items point at service pages rather than the FAQ page.
13. **Generators stay in the scratchpad.** Phase 13 owns the real one; shipping a half-generator would create two competing sources of truth.

### Validation Performed

- **23 pages, 2,407 internal links and assets, zero broken.** Every same-page and cross-page anchor resolves.
- Location-page uniqueness: worst pairwise 5-word-phrase overlap **14.7%** (gate 25%), 1,133–1,283 body words.
- Insights uniqueness: worst pairwise overlap **0.3%**, 550–900 body words.
- **Zero duplicate FAQ questions introduced** — the hub's 28 cross-referenced against every question elsewhere on the site. The check also surfaced one *pre-existing* duplicate between `index.html` and `services/landClearing.html` (technicalDebt item 10a).
- Nav order parsed from rendered markup on all 23 pages; mega-menu structure, `aria-expanded`/`aria-controls` wiring, and preview length checked per page; mobile drawer confirmed to carry exactly two items and no mega markup.
- Header: **every integer width 900–1600px** re-measured against the real Inter/Rokkitt metrics — zero wrapping, tightest desktop 1151px.
- Hero seam geometry exact (0px error) with 24px card overlap at 360×640, 390×844, 430×932, 768×1024, 1024×1366.
- Titles and meta descriptions unique sitewide; every JSON-LD block parses; every schema FAQ question verified to render.

### Tests Executed

| Harness | Result |
|---|---|
| `appsScript/localTestRunner.js` | **64/64**, `runSelfTest` 6/6 |
| Hero duet loop simulation (10 min page time) | **92/92 alternating**, 6.13–6.94s cadence — *and fails on the pre-fix code, 90 of 108 reveals clipped* |
| Sitewide link/structure validator | 23 pages, 2,407 references, 0 broken |
| Navigation & new-page validator | PASS |
| Header width sweep 900–1600px | PASS |
| Hero layout validator (5 viewports) | PASS |
| Lead-flow contract validator | PASS |
| Live endpoint probes (`ping`, unknown action, unauthorized, honeypot POST) | All correct, zero side effects |
| `node --check js/indexJS.js` | clean |

### Bugs Found

**Pre-existing, fixed**
1. Hero before/after loop desynced — stale cleanup timer stripped the next cycle's `isRevealed`.
2. `fireHeroForwardSweepAndWait()` could hang forever if the AFTER plate failed to load.
3. `hero_after` filename casing mismatch between disk and git — a 404 waiting on case-sensitive hosting.
4. Desktop header wrapped across a 126px band (1081–1207px).
5. **No double-submit guard on the estimate form** — harmless while the endpoint was empty, a data-integrity defect the moment it went live.
6. Rowan County absent from all four places the site lists counties, while Morehead was advertised in the nav.

**Pre-existing, found and logged (not fixed)**
7. Current service is not highlighted in the mega menu, contrary to `servicePageArchitecture.md`.
8. Orphan asset `graphics/images/after.JPG`, referenced nowhere.

**Mine, caught by guards before shipping**
9. Generated location pages had mixed line endings (CRLF from template literals, LF from spliced chrome).
10. Chrome splice left seven mega-menu service links resolving inside `insights/` — the location builder had a repointing step the new builder initially lacked.
11. Two unescaped ampersands (category labels, one `og:title`).
12. One Insights article under the thin-content word floor.
13. `.nearbyList` top margin stacked with the lede's bottom margin.

**In validators, not the product** — a harness that started two concurrent hero loops; a mega-panel slice that stopped at the first `</li>`; an article-uniqueness check measuring shared boilerplate; a "no dates" check matching its own explanatory comment; an enum comparison tripping on line endings.

### Bugs Fixed

All of 1–6 and 9–13. Items 7 and 8 are logged in `technicalDebt.md` (18 and 15b).

### Performance Improvements

- Header spacing tightened by **101px**, and the nav restructure removed a further **127px** — the header now needs 1080px of viewport where it once needed 1207px.
- No regressions introduced: no new external hotlinks, no new render-blocking resources, no new fonts. Insights images reuse existing repo assets.
- **Not done:** the Lighthouse pass. Hero images remain `2048×1536` with no `srcset`, and Google Fonts still loads render-blocking.

### UX Improvements

- Mobile hero no longer runs hundreds of pixels past the fold; the estimate card sits on its own band with a deliberate 24px overlap.
- The before/after transition now alternates indefinitely at a consistent 6.1–6.9s cadence instead of stalling every few cycles.
- Desktop nav no longer wraps at any width; transitions between desktop, compact desktop, and mobile are animated on one shared curve, and respect `prefers-reduced-motion`.
- A double-tap on the estimate submit button can no longer produce duplicate leads or a permanently locked form.
- The FAQ mega menu answers common questions in the nav itself; mobile deliberately stays a short list.

### SEO Improvements

- **15 new indexable pages**: 6 location, 1 FAQ hub, 8 Insights.
- Location pages target the money keyword per city with genuinely local content that fails the city-swap test by design.
- New structured data: `Service` ×6 and `FAQPage` ×6 on location pages, `FAQPage` on the hub, `Article` ×7, `ItemList`, and `BreadcrumbList` on every new page.
- `LocalBusiness` `areaServed` extended with Rowan County so schema matches the advertised coverage.
- Internal linking materially strengthened: mega menu → FAQ hub and service pages; "Where We Work" → location tier; every Insights article → its parent service page and the FAQ; the FAQ hub → all seven service pages.
- Titles and meta descriptions verified unique across all 23 pages.
- **No duplicate FAQ questions introduced**, enforced by a check rather than by memory. The same check surfaced one pre-existing duplicate from Phase 1 (technicalDebt item 10a).

### Lessons Learned

- **A passing test proves nothing until it has failed.** The hero-loop harness only earned trust once it reproduced the reported symptom against the pre-fix code.
- **Wiring an endpoint changes which bugs are real.** The double-submit hole existed all along and cost nothing until the URL was set.
- **Measure instead of estimating when the answer is a number.** Parsing the real font files turned the breakpoint from a judgement call into arithmetic.
- **A rule is only real if something checks it.** `seoPlan.md` had banned duplicate questions since day one; writing the cross-reference check is what turned that into a constraint that shaped the FAQ page.
- **Validators fail in both directions.** Roughly a third of this session's "bugs" were in the checking code; every failure needed reading before acting.
- **The same splice bug twice means the splice needs a home.** `repointServiceLinks()` has now been written twice in two one-shot generators.

### Important Decisions

- **Committed to `phase2a-lead-capture`, never pushed**, so all of this can be reviewed before it reaches `main`.
- **No dollar figures anywhere.** No pricing has been approved; inventing ranges would be a commitment the site cannot honour. Logged as the highest-value client ask.
- **No fabricated publication dates** on Insights — none visible, none in schema, with a comment explaining the omission.
- **Placeholder imagery is marked, not disguised** — real BlueGrid photos standing in, each `TODO:`-commented, and no new external hotlinks added.
- **Before & After was removed from the primary nav** on a literal reading of the brief's four-item order. Flagged for confirmation; it remains reachable from the hero CTA and the footer.
- **The 1150px header breakpoint was left alone** even though the nav restructure gave it 163px of slack, because moving it was outside that request.

---

## Next Session Should Continue Here

**Everything through Phase 2D is complete and committed at `863842c`. The working tree is clean and all eight validation suites pass.**

1. **Read `docs/projectState.md` first.** It carries the repository status, the ordered task list, and who owes what.
2. **The only outright launch blocker is the production domain.** Canonicals say `www.bluegridlandsolutions.com`; `CNAME` says `bluegridlandsolutions.nulostudio.com`. It gates `robots.txt`, `sitemap.xml`, canonical finalization, and Open Graph across **23 pages** — all already `TODO:`-marked so one sweep closes them.
3. **Two zero-engineering checks are outstanding:** one real lead submission from the live site (it emails the owner and the customer, so it was not triggered unilaterally), and **a real browser pass — no session on this project has ever had one.**
4. **Before editing any page programmatically:** line endings are mixed per file (see *Current Repository Status*), and chrome spliced from `services/` needs its seven service links repointed to `../services/…`.
5. **Before adding a nav item:** re-run the header width sweep. There is 163px of slack at 1151px today, and a new label consumes it.
6. **After any `.gs` change:** `node appsScript/localTestRunner.js`, expect `passed: 64  failed: 0`.
7. **New content must clear the uniqueness gate** — under 25% pairwise 5-word-phrase overlap, and no FAQ question may duplicate one already on the site. Current totals: **103 rendered FAQ questions, 102 unique** — the gap is one pre-existing duplicate between `index.html` and `services/landClearing.html`, logged as `technicalDebt.md` item 10a.

---

## 2026-08-04 — Navigation restructure, FAQ hub, and Insights

### Summary

Replaced Reviews with Insights in the primary nav, turned FAQ into a desktop mega menu, and built two new sections: a dedicated FAQ hub and an Insights resource centre with seven launch articles. The site went from 14 pages to **23**.

### Files Created

- `faq/index.html` — 28 questions across 6 categories
- `insights/index.html` — the resource centre landing page
- `insights/{benefits-of-forestry-mulching, brush-hogging-vs-forestry-mulching, when-to-clear-overgrown-property, preparing-land-for-building, storm-cleanup-best-practices, fence-line-clearing-tips, signs-your-property-needs-land-management}.html`

### Files Modified

- All 14 existing pages — nav tail replaced, mobile drawer simplified, footer FAQ link retargeted with Insights added
- `css/styleIndex.css` — `.megaPanelFaq` and its contents
- `css/stylePages.css` — FAQ page and Insights components

### Navigation

Final order is **Services · Service Areas · FAQ · Insights**.

**A judgement call worth flagging:** the brief said to remove Reviews and replace it with Insights, then gave the resulting order as a four-item list that does not include *Before & After*. Read literally that is a complete specification, so Before & After came out of the primary nav. It remains reachable from the homepage hero CTA ("See Transformations") and from the footer Quick Links, so nothing is orphaned — but if the intent was a five-item nav, putting it back is a one-line change.

### FAQ Mega Menu

Nine questions, each a bold question plus a two-sentence preview, two-up in a 760px panel capped against the viewport so it cannot overhang at the narrowest desktop width. A "View All FAQs" CTA sits under a divider.

**The nine items do not all point at the FAQ page.** Several of the most common questions were already answered elsewhere — "What is forestry mulching?" on the homepage and the mulching service page, "Do you remove stumps?" on land clearing, "Do you haul debris away?" on property cleanup. Those link to the page that owns the answer; the rest link to `faq/index.html#anchor`. That keeps the mega menu genuinely useful without restating answers that already exist, which `seoPlan.md` forbids.

Mobile is deliberately two plain links. A mega menu inside a full-screen drawer is worse than a short list, and the brief asked for it to stay simple. A check fails if mega-menu markup ever leaks into the drawer.

### FAQ Page

Six categories — Estimates & Getting Started, Choosing the Right Service, On Your Property, Equipment & Conditions, After the Job, Payment & Paperwork — with a jump-link card grid at the top and the existing accordion component for the answers. Every question anchors individually so the mega menu can deep-link to it. It carries the `FAQPage` schema and links out to all seven service pages.

**All 28 questions are new.** The site already had 75 FAQs across the homepage, service pages, and location pages, and `seoPlan.md` bans duplicate questions across pages. Rather than build a hub that restates and competes with the service pages, the hub took the territory nobody had covered: insurance, deposits, 811 locates, property lines, livestock and gates, ground pressure, weather delays, what the ground looks like afterward, whether the mulch attracts pests. A validator now cross-references all 74 questions elsewhere on the site and fails on any collision.

### Insights

Seven articles, 550–900 body words each, worst pairwise 5-word-phrase overlap **0.3%**. Each has an `Article` schema, a breadcrumb, related-reading cards, a link to its parent service page, and a link back to the FAQ.

**No dates anywhere**, as instructed — no visible date, no `datePublished`, no `dateModified`, no `<time>` element. The schema comment explains why rather than leaving a future reader guessing. A check enforces it.

**Hero and card images are real BlueGrid job photos standing in for topic-specific photography**, each marked with a `TODO: PLACEHOLDER IMAGE` comment in the markup. No new external hotlinks were introduced — `technicalDebt.md` item 6 already complains about the Unsplash ones on the homepage and adding more would have made that worse.

### Validation Performed

- **23 pages, 2,407 internal links and assets, zero broken.** Every same-page and cross-page anchor resolves.
- Nav order verified on all 23 pages by parsing the rendered markup, not by trusting the generator. Reviews confirmed absent from every primary nav.
- Mega menu: 9 questions and 9 previews on every page, CTA present, `aria-expanded` / `aria-controls` / panel id wiring intact, every preview ≤3 sentences.
- Mobile drawer: exactly two items, no mega markup, on all 23 pages.
- FAQ page: all 6 category sections and jump links present, all 28 question anchors present, 28 accordions rendered, every mega-menu deep link resolves, all 7 service cross-links present.
- **Zero duplicate questions** against the 74 elsewhere on the site.
- Insights: every article linked from the landing page, word counts above the thin-content floor, no dates, placeholder images marked, service and FAQ links present.
- Regression suite unchanged: hero seam exact on five viewports, hero loop 92/92 alternating, lead flow contract clean on all 23 pages, header sweep 900–1600 with zero wrapping, `node --check` clean, Apps Script 64/64.

### A Consequence Worth Recording

The new nav is **127px narrower** than the old one (450px vs 577px) — FAQ and Insights are shorter labels than Before & After plus Reviews plus FAQ. The header now needs **1080px** of viewport rather than 1207px, so at 1151px there is **163px of slack** instead of 45px.

The 1150px mobile breakpoint was therefore left alone but is now more conservative than it needs to be: the desktop nav would survive comfortably to roughly 1105px. Moving it was not part of this request and the previous session chose 1150 partly for webfont-fallback margin, so the headroom is recorded in `technicalDebt.md` rather than spent unilaterally.

### Bugs Found

**Mine, caught by the guards**

1. The chrome was spliced from `services/forestryMulching.html`, where the seven mega-menu service links are relative to that folder — so every new page linked to `insights/forestryMulching.html`. The location-page builder had a `repointServiceLinks()` step for exactly this; I forgot it. The link validator caught all 63 instances.
2. Two genuinely unescaped ampersands: the category labels ("Payment & Paperwork") and one `og:title`. The ampersand guard caught both.
3. `when-to-clear-overgrown-property` came in at 537 body words, under the thin-content floor. Added a section on what waiting actually costs.

**In the validator, not the product**

4. The mega-panel check sliced to the first `</li>`, which closes the first question rather than the panel — it reported 1 question on every page.
5. The article uniqueness check measured `<main>`, which includes the shared hero, breadcrumb, related cards, and estimate form. That reported 26.1% overlap for what is almost entirely template. Measuring the prose only gives 0.3%.
6. The "no dates" check matched the schema comment explaining why dates are absent.

### Lessons Learned

- **The same splice bug twice means the splice needs a home.** `repointServiceLinks()` has now been written twice in two different one-shot generators. Phase 13's real generator should own it rather than each script rediscovering it.
- **A duplicate-content rule is only real if something checks it.** `seoPlan.md` has banned duplicate questions since the start; writing the cross-reference check is what turned that from an intention into a constraint, and it shaped the whole FAQ page — the 28 questions are the ones that were left after subtracting 75.
- **Validators fail in both directions.** Three of this session's six "bugs" were in the checking code. A failing check is a hypothesis, not a verdict; each one needed reading before acting.

---

## 2026-08-03 — Header navigation polish

### Summary

The desktop header wrapped between roughly 1100px and 1200px. Tightened the spacing to buy 101px, then moved the mobile-nav switch from 1080px to 1150px, because even fully optimized the bar still could not fit at 1100px.

Measured rather than eyeballed: this session pulled the real Inter and Rokkitt font files and wrote a minimal TrueType metrics parser, so every number below is an advance-width measurement, not an estimate.

### Files Modified

- `css/styleIndex.css` — anti-wrap guards on the base header rules; new `@media (max-width: 1280px)` compact band; new `@media (max-width: 1150px)` mobile-nav switch; the six header rules that used to live in the `1080px` query moved into it

### The Audit

`.headerInner` is a flex row whose items shrink before anything else gives, and nothing in the header carried `white-space: nowrap` — so once the content stopped fitting, the nav links and the phone number broke onto a second line inside a fixed-height bar.

Measured, the full-spacing header needs **1207px** of viewport:

| Part | Width |
|---|---|
| Brand lockup (badge 69 + gap 16 + text 118) | 203px |
| Primary nav — Services 112, Service Areas 150, Before & After 135, Reviews 92, FAQ 62, plus gaps | 577px |
| Phone chip | 171px |
| Free Estimate | 142px |
| Two 25.6px header gaps + 48px padding | 99px |
| **Viewport required** | **1207px** |

The mobile switch sat at 1080px, so **1081–1207px was a 126px-wide band where the desktop nav was live and could not fit.** That is exactly the reported symptom.

### Optimization First

Every requested lever, applied cumulatively and measured:

| Change | Saved |
|---|---|
| Nav link padding `0.95rem` → `0.7rem` | 40px |
| Header gap `1.6rem` → `1.1rem` | 16px |
| Nav list gap `0.4rem` → `0.25rem` | 10px |
| Brand badge `69px` → `60px` | 9px |
| Header padding `1.5rem` → `1.25rem` | 8px |
| Phone chip padding `1rem` → `0.75rem` | 8px |
| Brand lockup gap `1rem` → `0.75rem` | 4px |
| Nav chevron gap `0.4rem` → `0.3rem` | 3px |
| Header actions gap `0.9rem` → `0.7rem` | 3px |
| **Total** | **101px** |

**The `Free Estimate` CTA padding was deliberately left alone.** Shrinking the primary CTA is what makes a header read as cramped rather than tidy, so everything else gave ground first. Nav, phone, and CTA font sizes were also untouched — that would be changing typography. The only type change is the brand mark, which the brief explicitly allowed to shrink and which the stylesheet already shrank at smaller widths.

### The Breakpoint Did Move — and Optimization Alone Was Not Enough

Optimized, the header needs **1106px**. At a 1100px viewport that is still **6px short**. Leaving the switch at 1080px would have left a small but real broken band at 1081–1106px, so the switch moved to **1150px**.

Why 1150 and not 1100 or 1200:

- **1100px fails outright** — 6px of overflow.
- **1130px** is the bare minimum for 24px of slack, with nothing spare.
- **1150px** leaves **45px of slack** at 1151px, the last desktop width. That margin matters because `--fontBody` falls back to `'Segoe UI'`, which is wider than Inter; without headroom the header would wrap during the brief window before the webfont loads.
- **1200px** would work but drops the desktop nav earlier than it needs to, against the instruction to keep it active as long as it stays clean.

1150px keeps the desktop nav on every common laptop width (1280, 1366, 1440, 1600) and on iPad-class landscape viewports of 1180–1194px.

### Two Deliberate Structural Choices

1. **The compact band starts at 1280px, not at the 1207px wrap point.** Crossing 1280 downward therefore makes the bar *roomier* (74px slack → 174px), never tighter. A band that began at the wrap point would have produced a visible snap exactly where the layout was already under strain. Above 1280px nothing changed at all.

2. **The switch is a header-only media query.** The existing `1080px` query also drives the hero, the services grid, and other section layouts. Retargeting the whole query to 1150px would have moved all of that — a redesign of sections nobody asked about. The six header rules were moved out into the new `1150px` query and the `1080px` query kept everything else. A check now fails if a header rule reappears in the `1080px` block.

### Validation Performed

- Downloaded the real **Inter 600/700 and Rokkitt 700** from Google Fonts (legacy UA → EOT, TTF payload extracted from the wrapper) and wrote a `head`/`hhea`/`hmtx`/`cmap`-format-4 parser. Kerning is ignored on purpose: it almost always subtracts width, so omitting it errs wide, which is the safe direction for a fit question.
- **Swept every integer width from 900 to 1600px**, resolving which tokens apply at each and re-measuring. **Zero widths wrap.** The tightest desktop width is **1151px with 45px of slack**.
- All ten requested widths verified: 1600/1440/1366 clean at +153px, 1280 at +174px, 1200 at +94px; 1100/1024/992/900/768 on the hamburger.
- Transition continuity asserted — the compact band must not reduce slack at its own boundary.
- Structural checks: `white-space: nowrap` on `.navLink`, `.phoneChip`, `.headerCta`, `.brandName`, `.brandNameSub`; `flex-wrap: nowrap` on `.navList`; `flex-shrink: 0` on `.primaryNav` and `.headerActions`; the CTA's padding absent from the compact band; the `1150px` query genuinely hiding the nav/phone/CTA and showing the hamburger; no header rule left behind in the `1080px` query.
- Regression suite unchanged: 14 pages / 1,372 links and assets / zero broken; hero seam exact on five viewports; hero loop 92/92 alternating; lead flow contract clean on all 14 pages; `node --check` clean; Apps Script 64/64.

### Not Verified

Still no browser. The arithmetic is measured from the real fonts and the real stylesheet, but nothing was rendered — the mega-panel drop shadows, the hamburger's optical alignment at 1150px, and the general feel of the compact band have not been seen. Covered by `technicalDebt.md` item 18a.

### Follow-up refactor — tokens and a unified morph

Requested after the first commit; no visual change, every measured width reports identical slack.

**Twelve `:root` tokens** replaced the duplicated layout rules: `--headerPadX`, `--headerGap`, `--headerBrandGap`, `--headerBadgeSize`, `--headerBrandNameSize`, `--headerNavGap`, `--headerNavLinkPadX`, `--headerNavChevronGap`, `--headerActionsGap`, `--headerPhonePadX`, `--headerCtaPadX`, `--headerTransition`. The `1280px` and `1150px` queries became **token overrides only**, and the `.brandBadge` / `.brandName` rules that were duplicated in the `1150px` and `640px` queries are gone — both sizes now come from tokens, so all four header states are described in one vocabulary. Only header variables were added; nothing existing was refactored.

`--headerCtaPadX` exists specifically so the CTA's constancy is explicit rather than incidental. A check fails if any breakpoint overrides it.

**One shared timing.** Every dimension that differs between states animates on `--headerTransition` (`0.35s var(--easePremium)`), matching what `.siteHeader` already used for its scrolled background: `.headerInner` gap/height/padding, `.brandLockup` gap, `.brandBadge` width/height, `.brandName` font-size, `.navList` gap, `.navLink` gap/padding, `.headerActions` gap, `.phoneChip` padding. Hover colour keeps its quicker 0.25s timing — only layout properties ride the shared curve.

The switch itself cannot animate: `display` is not interpolable and there is no honest tween from a five-item nav to a hamburger. But the bar's height, logo, and padding still ease across it, so 1150px reads as the header resolving into its compact form rather than a jump cut.

`prefers-reduced-motion` sets `--headerTransition: 0s`, which kills the entire morph in **one declaration** because every rule shares the token.

New checks: every token is actually consumed by a header rule (an orphaned token is worse than a hardcoded value); no breakpoint overrides `--headerCtaPadX`; all eight rules animate their layout properties on `var(--headerTransition)`; reduced motion zeroes it; no `.brandBadge`/`.brandName` rule survives in the `1150px` or `640px` queries.

Verified at 1600/1440/1366/1280/1200/**1151**/**1150**/1100/1024/992/900/768 — desktop widths clean at +153/+153/+153/+174/+94/+45, hamburger below. Sweep of every integer width 900–1600 still reports zero wrapping and the same 45px tightest slack.

### Lessons Learned

- **A token nothing reads is worse than a hardcoded value.** The refactor's first check verifies each custom property is actually consumed, because the failure mode of "tokenize everything" is a variable that silently does nothing while looking authoritative.
- **"Reduce the spacing" and "move the breakpoint" were not alternatives.** The brief framed them as a fallback chain, and measuring showed both were needed: optimization alone still left a 6px deficit at 1100px. Without numbers it would have been easy to ship the tightening, feel that it looked better, and leave a narrow broken band behind.
- **Font files are gettable, so text width is measurable.** Guessing average character widths would have put the answer off by enough to pick the wrong breakpoint. An hour of TrueType parsing turned a judgement call into arithmetic.
- **Start a compact band above the point where it is needed.** Putting the boundary at 1280 rather than 1207 means the adjustment lands where there is still slack, so it reads as a smooth change rather than a rescue.

---

## 2026-08-03 — Phase 2D: live Apps Script backend connected

### Summary

The production Web App URL is wired into `businessConfig.estimateEndpoint` and lead capture is live. **This closes the project's oldest and largest launch blocker** — since Phase 1 the form had been showing visitors a confirmation while discarding their request.

The endpoint was already architected as a single shared value, so no refactor was needed; the audit below proves that rather than assuming it. The code review that followed the wiring found one real defect, which is fixed.

### Files Modified

- `js/indexJS.js` — production `/exec` URL set in `businessConfig`; double-submit guard added (`estimateSubmissionInFlight`, `endEstimateSubmission()`); `leadId` held stable for the page load via `currentEstimateLeadId`

### Single Source of Truth — audited, not assumed

The endpoint appears **exactly once** in shipped code. All 14 pages load the same `js/indexJS.js`, and there is **exactly one `fetch()` call site**, which builds its URL from `businessConfig.estimateEndpoint + '?action=leads.create'`. No page inlines a handler; every `<form>` carries `action="#"` and is JS-handled. A future redeployment is a one-line change.

Checks now enforce this: one live URL in shipped code, one `fetch()` call site, no hardcoded endpoint in any HTML/CSS, every page loading the shared script, and no form posting anywhere.

### Defect Found and Fixed — duplicate leads on a double-tap

`submitEstimateRequest()` had no in-flight guard. `isLoading` was a cosmetic class; the button was never `disabled` and nothing checked whether a request was already running. Worse, `buildEstimatePayload()` minted `leadId: 'BG-' + Date.now()` **on every call**, so two taps produced two *different* leadIds — and the API's dedupe is keyed on `leadId`, so it could not collapse them.

Result, had this shipped: one visitor double-tapping the submit button (on mobile, under a thumb) produces **two rows in the client's sheet, two owner emails, two customer auto-replies**, and burns double the MailApp quota — which is only ~100 recipients/day on consumer Gmail.

This was harmless while the endpoint was empty, because the unconfigured branch never made a request. **Wiring the endpoint is what made it real**, which is exactly why the review was worth doing after the wiring rather than before.

Fix:
- `estimateSubmissionInFlight` short-circuits a second call.
- The button is genuinely `disabled` for the duration, so Enter cannot re-trigger it either.
- `endEstimateSubmission()` releases the lock, and is called on **all three** terminal paths — unconfigured, resolved, rejected — so a failed attempt can still be retried rather than locking the form forever.
- `currentEstimateLeadId` holds the id steady for the page load, so a retry after a network failure carries the *same* id and the server's dedupe collapses it into the original row. Holding it for the page load is correct because the flow allows one submission per load: once the success panel shows, reopening the modal shows the panel again, not a blank form.

### Validation Performed

**Live, against the production endpoint** (zero side effects on the client's sheet or inbox):

- `GET ?action=ping` → `200` `{"success":true,"data":{"module":"forestryModule","clientId":"bluegrid","version":"1.0.0",…}}`. The identity triple matches `config.gs` exactly, confirming the deployed script is the code in this repo.
- `GET ?action=leads.explode` → `UNKNOWN_ACTION`
- `GET ?action=leads.list` with no key → `UNAUTHORIZED`
- `POST ?action=leads.create` with the honeypot filled → `200` `{"success":true,"data":{"lead":{"leadId":"BG-…"},"honeypot":true}}`. This exercises the **entire real transport chain** — `text/plain` body, no CORS preflight, Apps Script's 302 to `script.googleusercontent.com`, JSON envelope — while `handleCreateLead` short-circuits before writing a row or sending mail. A genuine end-to-end test with nothing to clean up afterward.

**Static contract check** (`validateLeadFlow.js`), covering all 14 pages:

- 20 payload keys, every one mapping to a `LEADS_HEADERS` column except the honeypot; **no server-owned column** (`photoUrls`, `propertySize`, `terrainType`, `status`, `estimateAmount`, `assignedTo`, `internalNotes`, `lastUpdated`) is ever sent by the client
- All 5 `REQUIRED_CREATE_FIELDS` present
- `HONEYPOT_FIELD` in `config.gs` matches the input's `id` **and** `name` on all 14 pages, each wrapped in an `aria-hidden` container with `tabindex="-1"` and `autocomplete="off"`, exactly one per page
- Every `serviceNeeded`, `preferredTime`, and `preferredContactMethod` value offered in HTML is in `ENUM_VALUES`; the `preferredContactMethod` fallback is itself a legal enum
- All 9 element ids `buildEstimatePayload()` reads exist on all 14 pages — it calls `getElementById(...).value` without null guards, so a missing one would throw at submit
- All 6 field-error targets referenced by `showSubmissionError()` exist on all 14 pages
- Transport stays `POST` + `text/plain`; `routes.gs` registers `leads.create` as POST with no auth
- Response handling covers non-200, the success envelope, the error envelope, and network rejection; `VALIDATION_ERROR` matches `ERROR_CODES.validation`
- The client honeypot check runs **before** the fetch
- `leadId` format satisfies the server's own `isValidLeadId` regex, extracted from `validation.gs` rather than hardcoded

Regression suite unchanged: 14 pages / 1,372 links and assets / zero broken; hero loop 92/92 alternating; hero seam exact on five viewports; `node --check` clean; Apps Script harness 64/64.

### Not Verified

- **A real lead was never created.** That path writes a row and emails both the owner and the customer, so it is not mine to trigger unilaterally. The deployment reportedly passed it during setup; it should be re-run once from the live site as the final pre-launch check.
- **Whether `MODULE_API_KEY` is actually set** cannot be determined from outside — `leads.list` returns `UNAUTHORIZED` identically whether the key is missing or simply not supplied. Only `leads.list`/`leads.update` (the Phase 2 dashboard) depend on it; the public form does not.
- **Still no browser.** Same limitation as Phase 2C: no rendered check of the form UI on a real device.

### Lessons Learned

- **Wiring an endpoint changes which bugs are real.** The double-submit hole existed for the whole project and cost nothing, because the unconfigured branch never issued a request. It became a live data-integrity defect the moment the URL was set. Reviewing the flow *after* the wiring, as instructed, is what surfaced it.
- **The honeypot path is a free production smoke test.** It exercises the complete transport — content type, preflight avoidance, redirect, envelope — and by design writes nothing and sends nothing. Worth remembering for any Apps Script backend that has one.
- **"Single source of truth" is a claim to verify, not to assert.** The endpoint really was already in one place, but the check that proves it is what keeps it in one place through the next change.

---

## 2026-08-03 — Phase 2C: hero mobile refinement

### Summary

Three defects in the homepage hero, all fixed at the cause. The hero background no longer grows with the estimate form on mobile; the before/after transition alternates forever instead of desyncing after a few cycles; and the updated `hero_after` asset's filename casing was normalized so it cannot break on a case-sensitive host.

No redesign, no typography change, and the typing animation was not touched.

### Files Modified

- `css/styleIndex.css` — hero media layer decoupled from section height in the `1080px` query; new `.heroSection::after` estimate band; `.heroOverlay` now lands on solid `--colorNearBlack` at the seam; `.heroContent` given the `min-height` that used to sit on `.heroSection`; `.estimateFormCard` rides up over the seam. The `640px` query's `.heroContent` min-height tracks its tighter top padding
- `js/indexJS.js` — `fireHeroReverseDissolve()` became `fireHeroReverseDissolveAndWait()` and is now awaited; `fireHeroForwardSweepAndWait()` gained an `error` fallback
- `index.html`, `locations/forestry-mulching-ashland-ky.html` — `hero_after.JPG` → `hero_after.jpg` (3 references)
- `graphics/images/hero_after.JPG` → `graphics/images/hero_after.jpg` (git rename)

### Issue 1 — hero background ran past the fold on mobile

**Cause.** `.heroMedia` was `position: absolute; inset: 0`, so its height was the *section's* height. At `1080px` and below `.heroInner` collapses to one column and the estimate card stacks beneath the hero copy, roughly doubling the section. The photograph faithfully stretched to cover all of it. Reducing the hero height would not have fixed this — the coupling was the defect.

**Fix.** Stop letting section height drive the picture:

1. `.heroMedia` is pinned top-only (`inset: 0 0 auto`) with an explicit `height: var(--heroMediaHeight)`.
2. `--heroMediaHeight` is declared once on `.heroSection` as `100vh` then `100lvh` (cascade fallback for browsers without `lvh`). `lvh` keeps the picture covering the viewport in every browser-chrome state. One number drives the media band, the copy block, and the estimate band.
3. `.heroContent` carries `min-height: calc(var(--heroMediaHeight) - var(--headerHeight) - 3rem)` — this is the `min-height` that used to live on `.heroSection`, moved onto the block it actually describes. It makes the copy end exactly on the seam whatever it measures, so the card always arrives at the fold.
4. `.heroSection::after` paints the estimate band from `var(--heroMediaHeight)` to the section bottom, opening in `--colorNearBlack` and settling into `--colorCharcoal` — its own background, starting in the exact colour the photograph fades into.
5. `.estimateFormCard` gets `margin-top: -4.5rem` against the `3rem` grid gap, so it rides 24px up over the seam for the layered edge.

**The fade is on `.heroOverlay`, not on `.heroPlate`.** The obvious approach — a bottom `mask-image` on the plates — would have overwritten `.heroPlateAfter`'s `mask-image`, which *is* the sweep animation. Putting the fade in the overlay's existing 180deg gradient (final stop `var(--colorNearBlack) 100%`) reaches the same result, improves contrast under the stats, and leaves the sweep alone. A validator check now asserts no mobile `.heroPlate` rule sets `mask-image`.

Desktop is untouched: every one of these rules lives inside the `1080px` query, and `--heroMediaHeight` does not exist above it.

### Issue 2 — before/after stopped alternating

**Cause.** `fireHeroReverseDissolve()` was fire-and-forget. It set `isDissolving`, then scheduled cleanup — remove `isRevealed`, remove `isDissolving`, under `isResetting` so nothing transitions — on a `1800ms` timer. The loop, however, only waited `emptyBreathMs` (220ms) before starting the next phrase.

So the cleanup timer from cycle N could fire *during* cycle N+1. When it did, it stripped the `isRevealed` that N+1 had just added: the AFTER plate snapped away mid-sweep and the next reveal had to wait a full phrase. That is exactly the reported "Before → After → Before → long pause → starts again". Whether a given cycle collided depended on phrase length, which is why it looked intermittent.

**Fix.** The dissolve now returns a promise that resolves only once the plate is fully back to BEFORE with its classes clean, and the loop awaits it. The cycle is strictly sequential and no timer can outlive the cycle that created it.

The dissolve's own timer stays deliberately unpaused. The CSS opacity transition cannot pause either, so an in-flight dissolve always finishes — which is the etiquette the existing comment describes. The loop takes its pause at the breath that follows.

Also hardened `fireHeroForwardSweepAndWait()`: it waited on the AFTER plate's `load` event when the image was not ready, so an image that failed to load would leave the promise unresolved and the hero dead forever. It now resolves on `error` too, degrading to a BEFORE-only hero rather than stopping.

### Issue 3 — hero image

`graphics/images/hero_after.JPG` was replaced with a new 549KB image in `fb15070`, but it arrived on disk as `hero_after.jpg`. Windows is case-insensitive so git kept tracking the uppercase name while the working tree held the lowercase one. Nothing was broken today, but GitHub Pages is case-sensitive and the mismatch was one careless `git add` away from a 404 on the homepage hero.

Normalized via a two-step `git mv` and updated all 3 references. Both plates are `2048x1536` and both declare `width="2048" height="1536"`, so the swap is ratio-identical — no distortion, no layout shift.

### Validation Performed

- **Hero loop harness** — loaded the real `js/indexJS.js` into a VM with mocked DOM and a virtual clock, ran the actual `runHeroDuetLoop()` for **10 minutes of page time**, and recorded every class mutation on the AFTER plate.
  - Fixed code: **92 complete cycles, perfectly alternating**, cadence **6.13s min / 6.50s avg / 6.94s max**, zero clipped reveals. The sub-second spread is the randomized per-character typing speed, which is the intended human feel.
  - **The same harness run against the pre-fix code from `HEAD` fails**: 90 of 108 reveals cut short by a stale reset (the worst held the AFTER plate for 58ms), cadence swinging 4.32s–9.74s. The test demonstrably catches the bug it claims to fix.
- **Hero layout validator** — parses the real stylesheet, extracts the placement declarations, and computes the seam on five viewports. At 360×640, 390×844, 430×932, 768×1024, and 1024×1366 the copy block ends **exactly** on the media seam (0px error) and the card overlaps it by **24px** every time. Also asserts desktop is untouched, the media layer is bounded, the band opens in the seam colour, and no mobile rule overwrites the plate mask.
- Sitewide validator unchanged: 14 pages, **1,372 links and assets, zero broken**.
- `node --check js/indexJS.js` clean; `styleIndex.css` braces balanced; Apps Script harness still **64/64**.

### Honest Limitation

**No browser was run.** This environment has no Playwright or Chrome DevTools MCP, so there are no screenshots and no real rendered measurement. Everything above is static analysis plus a faithful simulation of the shipped JavaScript. The geometry and the loop are verified; the *look* of the seam on a real device is not. Someone should open the homepage on a phone before launch — that check is listed in `technicalDebt.md`.

### Lessons Learned

- **A passing test proves nothing until it has failed.** The loop harness was worth writing only because running it against the old code reproduced the exact reported symptom. Before that it was decoration.
- **The first harness run found my own bug, not the product's.** It reported two concurrent loops; `indexJS.js` already calls `initializeHeroDuet()` at module scope, and the harness called it again. Reading the trace rather than trusting the summary is what caught it.
- **When a layer's size is wrong, look at what is driving it.** The instruction not to simply reduce the hero height was the right call: an absolutely-positioned `inset: 0` layer is coupled to its container's content, and every fix that is not decoupling is a workaround.

---

## 2026-08-02 (session 2) — Phase 2A verification + Phase 2B service area pages

### Summary

Verified Phase 2A was genuinely finished rather than trusting the previous entry, then built Phase 2B's first wave: **six forestry mulching location pages** covering the cities `seoPlan.md` stages as the Phase 7 build set, and wired every service-area link on the site to them.

Phase 2A needed no code. The harness still reports 64/64, the deployment runbook is complete, and `estimateEndpoint` is still empty — exactly the state the previous session described. The only remaining 2A work is the Google Apps Script deployment, which requires credentials no engineering session has.

The site went from "13 cities advertised in the nav, all 13 pointing at one anchor" to "6 real, locally specific landing pages that a competitor cannot produce by find-and-replace."

### Files Created

**Location pages** (`locations/`)
- `forestry-mulching-ashland-ky.html`
- `forestry-mulching-portsmouth-oh.html`
- `forestry-mulching-ironton-oh.html`
- `forestry-mulching-chillicothe-oh.html`
- `forestry-mulching-grayson-ky.html`
- `forestry-mulching-morehead-ky.html`

### Files Modified

- `index.html` — 6 mega-menu cities and 6 mobile-menu cities repointed at their pages; 6 footer cities became links; new "Forestry mulching, town by town" block added inside `#serviceAreas`; Rowan County added to `LocalBusiness` `areaServed`, the static map panel list, and both copies of the "Do you travel to my county?" answer
- `services/forestryMulching.html` — same 18 chrome link changes, plus a new **"Where We Work"** section linking all 6 location pages. This is the parent page for the location tier and the only place body content links down to it
- `services/{landClearing,brushRemoval,trailCutting,stormCleanup,propertyCleanup,huntingPropertyPrep}.html` — 18 chrome link changes each
- `css/stylePages.css` — activated the dormant `SERVICE AREA PAGES (locations/)` block; added `.localSection`, `.localProse`, `.localProblemGrid`; changed `.nearbyList` from styling `a` to styling `li`
- `css/styleIndex.css` — `.serviceAreaTowns` / `.serviceAreaTownsLabel` / `.serviceAreaTownList` for the new homepage block
- `js/indexJS.js` — `rowan` added to `serviceRegions`, TODO-marked for client confirmation

### Architecture Decisions

1. **Six pages, not thirteen.** `seoPlan.md` rows 1–6 with genuinely local content, over 13 pages that would read as doorway pages. The nav advertises 13 cities; the 7 without pages still point at the `#serviceAreas` anchor rather than getting a shell.
2. **Reused the existing tier, added nothing structural.** `css/stylePages.css` already carried an unused `.localFactGrid` / `.localServiceList` / `.nearbyList` block, and `getSourcePage()` in `js/indexJS.js` already special-cased a `locations/` folder — the previous session pre-wired for this. Three new CSS rules were all the tier needed.
3. **Location pages link up, never sideways.** Per `seoPlan.md`'s Internal Linking Map: each page links to its parent service page, the homepage, and all 7 services. Nearby towns are rendered as plain text pills, which is why `.nearbyList` was changed from styling `a` to styling `li`. A validator check enforces this on the `<main>` content of every location page.
4. **Sitewide chrome does link to location pages, deliberately.** `seoPlan.md` rule 4 explicitly blesses "an inbound link from the mega menu", and making the shared header page-type-dependent across 14 files would be a maintenance trap. The no-sideways-links rule is enforced where it matters — body content.
5. **Breadcrumb is Home › Forestry Mulching › City,** not the `seoPlan.md` sketch of Home › Locations › Page. There is no `locations/` hub page yet (that is Phase 13), so a "Locations" crumb would have pointed at nothing. Every crumb in the shipped version resolves.
6. **No dollar figures.** `seoPlan.md` content rule 5 asks for real cost ranges, and no pricing has been approved by the client — the 7 existing service pages quote none either. Each cost FAQ instead answers with the factors that move the price on that county's specific ground, which is honest and still locally unique. Logged as a client ask, because supplying ranges is the single strongest upgrade available to these pages.
7. **No galleries on location pages.** 13 photos exist for 14 pages and none can be honestly captioned to a named town. Consistent with the Phase 1 decision on `stormCleanup` and `huntingPropertyPrep`.
8. **The assembler stays in the scratchpad.** Pages were generated once from a guarded splice of `services/forestryMulching.html` plus a content data file, then committed as plain static HTML — the same technique the previous session used. It is deliberately **not** checked in: Phase 13 (`phasePrompts/phase13ServiceAreaExpansion.md`) builds the real generator, and shipping a half-generator now would leave two competing sources of truth.
9. **Rowan County added to the coverage data.** Morehead was advertised in the nav on all 8 pages but Rowan County appeared in none of the four places the site lists counties. Publishing a Morehead page while the schema denied coverage would be worse. Added and TODO-marked rather than silently expanded.

### Validation Performed

- **14 pages, 1,372 internal links and assets checked, zero broken.** Every same-page anchor resolves to an id on that page; every cross-page anchor resolves to an id on the target page
- One `<h1>` per page; zero duplicate IDs; tag balance verified across 16 element types
- Every JSON-LD block parses; every `FAQPage` question is verified to actually render in the markup
- Titles and meta descriptions **unique across all 14 pages**
- `serviceNeeded` enum identical across all 14 pages and `appsScript/config.gs` (compared on values, since the homepage uses CRLF and interior pages LF)
- Every location page preselects `Forestry Mulching` in the embedded form
- Each built city has at least 3 links per page (mega menu, mobile menu, footer); no built city still points at `#serviceAreas`; all 6 are reachable from the parent service page
- **Uniqueness gate:** worst pairwise 5-word-phrase overlap between location pages is **14.7%** against a 25% threshold; body copy 1,133–1,283 words per page
- CSS braces balanced in both stylesheets; every class used in new markup exists in a stylesheet
- `node --check js/indexJS.js` clean
- `node appsScript/localTestRunner.js` — **64/64**, `runSelfTest` 6/6, unchanged
- CTA destinations enumerated on a finished page and confirmed: hero and floating estimate → `#estimateForm` (present), phone → `tel:` with `data-confighref`, footer "View Our Work" → `../index.html#beforeAfter`, Facebook → the real page

### Bugs Found

**Introduced by me during this session, caught by the guards**

1. Generated pages shipped **mixed line endings** — CRLF from the template literals in the generator, LF from the chrome spliced out of `services/forestryMulching.html`. Normalized to LF to match the sibling `services/*.html` files.
2. The first build aborted on an unescaped-ampersand guard that was matching `META & SEO` inside HTML comments. The guard was wrong, not the output — fixed to strip comments before checking.
3. The `serviceNeeded` drift check compared raw text and flagged all 13 interior pages. The enum values were identical; only indentation and line endings differed. Fixed to compare normalized values.
4. `.nearbyList` carried a `2rem` top margin from the previous session, which stacked with the `3.2rem` bottom margin of the `.sectionLede` above it. Changed to `0 0 2.4rem`.

**Pre-existing, found but not in scope**

5. `servicePageArchitecture.md` says the current service should be highlighted in the mega menu on its own page. It is not — the header block is byte-identical across all 7 service pages. Logged in `technicalDebt.md`.

### Important Decisions Made

- **Morehead was kept in the first wave** even though Rowan County sat outside the documented coverage map, because `seoPlan.md` lists it as row 6 and the nav has always advertised it. The coverage data was corrected to match rather than the page being dropped.
- **West Union, OH and Flatwoods, KY are advertised in the nav but appear nowhere in `seoPlan.md`'s 11-city table.** Not resolved this session — flagged in `projectState.md` as a decision: give them pages or take them out of the nav.
- **`locations/` was the only new folder created**, and it is the folder `servicePageArchitecture.md` and `seoPlan.md` both specify.

### Lessons Learned

- **A dormant CSS block is a design decision left in the repo.** `stylePages.css` had `.localFactGrid`, `.localServiceList`, and `.nearbyList` written and unused. Reading them first shaped the page anatomy and meant three new rules instead of a new stylesheet.
- **Write the uniqueness test before writing the pages.** A 5-word-shingle overlap check turns "don't build doorway pages" from an intention into a number. 14.7% against a 25% gate is a fact; "these feel different" is not.
- **Guards catch your own mistakes, not other people's.** All four bugs this session were mine, and three were caught by assertions written before the code ran. The mixed-line-endings one was caught by an audit added only because the enum comparison failed for an unrelated whitespace reason — worth remembering that a false positive can still point at something real.
- **A validator that only checks the new work is worth half as much.** Running the link and structure checks across all 14 pages, not just the 6 new ones, is what confirmed the chrome rewiring landed identically everywhere.

---

## 2026-08-02 — Website completion + lead capture infrastructure

### Summary

Two phases in one session. **Phase 1** completed the website: built the 7 missing service pages that fixed 28 broken links, removed the fabricated review carousel, and repurposed the homepage's second section into a video-ready owner introduction. **Phase 2A** built the entire lead capture backend: a modular Apps Script web app, an `errorLog` sheet, owner-only email notification, and a Node test harness proving the pipeline works before deployment.

The site went from "every Learn More link 404s and the contact form fakes success" to "code-complete, pending one deployment URL."

### Files Created

**Website**
- `services/forestryMulching.html`
- `services/landClearing.html`
- `services/brushRemoval.html`
- `services/trailCutting.html`
- `services/stormCleanup.html`
- `services/propertyCleanup.html`
- `services/huntingPropertyPrep.html`
- `css/stylePages.css`

**Apps Script**
- `appsScript/Code.gs` — entry points, `setupSpreadsheet()`, `removeObsoleteConfigKeys()`, `runSelfTest()`
- `appsScript/routes.gs` — action registry
- `appsScript/leads.gs` — `LEADS_HEADERS`, create/list/update
- `appsScript/validation.gs` — sanitization, validators, honeypot, formula-injection defense
- `appsScript/notifications.gs` — owner email, auto-reply
- `appsScript/utilities.gs` — sheet access, header enforcement, config, envelopes, auth, error logging
- `appsScript/config.gs` — constants, enums, limits, error codes
- `appsScript/localTestRunner.js` — Node mock harness (dev tool; not pasted into Apps Script)
- `appsScript/README.md`

**Docs**
- `docs/googleSheetArchitecture.md`
- `docs/projectState.md`
- `docs/engineeringJournal.md`
- `docs/technicalDebt.md`

### Files Modified

- `index.html` — reviews section replaced and relocated; second section repurposed to `#meetTheOwner`; divider added between Facebook and Reviews
- `css/styleIndex.css` — marquee CSS removed (102 lines); intro-section and reviews-placeholder styles added; `.introLayout` responsive rule
- `js/indexJS.js` — intro video config + `buildVideoEmbedSource()` + `initializeIntroVideo()`; null guards on every page-specific listener; `getSourcePage()` folder fix; `companyWebsite` added to payload; `showSubmissionError()`; endpoint TODO promoted to a blocker note; Google link hidden when unconfigured

### Architecture Decisions

1. **Static duplication of shared chrome across pages.** No build step exists, so header/modal/footer/floating actions are duplicated into each service page. Mitigated by generating them from `index.html` via a guarded assembler rather than hand-copying, and by `applyBusinessConfig()` driving phone/email/social from one place at runtime.
2. **Each service page embeds the full estimate form + modal** rather than deep-linking to the homepage form. Follows `servicePageArchitecture.md` and preserves in-page conversion.
3. **Sheet-first lead capture.** The `leads` row is the audit trail; a submission succeeds the moment it commits. Notifications run after, wrapped independently, and cannot un-succeed a saved lead.
4. **`errorLog` only, no ActivityLog.** The `leads` sheet already records every success; a second log of successful traffic would add noise and quota cost without adding information.
5. **Owner-only notification.** Nulo Studio is not copied and does not sit in the customer's email thread. Operational problems surface in `errorLog` instead of an inbox.
6. **`text/plain` transport retained.** Apps Script web apps cannot answer a CORS preflight; `application/json` would trigger one and fail from the browser. Encoded the constraint rather than fighting it.
7. **Apps Script lives inside this repo** at `appsScript/`, not the external `C:\Dev\NuloWorkspace\BlueGridAPI\` path named in `phase10AppsScriptApi.md` — that path is outside the writable workspace.

### Validation Performed

- All 7 `.gs` files parse cleanly; **72 globals, zero collisions** (Apps Script shares one global scope, so this matters)
- `js/indexJS.js` passes `node --check`
- `css/styleIndex.css` braces balanced 523/523
- All 8 HTML pages: tags balanced across 12 element types, exactly one `<h1>` each, **zero duplicate IDs**, zero leftover build tokens
- **Zero broken internal links or missing assets** sitewide
- `serviceNeeded` enum **byte-identical** across all 8 pages and `config.gs`
- All 20 payload keys map to columns; all 8 server-authoritative fields correctly excluded from client input
- `LEADS_HEADERS` = 27 columns, matching `forestryModuleSchema.md` exactly
- **`localTestRunner.js`: 64/64 passing**, including built-in `runSelfTest` 6/6 — covers setup idempotency (3 runs), create, dedupe, honeypot, every validation rule, error logging, formula injection, header self-heal, auth, update, `NOT_FOUND`, `UNKNOWN_ACTION`
- Two guarantees explicitly tested: **email failure still saves the lead**, and **no Nulo Studio address appears in any sent message**

### Bugs Found

**Pre-existing**
1. 28 broken links — every service link sitewide 404'd
2. Contact form silently faked success; leads went nowhere
3. Footer Google icon was a live `href="#"` with `target="_blank"` — opened a blank tab
4. `getSourcePage()` collapsed folders, so all service-page leads would have reported ambiguous source pages
5. Unguarded JS listeners would throw on any page without the modal
6. `viewWorkButton` called `.scrollIntoView()` on a null `#beforeAfter` on subpages
7. 102 lines of dead marquee CSS
8. Badge artwork reads **"FORESTRV"** instead of "FORESTRY" (verified against `bluegridBadge400.png`)

**Introduced by me during this session, caught in review**
9. `<figcaption>` nested inside a `<div>` instead of being a direct child of `<figure>` — invalid HTML
10. `sanitizeText()` control-character regex was written with **literal raw control bytes** (0, 8, 11, 12, 31, 127) embedded in the source, producing a malformed character class
11. Notification failures could fall through to the outer catch and report **failure for a lead that was already written**
12. `setupSpreadsheet()` did not create the `dashboardMetrics` tab
13. After generalising `enforceCanonicalHeaders(sheet, headers)`, two lines still referenced `LEADS_HEADERS` — the `errorLog` sheet would have had its headers rewritten on **every single access**
14. Referenced `.introAside` / `.introCta` classes that were never styled
15. Unused `failNextSheetWrite` left in the test runner

### Bugs Fixed

All fifteen above, except **#8 (FORESTRV typo)**, which requires corrected artwork from the client and is logged in `technicalDebt.md`.

### Important Decisions Made

- **Reviews placeholder placed after the Facebook section** (user-approved from three options), with a `dividerFadeUp` added — this also fixed a pre-existing abrupt dark→light transition
- **Client supplied the reviews copy** mid-session; used verbatim, with brand spelling normalised to "BlueGrid" for sitewide consistency
- **Section slot preserved, not deleted** — the second section was repurposed into the video section; only the 24 fabricated review cards were removed
- **Nulo Studio notification removed** after initially being implemented as a `cc` (client direction)
- **Committed to branch `phase2a-lead-capture`, not `main`**, so the work can be reviewed before merging. Nothing pushed
- **Single commit covering both phases** — `js/indexJS.js` contains changes from both, and splitting would have required interactive hunk staging

### Lessons Learned

- **Boundary guards are worth the extra step.** After a user request, every removal/replacement over 50 lines asserted expected content at each boundary and threw on mismatch. This caught nothing silently and made a 406-line deletion and a 278-line CSS replacement safe.
- **Refactoring a function signature demands re-reading the body.** Bug #13 (`enforceCanonicalHeaders`) parsed fine, passed a syntax check, and would have quietly corrupted the `errorLog` headers forever. Only reading the refactored body caught it.
- **Write literal control characters as escapes.** Bug #10 survived a file write and looked plausible; only a byte dump revealed raw control bytes in the regex.
- **Verify before asserting.** The "FORESTRV" typo came from prior project notes; it was confirmed by opening the actual PNG rather than repeating the claim.
- **A mock harness pays for itself immediately.** Being able to run the real `.gs` modules on Node found real defects and proved both client-mandated guarantees without a Google account.
- **Shell command length is a real limit.** A single large PowerShell here-string failed with `ENAMETOOLONG`; the fix was a token-based approach — write the page with the file tool, then splice shared chrome with a short reusable command.
- **VM contexts don't expose top-level `const`.** Function declarations become properties of the sandbox; `const` does not. Needed an explicit re-export bootstrap in the test runner.

---

## Superseded Handoff (2026-08-02)

The handoff block that stood here described Phase 2A as the frontier and the
endpoint as unwired. Both are long since done. **The current handoff is the
"Next Session Should Continue Here" block at the top of this file**, under the
2026-08-04 session summary. Kept as a marker so a reader who scrolls to the
bottom is not misled by stale instructions.
