# Phase 5 Prompt — Lead Automations (Zapier vs. Apps Script Native)

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

---

You are designing and implementing the lead automation layer for the Forestry Module.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching and land clearing, Southern Ohio + Eastern Kentucky. Solo owner-operator; every new lead is money and speed-to-contact wins jobs.
- **Existing system (Nulo Edge pattern):** BlueGrid website form → Apps Script web app (`BlueGridAPI`, local project `C:\Dev\NuloWorkspace\BlueGridAPI\`) → Google Sheet `BlueGrid Leads` (`leads` tab) → dashboard SPA. The API's `leads.create` appends one row per lead.
- **Authoritative schema:** `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\docs\forestryModuleSchema.md`.
- Relevant lead fields: `leadId`, `submittedAt`, `fullName`, `phone`, `email`, `propertyAddress`, `serviceNeeded`, `projectDescription`, `preferredContactMethod`, `preferredTime`, `status`.
- The `config` tab already carries: `notificationEmail`, `notificationsEnabled`, `autoReplyEnabled`, `weeklySummaryDay`.

## Required Automations

| # | Automation | Trigger | Content |
|---|-----------|---------|---------|
| 1 | New-lead alert to owner | Lead row created | All contact fields + service + description; subject like `New Lead: Forestry Mulching — Dale Compton (Ashland)`. Owner wants SMS-speed awareness. |
| 2 | Auto-reply to the lead | Lead row created (only if `email` valid) | Confirms receipt, sets expectation ("you'll hear from us within one business day"), includes the owner's phone, echoes the `leadId` reference. Plain, human tone — no marketing blast formatting. |
| 3 | Weekly summary to owner | Weekly on `weeklySummaryDay` | Counts by `status`, new leads this week (name/service/city), active estimate value, oldest untouched `new` lead. |

## Architecture Decision You Must Apply

Prefer Apps Script-native automation; use Zapier only where it genuinely adds capability. Rationale to encode in the deliverable:

| Automation | Recommended | Why |
|------------|-------------|-----|
| 1 — owner email alert | **Apps Script native** — send with `MailApp.sendEmail` inside `leads.create` (already specced in Phase 10) | Zero latency, zero cost, no third-party dependency, no polling delay. Zapier's Sheets trigger polls (1–15 min) — too slow for lead response. |
| 1 — owner SMS alert | **Two options, owner chooses:** (a) email-to-SMS gateway address in `notificationEmail` list (free, carrier-dependent), or (b) Zapier: Webhooks by Zapier (catch hook called from Apps Script via `UrlFetchApp`) → SMS step | SMS is the one thing Apps Script cannot do natively. If Zapier is used, trigger it by webhook from the API, not by sheet polling. |
| 2 — auto-reply | **Apps Script native** (`MailApp.sendEmail` in `leads.create`, gated by `autoReplyEnabled`) | Same reasons; also keeps the lead's email out of a third-party processor. |
| 3 — weekly summary | **Apps Script native** — time-driven trigger (weekly, per `weeklySummaryDay`) running a `sendWeeklySummary()` function that reads the sheet | A scheduled read + one email is exactly what time-driven triggers exist for. Zapier here is pure overhead. |

Net: Zapier is optional and only enters if the owner wants true SMS without carrier gateways. Document this decision; do not build a Zap that polls the sheet.

## Deliverables

1. `notifications.gs` additions to the `BlueGridAPI` local project (`C:\Dev\NuloWorkspace\BlueGridAPI\`):
   - `sendNewLeadAlert(lead)` and `sendLeadAutoReply(lead)` — called from `leads.create`, each gated by its config flag, each wrapped so a mail failure never fails the lead write.
   - `sendWeeklySummary()` — reads the `leads` tab, composes the summary, sends to `notificationEmail`.
   - Optional `notifyZapierWebhook(lead)` — `UrlFetchApp.fetch` POST to a webhook URL stored in `config` as `zapierWebhookUrl` (skip silently when blank).
   - Follow `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\codeStyle.md` (section banners, camelCase, expanded formatting).
2. `docs/automationSetup.md` in `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\docs\`:
   - Exact steps to create the weekly time-driven trigger in the Apps Script editor.
   - MailApp daily quota note (consumer Gmail ~100 recipients/day — far above expected lead volume, but say it).
   - The Zapier SMS recipe (webhook trigger → SMS action), marked optional, with the config key to set.
   - Email templates for automations 1–3 (exact subject + body with `{{field}}` placeholders).

## Acceptance Criteria

- [ ] Test lead through `leads.create` produces the owner alert and (when `email` present) the auto-reply within seconds.
- [ ] Setting `notificationsEnabled` / `autoReplyEnabled` to `false` in `config` suppresses the respective email without code changes.
- [ ] A thrown mail error does not prevent the lead row from being written (lead capture is sacred; notifications are best-effort).
- [ ] `sendWeeklySummary()` run manually produces a correct summary against seeded test rows.
- [ ] `docs/automationSetup.md` is complete enough for a non-developer to configure triggers and the optional Zap.

## Outputs Required for Later Phases

- Phase 8 (launch checklist) smoke test depends on automation 1 firing on the live endpoint.
- The `zapierWebhookUrl` config key convention, for any future automation (CRM push, calendar booking) — extend `config`, never hardcode.
