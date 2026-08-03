# Project State — BlueGrid Land Solutions

**Last updated:** 2026-08-02
**Repository:** `c:/Dev/NuloWorkspace/ClientSites/client_BluegridLandSolutions/`
**Branch:** `phase2a-lead-capture` (branched from `main`, not yet merged, nothing pushed)

> Source of truth for resuming work. Only verified, completed work is recorded here.

---

## Current Phase

**Phase 2A — Lead Capture Infrastructure: code-complete.**

Everything remaining in 2A is account-level work requiring Google credentials. No further code is needed from an engineering session to finish it.

Phase 2B (SEO / service area pages) has **not** been started.

---

## Overall Objective

Take the existing BlueGrid Land Solutions website from "built but not launchable" to production launch:

1. Repair missing functionality and broken navigation
2. Complete missing content (service pages, service area pages)
3. Wire lead capture end to end (website → Apps Script → Sheet → owner email)
4. Final SEO, performance, and launch validation

---

## Completed

### Phase 1 — Website Completion

- **Full site audit.** Found 28 broken links (mega menu, mobile menu, 7 service cards, footer all pointed at `services/*.html` — none existed), no location pages, fabricated reviews, dead footer link, and a form that faked success.
- **7 service pages built** — `services/`: `forestryMulching`, `landClearing`, `brushRemoval`, `trailCutting`, `stormCleanup`, `propertyCleanup`, `huntingPropertyPrep`. **All 28 broken links now resolve.**
  Each has a unique hero + H1, intent block, 6 benefits, 4-step process, 5 unique FAQs, embedded estimate form with `serviceNeeded` preselected, related-services block, and breadcrumb — per `servicePageArchitecture.md`. **5 of 7 also have a gallery**; `stormCleanup` and `huntingPropertyPrep` ship without one because no apt photos exist (see `technicalDebt.md` item 7). Titles/descriptions taken verbatim from `seoPlan.md`. Three JSON-LD blocks per page (`Service`, `BreadcrumbList`, `FAQPage`). No duplicate content between pages.
- **`css/stylePages.css` created** — the shared interior-page stylesheet `servicePageArchitecture.md` specifies. Reuses existing tokens, buttons, forms, FAQ, and animation engine; no duplicated components.
- **Fabricated review carousel removed** (24 cards / 406 lines) and replaced with an honest placeholder using **client-supplied copy** ("Building Our Reputation One Property at a Time"), relocated below the Facebook section per the approved page flow.
- **Second section repurposed** into a video-ready owner introduction (`#meetTheOwner`) — headline, supporting copy, 16:9 embed container with play mark and "Introduction video coming soon", plus a supporting aside. The section slot was preserved, not deleted.
- **Video embed wired for later** — set `businessConfig.introVideoUrl` + `introVideoConfigured` in `js/indexJS.js` and nothing else. `buildVideoEmbedSource()` auto-detects YouTube (→ `youtube-nocookie`), Vimeo, or falls back to a self-hosted `<video>`.
- **Homepage flow confirmed** against the approved order: Hero → Trust Bar → Chase Intro Video → Services → Before & After → Why → Process → Service Areas → Facebook → Reviews → FAQ → Contact.
- **Dead code removed** — 102 lines of orphaned marquee CSS + all `[data-animate="reviewRow"]` rules. Zero references remain.
- **Bug fixes:** invalid `<figcaption>` nesting; dead footer Google link (now hidden until `googleBusinessUrl` is set); `getSourcePage()` was collapsing folders, losing per-page lead attribution; every page-specific JS listener null-guarded so the shared script survives on subpages; `viewWorkButton` no longer throws when `#beforeAfter` is absent.
- Added a dark→light divider between Facebook and Reviews, fixing a pre-existing abrupt transition.

### Phase 2A — Lead Capture Infrastructure

