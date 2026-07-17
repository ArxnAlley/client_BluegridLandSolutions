# Phase Prompts — Index

BlueGrid Land Solutions · Forestry Module (Nulo Edge pattern) · Southern Ohio + Eastern Kentucky

Each file in this folder is a self-contained, copy-paste prompt for a fresh Claude Code session (Phase 4 is a Gemini-in-Sheets prompt). No prompt assumes prior conversation memory. Authoritative specs live one level up: `forestryModuleSchema.md` (data contract), `servicePageArchitecture.md`, `seoPlan.md`.

**Phase numbers are labels, not execution order.** Phases 10–13 were added after planning phases 2–9 exposed unplanned dependencies; Phase 10 in particular runs early. Follow the recommended order below.

## Index

| Phase | File | Purpose | Depends On | Status |
|-------|------|---------|------------|--------|
| 1 | — (separate build, in progress) | Marketing website + Free Estimate form at `NuloStudio\BluegridLandSolutions\` | — | In progress |
| 2 | `phase2NuloEdgeForestryModule.md` | Dashboard SPA (`BlueGridDashboard\`): pipeline board, lead detail, status/estimate updates | 10 (live API), 3/4 (sheet) | Not started |
| 3 | `phase3GoogleSheetArchitecture.md` | Spec for the `BlueGrid Leads` spreadsheet: tabs, `LEADS_HEADERS`, validation, protections, named ranges | Schema doc | Not started |
| 4 | `phase4GeminiDatabasePrompt.md` | Gemini-in-Sheets prompt that builds/verifies the spreadsheet per Phase 3 | 3 | Not started |
| 5 | `phase5Zapier.md` | Lead automations: owner alert, auto-reply, weekly summary (Apps Script-native first; Zapier only for SMS) | 10 | Not started |
| 6 | `phase6GoogleBusinessProfile.md` | GBP playbook: categories, services, service areas, photos, reviews, weekly posts | 1 live (8) helpful, not required | Not started |
| 7 | `phase7SeoContent.md` | Build 7 service pages + first 6 location pages + 5 article briefs | 1, `servicePageArchitecture.md`, `seoPlan.md` | Not started |
| 8 | `phase8LaunchChecklist.md` | Domain/DNS/hosting, TODO swaps, favicon/OG, 404, analytics, live form smoke test, sitemap/robots | 1, 10 (live endpoint), 5 (alert check) | Not started |
| 9 | `phase9QA.md` | Full QA: Lighthouse 90+, WCAG AA, device matrix, form E2E, reduced motion, structured data, link scan | 7, 8 | Not started |
| 10 | `phase10AppsScriptApi.md` | **Runs early.** Build + deploy `BlueGridAPI` (leads.create/list/update, dedupe, auth, header self-heal) | 3/4 (or self-heals sheet) | Not started |
| 11 | `phase11PhotoUploadService.md` | Photo transport: client downscale → base64 → Drive folder per lead → `photoUrls` | 8, 10 | Not started |
| 12 | `phase12ReviewsIntegration.md` | Curated review display (`reviewsData.js`) + Tier 2/3 upgrade path | 6, 8 | Not started |
| 13 | `phase13ServiceAreaExpansion.md` | Service-area data model + generated location pages at scale | 7 | Not started |

## Recommended Execution Order

```
1 (website, in progress)
→ 3 → 4 (spreadsheet spec → built in client's Workspace)
→ 10 (API deployed — unblocks everything below)
→ 2 (dashboard) and 5 (automations), in parallel
→ 8 (launch)
→ 6 (GBP) and 7 (SEO content), in parallel post-launch
→ 9 (QA, re-run after 7 ships)
→ 11 / 12 / 13 as post-launch enhancements, any order (13 only when scaling past ~12 location pages)
```

## Maintenance Rules

- Update the Status column here whenever a phase completes; record the completion date.
- If a phase changes a contract (`LEADS_HEADERS`, enums, endpoints), update `forestryModuleSchema.md` first, then every prompt that inlines the changed value — the prompts deliberately duplicate contract essentials so they stay self-contained.
- New unplanned work gets a new `phase14+` prompt file and a row here; nothing ships without a prompt.
