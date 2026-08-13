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

const MAX_PHOTOS_PER_LEAD = 12;

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

const ALLOWED_PHOTO_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
];

/* A referenceId carries the millisecond timestamp it was minted at,
   so requiring it to be recent bounds how far back a replayed id can
   reach and stops abandoned folders accumulating indefinitely.
   Generous on purpose: a visitor filling the form slowly on a bad
   connection must never be turned away. */

const PHOTO_REFERENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/* How the per-lead folder is shared, set by the "photoAccess" key in
   the spreadsheet's config tab so it can change without a redeploy:

     ownerEmail      Grant view access to notificationEmail. The
                     default, and the one that works regardless of
                     which account owns the script.
     private         Share with nobody. Only the account running this
                     script can open the links.
     anyoneWithLink  Anyone holding the link can view. Least
                     restrictive — only if the owner reads mail on an
                     account that is not on the folder.

   Photos are never made public unless anyoneWithLink is chosen
   deliberately. */

const PHOTO_ACCESS_MODES = [
    'ownerEmail',
    'private',
    'anyoneWithLink'
];

const DEFAULT_PHOTO_ACCESS = 'ownerEmail';

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
