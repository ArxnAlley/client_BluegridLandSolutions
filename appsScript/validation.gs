/* ============================================================
   BLUEGRID API — VALIDATION & SANITIZATION

   Every value that reaches the sheet passes through here first.
   Rules mirror docs/forestryModuleSchema.md exactly.
============================================================ */

/* ============================================================
   SANITIZATION
============================================================ */

/* Coerce to a trimmed string, strip control characters, and cap the
   length. Control characters matter because a stray newline or tab
   pasted into a cell breaks CSV exports downstream. */

function sanitizeText(value, maxLength)
{

    if (value === null || value === undefined)
    {

        return '';

    }

    let text = String(value);

    /* Strip C0/C1 control characters but keep ordinary whitespace. */

    text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

    text = text.trim();

    if (maxLength && text.length > maxLength)
    {

        text = text.substring(0, maxLength);

    }

    return text;

}

/* A leading =, +, -, or @ makes Sheets treat a cell as a formula.
   Prefixing with an apostrophe forces text and defuses CSV/formula
   injection without changing what the owner sees. */

function neutralizeFormula(value)
{

    if (typeof value !== 'string' || value.length === 0)
    {

        return value;

    }

    if (/^[=+\-@]/.test(value))
    {

        return "'" + value;

    }

    return value;

}

/* ============================================================
   FIELD VALIDATORS
============================================================ */

function isValidEmail(value)
{

    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

}

/* Deliberately permissive: people write phone numbers a dozen ways
   and rejecting a real customer is far worse than accepting a messy
   string. We only insist on enough digits to be callable. */

function isValidPhone(value)
{

    const digits = value.replace(/\D/g, '');

    return digits.length >= 7 && digits.length <= 15;

}

/* The customer-facing confirmation number: BG- plus the millisecond
   timestamp the browser minted it at. */

function isValidReferenceId(value)
{

    return /^BG-\d{13}$/.test(value);

}

/* The internal sequential number: BG-0001 upward. Deliberately capped
   below thirteen digits so a legacy long-form id can never be mistaken
   for a sequential one — that distinction is what lets the migration
   and the allocator tell the two apart in a half-migrated sheet. */

function isValidLeadId(value)
{

    return /^BG-\d{4,9}$/.test(value);

}

/* A referenceId encodes when it was created, so its age is checkable
   without storing anything. Skew is allowed in both directions
   because the timestamp comes from the visitor's own clock. */

function isReferenceIdRecent(value)
{

    const match = /^BG-(\d{13})$/.exec(String(value));

    if (!match)
    {

        return false;

    }

    const age = Date.now() - Number(match[1]);

    return age <= PHOTO_REFERENCE_MAX_AGE_MS && age >= -PHOTO_REFERENCE_MAX_AGE_MS;

}

function isValidEnum(field, value)
{

    const allowed = ENUM_VALUES[field];

    if (!allowed)
    {

        return true;

    }

    return allowed.indexOf(value) !== -1;

}

function isValidIsoDate(value)
{

    if (!value)
    {

        return false;

    }

    const parsed = new Date(value);

    return !isNaN(parsed.getTime());

}

/* ============================================================
   HONEYPOT
============================================================ */

/* The website hides this input from humans. Anything in it means a
   bot filled the form. The caller returns a fake success so the bot
   never learns it was caught. */

function isHoneypotTripped(payload)
{

    const trapValue = payload[HONEYPOT_FIELD];

    return Boolean(trapValue && String(trapValue).trim().length > 0);

}

/* ============================================================
   LEAD CREATE VALIDATION
============================================================ */

/* Returns { valid, fields, clean }. `fields` is keyed by field name
   so the website can highlight the offending input. `clean` is the
   sanitized payload — callers must use it rather than the raw one. */

