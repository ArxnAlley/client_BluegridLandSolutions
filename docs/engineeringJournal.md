# Engineering Journal — BlueGrid Land Solutions

Append-only. Newest entry at the top.

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

## Next Session Should Continue Here

**Phase 2A is code-complete and committed** (`e976626` on `phase2a-lead-capture`). Nothing is half-finished.

1. **Read `docs/projectState.md` first** — it is the source of truth for status, blockers, and who owes what.
2. **The single launch blocker is deployment.** `businessConfig.estimateEndpoint` in `js/indexJS.js` is empty, so the form simulates success. Follow the 10-step sequence in `appsScript/README.md`. No code changes needed beyond pasting the `/exec` URL.
3. **Before writing any SEO work, settle the production domain.** Canonical says `www.bluegridlandsolutions.com`; `CNAME` says `bluegridlandsolutions.nulostudio.com`. Sitemap, canonicals, and OG absolute URLs all depend on it (8 pages today, 21 once location pages ship) — writing them twice is avoidable.
4. **Phase 2B has not been started:** service area pages (0 of 13), `robots.txt`, `sitemap.xml`, canonical finalization, Open Graph, Lighthouse.
5. **Re-run `node appsScript/localTestRunner.js` after any `.gs` change.** Expect `passed: 64  failed: 0`.
6. Open decisions are listed under *Waiting on Client* and *Waiting on Aron* in `projectState.md` — the location-page count and the deploying Google account are the two that change engineering work.
