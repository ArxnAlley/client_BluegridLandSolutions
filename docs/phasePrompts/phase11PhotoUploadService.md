# Phase 11 Prompt — Photo Upload Service (Base64 → Drive)

Copy-paste this entire file into a fresh Claude Code session. It assumes zero prior context.

**Sequencing note:** post-launch enhancement. Requires the deployed `BlueGridAPI` web app (Phase 10) and the live website form (Phase 8). This closes the Phase 1 gap where the form records photo names but never transports the files.

---

You are adding real photo transport to the BlueGrid Land Solutions lead pipeline: property photos travel from the visitor's phone to a Google Drive folder per lead, and the dashboard shows them.

## Context

- **Client:** BlueGrid Land Solutions — forestry mulching and land clearing, Southern Ohio + Eastern Kentucky. Leads photograph their overgrown property; photos materially improve estimate accuracy.
- **Existing system (Nulo Edge pattern):** website (`C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\`) → Apps Script web app `BlueGridAPI` (`C:\Dev\NuloWorkspace\BlueGridAPI\`) → Google Sheet `BlueGrid Leads` → dashboard SPA (`C:\Dev\NuloWorkspace\BlueGridDashboard\`).
- **Code standards:** `C:\Dev\NuloWorkspace\NuloStudio\BluegridLandSolutions\codeStyle.md`.
- **Current Phase 1 behavior:** the form's file input populates only `photoCount` (number) and `photoNames` (JSON array of file names) on the lead record. The `photoUrls` column (N) already exists in the sheet contract, reserved and empty (`[]`) — no schema migration is needed; that was deliberate.
- **Contract (inline):** `LEADS_HEADERS` = `leadId, submittedAt, fullName, phone, email, propertyAddress, estimatedAcres, serviceNeeded, projectDescription, preferredContactMethod, preferredTime, photoCount, photoNames, photoUrls, sourcePage, leadSource, utmSource, utmMedium, utmCampaign, facebookCampaign, propertySize, terrainType, status, estimateAmount, assignedTo, internalNotes, lastUpdated`. Transport: POST `text/plain;charset=utf-8` JSON; envelope `{ success, data | error }`; dedupe key `leadId` (`^BG-\d{13}$`).

## Design (implement exactly)

### Website (client side)

1. Lead submit flow is unchanged and remains primary: `leads.create` first; photos are an enhancement that must never block or fail lead capture.
2. After `leads.create` succeeds, if files were selected: downscale each image on-canvas (longest edge ≤ 1600 px, JPEG quality ~0.8), cap at 6 photos and ~4 MB total encoded size (validate and message clearly), then POST to `?action=leads.addPhotos`:

```json
{
    "leadId": "BG-1768594832000",
    "photos": [
        { "name": "backLot1.jpg", "mimeType": "image/jpeg", "base64": "..." }
    ]
}
```

3. UI: per-photo progress state, success confirmation, and on failure a soft message ("Your request went through — photos didn't upload; we may text you for them") with one retry. Never show a failure state for the lead itself.

### API (`BlueGridAPI` additions)

1. New POST action `leads.addPhotos` registered in `routes.gs`. Public like `leads.create` but hard-gated: `leadId` must exist (else `NOT_FOUND`) — an unknown id writes nothing to Drive. Reject payloads over limits (count > 6, decoded size > ~5 MB total, non-image mimeTypes) with `VALIDATION_ERROR`.
2. Drive layout: parent folder `BlueGrid Lead Photos` (found-or-created by name, id cached in Script Properties) → subfolder per lead named `<leadId>` → decoded blobs saved with sanitized original names.
3. Each file: `setSharing(ANYONE_WITH_LINK, VIEW)` so dashboard thumbnails render without OAuth; store the file URLs.
4. Under `LockService`, merge new URLs into the lead's `photoUrls` JSON array (idempotent by file name within the lead: re-upload of the same name overwrites, not duplicates), update `photoCount`/`photoNames` to match reality, stamp `lastUpdated`.
5. Return `{ success: true, data: { leadId, photoUrls } }`.
6. Extend the Node mock suite: happy path, unknown leadId, oversize payload, non-image mime, name-collision idempotency, Drive failure mid-batch (partial URLs still recorded).

### Dashboard

- Lead detail photo section upgrades automatically: non-empty `photoUrls` renders a thumbnail grid (Drive `thumbnail` URL form or `<img>` on the file URL), click-through opens the Drive file in a new tab. Keep the Phase 1 fallback ("photos not yet uploaded") when the array is empty but `photoCount` > 0.

## Constraints To Respect

- Apps Script POST body practical limit is well above 4 MB, but keep the client cap conservative — rural cell connections are the norm for this audience.
- Base64 inflates size ~33%; the client cap applies to the encoded payload.
- Never store base64 in the sheet. Only Drive URLs.
- The website's API endpoint constant is shared with `leads.create` — one config constant, no second URL.

## Acceptance Criteria

- [ ] Phone-browser test: 3-photo lead submits; lead row appears instantly; photos appear in `BlueGrid Lead Photos/<leadId>/`; `photoUrls` holds 3 working URLs; dashboard shows 3 thumbnails.
- [ ] Photo upload with the API blocked: lead still captured, soft failure message shown, retry works.
- [ ] Unknown `leadId` to `leads.addPhotos` writes nothing to Drive and returns `NOT_FOUND`.
- [ ] 7 photos or oversize batch rejected client-side with a clear message before any request.
- [ ] Mock suite green including the new checks; no regression in existing checks.
- [ ] Redeployed as a new version of the existing deployment (URL unchanged).

## Outputs Required for Later Phases

- Drive folder convention (`BlueGrid Lead Photos/<leadId>/`) — reused if job-completion/before-after photos ever attach to leads (dashboard gallery, Phase 12 marketing reuse).
- The `leads.addPhotos` pattern is the template for any future binary transport in Nulo Edge modules.
