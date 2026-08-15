/* ============================================================
   BLUEGRID API — CONFIGURATION
   Forestry Module · Nulo Edge

   Constants only. Anything secret lives in Script Properties,
   anything the owner may want to change lives in the spreadsheet's
   "config" tab. Nothing sensitive belongs in this file.
============================================================ */

/* ============================================================
   MODULE IDENTITY
============================================================ */

const CLIENT_ID = 'bluegrid';

const MODULE_NAME = 'forestryModule';

const API_VERSION = '1.0.0';

/* ============================================================
   SPREADSHEET
============================================================ */

const SHEET_NAMES = {

    leads: 'leads',

    errorLog: 'errorLog',

    config: 'config',

    dropdowns: 'dropdowns',

    dashboardMetrics: 'dashboardMetrics'

};

/* Script Property that holds the dashboard API key. Never hard-code
   the key itself — set it in Project Settings → Script Properties. */

const API_KEY_PROPERTY = 'MODULE_API_KEY';

/* Optional Script Property. When the script is NOT bound to the
   spreadsheet, set this to the spreadsheet ID so openById() can find
   it. Bound deployments ignore this. */

const SPREADSHEET_ID_PROPERTY = 'LEADS_SPREADSHEET_ID';

/* ============================================================
   NOTIFICATIONS
============================================================ */

/* Fallback recipient, used when the "config" tab is missing or the key
   is blank. The config tab always wins when it has a value, so the
   owner can change this without touching code.

   The business owner is the ONLY recipient of customer submissions.
   Nulo Studio is deliberately not copied — the studio must not sit in
   the customer's email thread. Operational problems surface in the
   errorLog sheet instead of an inbox. */

const DEFAULT_NOTIFICATION_EMAIL = 'Bluegridls@gmail.com';

const NOTIFICATION_SENDER_NAME = 'BlueGrid Land Solutions Website';

/* ============================================================
   HONEYPOT
============================================================ */

/* Must match the hidden input name on the website form
   (index.html and every services/*.html page). */

const HONEYPOT_FIELD = 'companyWebsite';

/* ============================================================
   LOCKING
============================================================ */

const LOCK_TIMEOUT_MS = 30000;

/* ============================================================
   LEAD IDENTIFIERS

   Two identifiers, deliberately doing different jobs:

     leadId       Internal, sequential, server-assigned: BG-0001.
                  What the owner organises by and what the dashboard
                  updates against.

     referenceId  Customer-facing, client-generated, unique:
                  BG-1786635839698. Quoted back to the customer as a
                  confirmation number, and the value leads.create
                  dedupes on. Long and non-sequential on purpose — a
                  sequential number shown to a customer publishes how
                  many leads the business has had.

   Only the client can mint the dedupe key, because only the client
   knows that a second POST is a retry of the first. Only the server
   can mint the sequential number, because only the server can
   serialise the allocation. Hence one of each.
============================================================ */

const LEAD_ID_PREFIX = 'BG-';

/* A minimum width, not a ceiling: BG-0001 through BG-9999, then
   BG-10000 without anything needing to change. */

const LEAD_ID_PAD_LENGTH = 4;

/* The next sequential number is derived from the sheet rather than
   from a stored counter, so clearing the test rows before launch is
   the entire reset — there is no second place to remember. Legacy
   long-form ids sitting in the leadId column would otherwise read as
   sequence numbers in the trillions, so anything above this is
   ignored when the next number is worked out. */

const MAX_SEQUENTIAL_LEAD_NUMBER = 999999999;

/* ============================================================
   PHOTO STORAGE

   Submitted photos are written to Drive, one folder per lead, under
   a single root folder owned by whichever account owns this script.
============================================================ */

const PHOTO_ROOT_FOLDER_NAME = 'BlueGrid Lead Photos';

/* Cached so the root is one property read per execution rather than
   a Drive search on every upload. */

const PHOTO_ROOT_FOLDER_PROPERTY = 'PHOTO_ROOT_FOLDER_ID';

/* leads.addPhotos is public for the same reason leads.create is — a
   browser cannot hold a secret — so these caps, not the browser's
   own limits, are what stop the endpoint being used to fill the
   owner's Drive. The website enforces the same numbers as a
   courtesy; these are the control. */

const MAX_PHOTOS_PER_LEAD = 5;

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

/* Combined across every photo on one referenceId. Enforced by summing
   what the lead's folder already holds, so it cannot be defeated by
   spreading the payload over several requests — each upload is its own
   POST and no single request ever sees the total. */

const MAX_TOTAL_PHOTO_BYTES = 25 * 1024 * 1024;