function validateLeadPayload(payload)
{

    const fields = {};

    const clean = {};

    /* ── Required text fields ── */

    REQUIRED_CREATE_FIELDS.forEach(function (field)
    {

        const sanitized = sanitizeText(payload[field], MAX_LENGTHS[field]);

        if (!sanitized)
        {

            fields[field] = 'Required.';

        }

        clean[field] = sanitized;

    });

    /* ── Email ── */

    if (clean.email && !isValidEmail(clean.email))
    {

        fields.email = 'Enter a valid email address.';

    }

    /* ── Phone ── */

    if (clean.phone && !isValidPhone(clean.phone))
    {

        fields.phone = 'Enter a valid phone number.';

    }

    /* ── serviceNeeded enum ── */

    if (clean.serviceNeeded && !isValidEnum('serviceNeeded', clean.serviceNeeded))
    {

        fields.serviceNeeded = 'Choose one of the listed services.';

    }

    /* ── Optional enums: blank is allowed, wrong is not ── */

    ['preferredContactMethod', 'preferredTime'].forEach(function (field)
    {

        const sanitized = sanitizeText(payload[field], 50);

        if (sanitized && !isValidEnum(field, sanitized))
        {

            fields[field] = 'Invalid value.';

        }

        clean[field] = sanitized;

    });

    /* ── projectDescription ── */

    clean.projectDescription = sanitizeText(
        payload.projectDescription,
        MAX_LENGTHS.projectDescription
    );

    /* ── estimatedAcres ── */

    const acresRaw = sanitizeText(payload.estimatedAcres, 20);

    if (acresRaw)
    {

        const acresValue = Number(acresRaw);

        if (isNaN(acresValue) || acresValue < 0 || acresValue > 100000)
        {

            fields.estimatedAcres = 'Enter acreage between 0 and 100000.';

        }

    }

    clean.estimatedAcres = acresRaw;

    /* ── photoCount / photoNames ── */

    const photoCount = Number(payload.photoCount);

    clean.photoCount = (isNaN(photoCount) || photoCount < 0) ? 0 : Math.floor(photoCount);

    clean.photoNames = Array.isArray(payload.photoNames)
        ? payload.photoNames.slice(0, 20).map(function (name)
        {

            return sanitizeText(name, 200);

        })
        : [];

    /* ── Attribution: truncated, never rejected ── */

    TRUNCATE_ONLY_FIELDS.forEach(function (field)
    {

        clean[field] = sanitizeText(payload[field], MAX_LENGTHS[field] || 200);

    });

    /* ── referenceId: the customer's confirmation number, and the key
       create dedupes on. The client mints it and holds it for the page
       load, so a retry after a dropped connection carries the same
       value and collapses into the original row.

       A malformed one is replaced rather than rejected — a bad
       reference must never cost a lead.

       `leadId` is read here only as a fallback, so that a browser
       holding a cached copy of the pre-split site still dedupes
       correctly during the window between the two deployments. The
       internal sequential leadId is assigned by the server after this
       runs and is never accepted from the client. ── */

    const providedReferenceId = sanitizeText(payload.referenceId || payload.leadId, 40);

    clean.referenceId = isValidReferenceId(providedReferenceId)
        ? providedReferenceId
        : LEAD_ID_PREFIX + Date.now();

    /* ── submittedAt: keep the client stamp when it parses ── */

    const providedSubmittedAt = sanitizeText(payload.submittedAt, 40);

    clean.submittedAt = isValidIsoDate(providedSubmittedAt)
        ? new Date(providedSubmittedAt).toISOString()
        : new Date().toISOString();

    /* ── Formula injection defense on everything free-form ── */

    [
        'fullName',
        'phone',
        'email',
        'propertyAddress',
        'projectDescription',
        'sourcePage',
        'leadSource',
        'utmSource',
        'utmMedium',
        'utmCampaign',
        'facebookCampaign'
    ].forEach(function (field)
    {

        clean[field] = neutralizeFormula(clean[field]);

    });

    return {

        valid: Object.keys(fields).length === 0,

        fields: fields,

        clean: clean

    };

}

/* ============================================================
   PHOTO UPLOAD VALIDATION  (public — leads.addPhotos)
============================================================ */

/* Drive will happily accept a name containing slashes, control
   characters, or a leading dot. The owner's Drive should not, so
   anything outside that is replaced rather than dropped — dropping
   characters could collapse two different uploads onto one name. */

