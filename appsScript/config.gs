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