/* The formats that survive the WHOLE pipeline, not merely the ones a
   file picker will offer:

     image/jpeg   downscaled in-browser, stored, previewed in Drive
     image/png    same
     image/webp   same
     image/heic   iPhone default. Canvas usually cannot decode it, so
     image/heif   downscaling falls back to the original bytes and it
                  uploads full size — the 8MB cap is what bounds it.
                  Drive previews it. Kept because rejecting it would
                  fail a large share of iPhone submissions.

   Deliberately absent: SVG (markup, scriptable), GIF, BMP, TIFF, and
   anything not an image. See PHOTO_CONTENT_SIGNATURES — the list below
   is only the CLAIMED type, and a claim is not evidence. */

const ALLOWED_PHOTO_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
];

/* ============================================================
   PHOTO CONTENT SIGNATURES

   mimeType arrives from the browser and a direct POST can claim
   anything, so the bytes are checked rather than the claim. Each
   entry tests the leading bytes of the decoded file.

   offset/bytes are matched literally; `brands` (HEIF family) matches
   any one of several four-character brands at offset 8.
============================================================ */

const PHOTO_CONTENT_SIGNATURES = [

    { type: 'image/jpeg', offset: 0, bytes: [0xFF, 0xD8, 0xFF] },

    { type: 'image/png', offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] },

    /* RIFF....WEBP — the four size bytes between the two markers are
       skipped, which is why this needs two anchored fragments. */

    { type: 'image/webp', offset: 0, bytes: [0x52, 0x49, 0x46, 0x46], also: { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] } },

    /* ISO-BMFF: "ftyp" at 4, then the brand at 8 decides the flavour. */

    {
        type: 'image/heic',
        offset: 4,
        bytes: [0x66, 0x74, 0x79, 0x70],
        brands: ['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1']
    }

];

/* Recognised specifically so a rejection can be logged as what it
   actually was, instead of a shrug. Not an allowlist — anything that
   matches no PHOTO_CONTENT_SIGNATURES entry is rejected regardless of
   whether it appears here. */

const REJECTED_CONTENT_SIGNATURES = [

    { label: 'SVG image (markup, can carry script)', offset: 0, bytes: [0x3C, 0x73, 0x76, 0x67] },
    { label: 'XML/SVG document', offset: 0, bytes: [0x3C, 0x3F, 0x78, 0x6D, 0x6C] },
    { label: 'HTML document', offset: 0, bytes: [0x3C, 0x21, 0x44, 0x4F, 0x43, 0x54, 0x59, 0x50, 0x45] },
    { label: 'HTML document', offset: 0, bytes: [0x3C, 0x68, 0x74, 0x6D, 0x6C] },
    { label: 'Windows executable', offset: 0, bytes: [0x4D, 0x5A] },
    { label: 'Linux executable', offset: 0, bytes: [0x7F, 0x45, 0x4C, 0x46] },
    { label: 'Mach-O executable', offset: 0, bytes: [0xCF, 0xFA, 0xED, 0xFE] },
    { label: 'ZIP archive or Office document', offset: 0, bytes: [0x50, 0x4B, 0x03, 0x04] },
    { label: 'RAR archive', offset: 0, bytes: [0x52, 0x61, 0x72, 0x21] },
    { label: 'gzip archive', offset: 0, bytes: [0x1F, 0x8B] },
    { label: 'PDF document', offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] },
    { label: 'shell script', offset: 0, bytes: [0x23, 0x21] },
    { label: 'GIF image (not an accepted format)', offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
    { label: 'BMP image (not an accepted format)', offset: 0, bytes: [0x42, 0x4D] }

];

/* How many bytes of each upload are decoded for the signature test.
   Only the head is decoded — decoding 8MB to read twelve bytes would
   cost memory on every upload for nothing. */

const PHOTO_SIGNATURE_SAMPLE_BYTES = 48;

/* ============================================================
   UPLOAD THROTTLE

   leads.addPhotos is public and anonymous, and a referenceId is just
   BG-<timestamp> — trivially minted. The per-lead caps therefore bound
   one lead, not one attacker, and the residual risk is filling the
   owning account's Drive.

   Apps Script exposes no client IP, so per-caller limiting is not
   possible. This is a deliberately blunt global ceiling: far above any
   real hour on a local-service site, far below what a script could do
   unattended. Override with "photoUploadsPerHour" in the config tab.
============================================================ */

const DEFAULT_PHOTO_UPLOADS_PER_HOUR = 120;

const PHOTO_THROTTLE_CACHE_PREFIX = 'photoUploads:';

/* A referenceId carries the millisecond timestamp it was minted at,
   so requiring it to be recent bounds how far back a replayed id can
   reach and stops abandoned folders accumulating indefinitely.
   Generous on purpose: a visitor filling the form slowly on a bad
   connection must never be turned away. */