function sanitizePhotoFileName(value)
{

    let name = sanitizeText(value, 120);

    name = name.replace(/[\\\/:*?"<>|]/g, '_');

    name = name.replace(/^\.+/, '');

    return name.trim();

}

/* Base64 inflates by four bytes for every three, so the decoded size
   is checkable before spending memory on the decode itself. */

function estimateBase64Bytes(base64)
{

    const padding = (String(base64).slice(-2).match(/=/g) || []).length;

    return Math.floor(String(base64).length * 3 / 4) - padding;

}

/* Checked BEFORE any decode so malformed input is a clean validation
   failure instead of an exception surfacing as SERVER_ERROR. */

function isWellFormedBase64(value)
{

    const text = String(value).replace(/\s+/g, '');

    if (!text || (text.length % 4) !== 0)
    {

        return false;

    }

    return /^[A-Za-z0-9+/]+={0,2}$/.test(text);

}

/* ============================================================
   CONTENT SIGNATURE INSPECTION

   mimeType is whatever the caller says it is. This reads the actual
   leading bytes, which is the only part of an upload a direct POST
   cannot lie about without genuinely supplying that file type.

   Only the head is decoded — 64 base64 characters is a clean multiple
   of four and yields 48 bytes, enough for every signature we test.
============================================================ */

function readPhotoHeadBytes(base64)
{

    const text = String(base64).replace(/\s+/g, '');

    const sampleChars = Math.ceil(PHOTO_SIGNATURE_SAMPLE_BYTES / 3) * 4;

    let head = text.substring(0, sampleChars);

    /* A file shorter than the sample keeps its own padding; a slice
       taken from the middle of a longer string has none, and decoding
       an unpadded non-multiple-of-four is what throws. */

    head = head.substring(0, head.length - (head.length % 4));

    if (!head)
    {

        return [];

    }

    try
    {

        return Utilities.base64Decode(head);

    }
    catch (decodeError)
    {

        return [];

    }

}

function bytesMatchAt(bytes, offset, expected)
{

    if (bytes.length < offset + expected.length)
    {

        return false;

    }

    for (let index = 0; index < expected.length; index += 1)
    {

        /* base64Decode yields signed bytes on the Apps Script runtime,
           so 0xFF arrives as -1. Masking makes both runtimes agree. */

        if ((bytes[offset + index] & 0xFF) !== expected[index])
        {

            return false;

        }

    }

    return true;

}

function readBrandAt(bytes, offset)
{

    if (bytes.length < offset + 4)
    {

        return '';

    }

    let brand = '';

    for (let index = 0; index < 4; index += 1)
    {

        brand += String.fromCharCode(bytes[offset + index] & 0xFF);

    }

    return brand.toLowerCase();

}

/* Returns { type, rejected, label }.

   type      the image type the BYTES say it is, '' if unrecognised
   rejected  true when the bytes match something explicitly refused
   label     human description for the errorLog, never for a customer */

function detectPhotoContentType(base64)
{

    const bytes = readPhotoHeadBytes(base64);

    if (!bytes.length)
    {

        return { type: '', rejected: false, label: 'unreadable or empty' };

    }

    for (let index = 0; index < PHOTO_CONTENT_SIGNATURES.length; index += 1)
    {

        const signature = PHOTO_CONTENT_SIGNATURES[index];

        if (!bytesMatchAt(bytes, signature.offset, signature.bytes))
        {

            continue;

        }

        if (signature.also && !bytesMatchAt(bytes, signature.also.offset, signature.also.bytes))
        {

            continue;

        }

        if (signature.brands)
        {

            const brand = readBrandAt(bytes, 8);

            if (signature.brands.indexOf(brand) === -1)
            {

                continue;

            }

        }

        return { type: signature.type, rejected: false, label: signature.type };

    }

    for (let index = 0; index < REJECTED_CONTENT_SIGNATURES.length; index += 1)
    {

        const refused = REJECTED_CONTENT_SIGNATURES[index];

        if (bytesMatchAt(bytes, refused.offset, refused.bytes))
        {

            return { type: '', rejected: true, label: refused.label };

        }

    }

    return { type: '', rejected: false, label: 'unrecognised binary' };

}

/* HEIC and HEIF share one container and one signature, so a file whose
   bytes say heic may legitimately be declared either. Everything else
   must agree exactly. */

function contentTypeMatchesClaim(detectedType, claimedType)
{

    if (detectedType === claimedType)
    {

        return true;

    }

    return detectedType === 'image/heic'
        && (claimedType === 'image/heic' || claimedType === 'image/heif');

}

/* This endpoint is public, so everything it trusts is checked here:
   the reference must be well-formed and recent, the type must be an
   image we expect, and the payload must be under the size cap before
   anything touches Drive. */

function validatePhotoPayload(payload)
{

    const fields = {};

    const clean = {};

    /* ── referenceId ── */

    clean.referenceId = sanitizeText(payload.referenceId, 40);

    if (!isValidReferenceId(clean.referenceId))
    {

        fields.referenceId = 'Invalid reference.';

    }
    else if (!isReferenceIdRecent(clean.referenceId))
    {

        fields.referenceId = 'This reference has expired.';

    }

    /* ── fileName ── */

    clean.fileName = sanitizePhotoFileName(payload.fileName);

    if (!clean.fileName)
    {

        fields.fileName = 'Required.';

    }

    /* ── mimeType ── */

    clean.mimeType = sanitizeText(payload.mimeType, 100).toLowerCase();

    if (ALLOWED_PHOTO_MIME_TYPES.indexOf(clean.mimeType) === -1)
    {

        fields.mimeType = 'Unsupported image type.';

    }

    /* ── index: position in the visitor's own list, used to keep the
       stored order and to make a retry idempotent by name ── */

    const index = Number(payload.index);

    clean.index = (isNaN(index) || index < 1) ? 1 : Math.floor(index);

    /* ── image data ── */

    clean.dataBase64 = (typeof payload.dataBase64 === 'string')
        ? payload.dataBase64.trim()
        : '';

    clean.byteSize = 0;

    clean.detected = { type: '', rejected: false, label: 'not inspected' };

    if (!clean.dataBase64)
    {

        fields.dataBase64 = 'Required.';

    }
    else if (!isWellFormedBase64(clean.dataBase64))
    {

        fields.dataBase64 = 'That image could not be read.';

    }
    else if (estimateBase64Bytes(clean.dataBase64) > MAX_PHOTO_BYTES)
    {

        fields.dataBase64 = 'That image is too large.';

    }
    else
    {

        clean.byteSize = estimateBase64Bytes(clean.dataBase64);

        /* ── content inspection ──

           The check that actually matters. Everything above trusts the
           caller: mimeType is a claim, fileName is a claim, and a POST
           made outside the browser can set both to anything. The bytes
           are the one thing an attacker has to supply honestly, so an
           .exe renamed .jpg and declared image/jpeg dies here and
           nowhere earlier. */

        clean.detected = detectPhotoContentType(clean.dataBase64);

        if (clean.detected.rejected)
        {

            fields.dataBase64 = 'That file is not a photo.';

        }
        else if (!clean.detected.type)
        {

            fields.dataBase64 = 'That file is not a supported image.';

        }
        else if (!clean.mimeType)
        {

            /* No type declared at all — common from Android pickers and
               from drag-and-drop. The bytes are a proven image, so they
               are authoritative and the absent claim is not fatal. */

            clean.mimeType = clean.detected.type;

            delete fields.mimeType;

        }
        else if (fields.mimeType)
        {

            /* A claim that is not an accepted image type at all
               (application/pdf, image/svg+xml, text/html …). The bytes
               may well be a real photo, but a caller declaring a
               non-image type is not behaving like the website, and the
               earlier rejection stands. Costs nothing to keep and keeps
               one more thing having to be right. */

        }
        else if (!contentTypeMatchesClaim(clean.detected.type, clean.mimeType))
        {

            /* Both the claim and the content are accepted image types,
               they just disagree — a PNG announced as JPEG. Benign, and
               browsers do it. Store what the bytes actually are and
               record the disagreement as a signal, rather than inventing
               a way for an honest upload to fail. */

            clean.mimeTypeMismatch = clean.mimeType + ' claimed, '
                + clean.detected.type + ' stored';

            clean.mimeType = clean.detected.type;

        }

    }

    return {

        valid: Object.keys(fields).length === 0,

        fields: fields,

        clean: clean

    };

}

/* ============================================================
   LEAD UPDATE VALIDATION  (dashboard only)
============================================================ */

/* Whitelist enforced here, not at the call site: only these six
   fields are ever writable after create. */

const UPDATABLE_FIELDS = [
    'status',
    'estimateAmount',
    'assignedTo',
    'internalNotes',
    'propertySize',
    'terrainType'
];

function validateUpdatePayload(payload)
{

    const fields = {};

    const clean = {};

    UPDATABLE_FIELDS.forEach(function (field)
    {

        if (!Object.prototype.hasOwnProperty.call(payload, field))
        {

            return;

        }

        const sanitized = sanitizeText(payload[field], MAX_LENGTHS[field] || 500);

        if (field === 'status' && sanitized && !isValidEnum('status', sanitized))
        {

            fields.status = 'Invalid status value.';

        }

        if (field === 'terrainType' && sanitized && !isValidEnum('terrainType', sanitized))
        {

            fields.terrainType = 'Invalid terrain value.';

        }

        if (field === 'estimateAmount' && sanitized && isNaN(Number(sanitized)))
        {

            fields.estimateAmount = 'Enter a number.';

        }

        if (field === 'propertySize' && sanitized && isNaN(Number(sanitized)))
        {

            fields.propertySize = 'Enter a number.';

        }

        clean[field] = neutralizeFormula(sanitized);

    });

    return {

        valid: Object.keys(fields).length === 0,

        fields: fields,

        clean: clean

    };

}