- **Apps Script web app written** — `appsScript/`: `Code.gs`, `routes.gs`, `leads.gs`, `validation.gs`, `notifications.gs`, `utilities.gs`, `config.gs`. Modular, one responsibility per file.
- **27-column `LEADS_HEADERS` contract implemented exactly** as specified in `forestryModuleSchema.md` — verified programmatically, byte-for-byte.
- **Sheet-first architecture.** The `leads` row is the audit trail: a submission succeeds the moment the row commits. Notifications are best-effort and cannot un-succeed a saved lead.
- **`errorLog` sheet** — failures only (timestamp, leadId, functionName, errorMessage, stackTrace). Records sheet-write failures, email delivery failures, validation failures, unexpected exceptions. **No ActivityLog** — the `leads` sheet already records every success.
- **Owner-only notification.** `Bluegridls@gmail.com` is the sole recipient; `replyTo` is the customer. Nulo Studio is not copied and does not sit in the customer thread. Plain-text + HTML bodies, both leading with name / phone / email / message / timestamp.
- **Customer auto-reply** with reference number, gated by `autoReplyEnabled`.
- **Security & robustness:** server-side honeypot, sanitization with control-character stripping, per-field validation, formula-injection defense, `LockService` locking, idempotent dedupe by `leadId`, canonical header self-heal on both sheets, plain-text cell forcing, recursion-guarded error logging that never records personal data.
- **`setupSpreadsheet()` is fully idempotent** — re-running creates no duplicate sheets, headers, config rows, or named ranges, and removes config keys retired by architecture changes.
- **Website form wired** — honeypot sent for server-side checking, non-OK HTTP handled, API field errors mapped back onto the actual inputs.
- **`localTestRunner.js`** — Node harness running the real `.gs` modules against in-memory Google mocks. **64/64 passing**, including the built-in `runSelfTest` at **6/6**.
- **Documentation:** `appsScript/README.md` (endpoints, 10-step deployment sequence, 12-case manual test plan) and `docs/googleSheetArchitecture.md` (tabs, columns, dropdowns, config keys, named ranges, Script Properties, verification checklist).

---

## Currently In Progress

Nothing. Phase 2A is code-complete and committed. The session ended at a clean stopping point.

---

## Remaining Tasks

### Phase 2A closeout (no code required)
1. Create the `BlueGrid Leads` spreadsheet
2. Paste the 7 `.gs` files, set `MODULE_API_KEY`, run `setupSpreadsheet()` then `runSelfTest()`
3. Deploy as Web App (Execute as **Me**, Access **Anyone**)
4. Paste the `/exec` URL into `businessConfig.estimateEndpoint`
5. Live end-to-end verification

### Phase 2B (not started)
6. Service area / location pages — **0 of 13 built**; all 13 city links in nav and mobile menu still point at the `#serviceAreas` anchor, and footer cities are plain text, not links
7. `robots.txt`
8. `sitemap.xml`
9. Canonical URL finalization across all pages (8 today, 21 once location pages ship)
10. Open Graph finalization (absolute URLs)
11. Lighthouse / performance pass

---

## Blockers

| # | Blocker | Impact |
|---|---------|--------|
| 1 | **`businessConfig.estimateEndpoint` is empty** | The form **simulates success** — nothing reaches a sheet, no email sends. Console warns loudly. This is the single launch blocker. |
| 2 | `MODULE_API_KEY` not generated | `leads.list` / `leads.update` unusable (dashboard, Phase 2). Does not block the public form. |
| 3 | `BlueGrid Leads` spreadsheet does not exist | Nothing to write to. |
| 4 | Production domain undecided | Canonical says `www.bluegridlandsolutions.com`; `CNAME` says `bluegridlandsolutions.nulostudio.com`. Blocks sitemap.xml, canonicals, and OG absolute URLs (8 pages today, 21 once location pages ship). |

---

## Waiting on Client (Chase)

- **Owner introduction video** — section is built and video-ready; placeholder ships until supplied
- **Real project photos** — 3 service cards on the homepage still hotlink Unsplash stock (trail, property cleanup, hunting). Photo library is thin: 13 images total, several reused across pages
- **Confirm phone number** `(740) 464-2526` (TODO-marked, sourced from the flyer)
- **Confirm business email** — `estimates@bluegridlandsolutions.com` is a placeholder
- **Confirm Facebook page renders in the Page Plugin** → flip `facebookPageConfigured` to `true`
- **Google Business Profile URL** — none exists yet; footer icon stays hidden until provided
- **Decision:** may we name Chase on the site? Currently written as "the owner" throughout
- **Badge artwork typo** — the official badge reads **"FORESTRV"** instead of "FORESTRY" (verified 2026-08-02). Appears on every page. Needs a corrected asset before launch or print

## Waiting on Aron

- **Google Apps Script deployment** — full sequence in `appsScript/README.md`
- **Decision: which Google account deploys.** `MailApp` sends *from the deploying account*, so that address becomes the "From" on Chase's alerts and every customer auto-reply. Changing it later means redeploying under the other account
- **Domain purchase / decision** — see Blocker 4
- **Location page scope** — nav advertises 13 cities; `seoPlan.md` stages 11 with a 6-city first wave. Recommend the 6-city wave with genuinely local content over 13 thin pages
- **Final launch approval**
- **Merge `phase2a-lead-capture` into `main`** when satisfied

---

## Next Recommended Task

**Deploy the Apps Script and paste the `/exec` URL.** It is the only thing standing between the current build and a site that actually captures leads, it needs no further engineering, and it unblocks live verification of the entire pipeline.

If deployment is not yet possible, the next engineering task is **service area pages** — but the production domain (Blocker 4) should be settled first so canonicals and internal links are written once rather than twice.