const PHOTO_REFERENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/* How lead photos are shared, set by the "photoAccess" key in the
   spreadsheet's config tab so it can change without a redeploy:

     rootInherited   THE DEFAULT AND THE APPROVED ARCHITECTURE.
                     A customer submission performs NO Drive sharing
                     call of any kind. The BlueGrid owner is granted
                     Viewer on the PHOTO_ROOT_FOLDER_NAME folder once,
                     by running shareRootFolderWithOwner() from the
                     editor, and every lead folder and photo beneath it
                     inherits that access. One grant, not one per lead:
                     no "shared with you" mail per estimate, one entry
                     in the owner's Shared with me, and nothing above or
                     beside the root is reachable.

     anyoneWithLink  Per-lead link sharing — anyone holding the URL can
                     view. NOT part of the approved model: it performs a
                     sharing call during the submission and makes
                     customer photographs readable by anyone with the
                     link. Kept only as an escape hatch for an owner who
                     genuinely cannot be added to the root folder.
                     Choose it deliberately or not at all.

   Two modes that existed before 2026-08-15 are gone:

     ownerEmail      Granted Viewer to notificationEmail on EVERY lead
                     folder. Replaced by rootInherited, which is the
                     same access with one grant instead of hundreds.
     private         Named for "shared with nobody", which stopped being
                     true once the root carried the grant. Renamed to
                     rootInherited so the name states what it does.

   A config tab still holding either old value is not an error: the
   value is simply unrecognised, applyPhotoFolderAccess falls back to
   DEFAULT_PHOTO_ACCESS, and the fallback is logged. That fallback IS
   rootInherited, so a sheet left untouched lands on the approved
   behaviour rather than an unsafe one. */

const PHOTO_ACCESS_MODES = [
    'rootInherited',
    'anyoneWithLink'
];

const DEFAULT_PHOTO_ACCESS = 'rootInherited';

/* The Google account that gets Viewer on the photo root.

   DELIBERATELY SEPARATE FROM notificationEmail. They answer different
   questions — "who is emailed about a lead" and "whose Google account
   can open the photographs" — and during acceptance testing they are
   different addresses: estimate mail goes to admin@nulostudio.com
   while a temporary test account holds Drive access. Never collapse
   the two.

   Blank by default and never guessed at: shareRootFolderWithOwner()
   refuses to run rather than granting access to an assumed address. */

const DEFAULT_PHOTO_VIEWER_EMAIL = '';

/* ============================================================
   ENUMS  (exact, case-sensitive — must match
   docs/forestryModuleSchema.md byte for byte)
============================================================ */

const ENUM_VALUES = {

    serviceNeeded: [
        'Forestry Mulching',
        'Land Clearing',
        'Brush Removal',
        'Trail Cutting',
        'Storm Cleanup',
        'Property Cleanup',
        'Hunting Property Prep',
        'Other'
    ],

    preferredContactMethod: [
        'Phone Call',
        'Text',
        'Email'
    ],

    preferredTime: [
        'Morning',
        'Afternoon',
        'Evening',
        'Anytime'
    ],

    terrainType: [
        'flat',
        'rolling',
        'steep',
        'mixed',
        'woodedWetland'
    ],

    status: [
        'new',
        'contacted',
        'estimated',
        'scheduled',
        'inProgress',
        'completed',
        'lost'
    ]

};

/* ============================================================
   FIELD LIMITS
============================================================ */

const MAX_LENGTHS = {

    fullName: 100,

    phone: 30,

    email: 254,

    propertyAddress: 250,

    projectDescription: 2000,

    internalNotes: 5000,

    sourcePage: 200,

    leadSource: 200,

    utmSource: 200,

    utmMedium: 200,

    utmCampaign: 200,

    facebookCampaign: 300

};

/* Attribution fields are truncated on overflow, never rejected —
   a marketing parameter must never cost us a lead. */

const TRUNCATE_ONLY_FIELDS = [
    'leadSource',
    'utmSource',
    'utmMedium',
    'utmCampaign',
    'facebookCampaign',
    'sourcePage'
];

const REQUIRED_CREATE_FIELDS = [
    'fullName',
    'phone',
    'email',
    'propertyAddress',
    'serviceNeeded'
];

/* ============================================================
   ERROR CODES
============================================================ */

const ERROR_CODES = {

    validation: 'VALIDATION_ERROR',

    notFound: 'NOT_FOUND',

    unauthorized: 'UNAUTHORIZED',

    lockTimeout: 'LOCK_TIMEOUT',

    unknownAction: 'UNKNOWN_ACTION',

    serverError: 'SERVER_ERROR'

};
