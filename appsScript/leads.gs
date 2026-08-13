/* ============================================================
   BLUEGRID API — LEADS

   LEADS_HEADERS is the single source of truth for the sheet's row 1,
   the API record shape, and the dashboard row object. Columns are
   append-only once deployed: new fields go after lastUpdated, never
   inserted mid-contract, and renames are forbidden.
============================================================ */

const LEADS_HEADERS = [

    'leadId',
    'submittedAt',
    'fullName',
    'phone',
    'email',
    'propertyAddress',
    'estimatedAcres',
    'serviceNeeded',
    'projectDescription',
    'preferredContactMethod',
    'preferredTime',
    'photoCount',
    'photoNames',
    'photoUrls',
    'sourcePage',
    'leadSource',
    'utmSource',
    'utmMedium',
    'utmCampaign',
    'facebookCampaign',
    'propertySize',
    'terrainType',
    'status',
    'estimateAmount',
    'assignedTo',
    'internalNotes',
    'lastUpdated',

    /* Added by the 2026-08-13 identifier split and photo storage work.
       Appended rather than slotted next to leadId and photoUrls where
       they belong logically, because the append-only rule above is
       what keeps existing rows readable: every column an old row has
       stays exactly where that row put it. */

    'referenceId',
    'photoFolderUrl'

];

/* ============================================================
   CREATE  (public — the website form posts here)
============================================================ */

function handleCreateLead(payload)
{

    /* Bots get a success envelope and nothing else happens. Telling
       them they were caught only helps them iterate. */

    if (isHoneypotTripped(payload))
    {

        logInfo('honeypotTripped', payload.sourcePage || 'unknown');

        return successResponse({

            lead: { referenceId: LEAD_ID_PREFIX + Date.now() },

            honeypot: true

        });

    }

    const validation = validateLeadPayload(payload);

    if (!validation.valid)
    {

        logValidationFailure('handleCreateLead', validation.fields, validation.clean.referenceId);

        return errorResponse(
            ERROR_CODES.validation,
            'Some details need another look.',
            validation.fields
        );

    }

    /* Photos are resolved before the lock rather than inside it. The
       Drive reads do not need serialising, and holding the script lock
       across them would make every other submission queue behind this
       one's storage lookups. */

    const photos = resolveLeadPhotos(validation.clean.referenceId);

    const lock = LockService.getScriptLock();

    try
    {

        lock.waitLock(LOCK_TIMEOUT_MS);

    }
    catch (lockError)
    {

        logError('handleCreateLead:lockTimeout', lockError, validation.clean.referenceId);

        return errorResponse(
            ERROR_CODES.lockTimeout,
            'The system is busy. Please try again in a moment.'
        );

    }

    try
    {

        const sheet = getOrCreateSheet(SHEET_NAMES.leads);

        /* ── Dedupe: create is idempotent, so a double-tap or a
           mobile retry never produces two rows.

           Keyed on referenceId, the value the client minted and holds
           for the page load. The sequential leadId cannot serve here
           and is deliberately allocated *after* this check — a
           duplicate must never consume a number, or the owner's lead
           list would grow gaps every time somebody double-tapped. ── */

        const existing = findLeadByReferenceId(sheet, validation.clean.referenceId);

        if (existing)
        {

            logInfo('duplicateLead', validation.clean.referenceId);

            return successResponse({

                lead: existing.record,

                duplicate: true

            });

        }

        /* Allocated inside the lock that already serialises every
           write to this sheet, so two simultaneous submissions cannot
           read the same highest number and both add one to it. */

        const leadId = allocateNextLeadId(sheet);

        /* ── Compose the row. Server-authoritative fields are set
           here and never accepted from the client. ── */

        const record = {

            leadId: leadId,

            referenceId: validation.clean.referenceId,

            submittedAt: validation.clean.submittedAt,

            fullName: validation.clean.fullName,

            phone: validation.clean.phone,

            email: validation.clean.email,

            propertyAddress: validation.clean.propertyAddress,

            estimatedAcres: validation.clean.estimatedAcres,

            serviceNeeded: validation.clean.serviceNeeded,

            projectDescription: validation.clean.projectDescription,

            preferredContactMethod: validation.clean.preferredContactMethod,

            preferredTime: validation.clean.preferredTime,

            photoCount: validation.clean.photoCount,

            /* What the storage folder actually holds, not what the
               browser claimed to be sending. When nothing uploaded,
               the client's own list is kept so the owner still knows
               what the customer meant to attach. */

            photoNames: photos.names.length ? photos.names : validation.clean.photoNames,

            photoUrls: photos.urls,

            photoFolderUrl: photos.folderUrl,

            sourcePage: validation.clean.sourcePage,

            leadSource: validation.clean.leadSource || 'website',

            utmSource: validation.clean.utmSource,

            utmMedium: validation.clean.utmMedium,

            utmCampaign: validation.clean.utmCampaign,

            facebookCampaign: validation.clean.facebookCampaign,

            propertySize: '',

            terrainType: '',

            status: 'new',

            estimateAmount: '',

            assignedTo: '',

            internalNotes: '',

            lastUpdated: new Date().toISOString()

        };

        const row = objectToRow(record);

        sheet.appendRow(row);

        /* Force the freshly written row to plain text so ISO stamps
           and phone numbers do not coerce into Date/number cells. */

        sheet
            .getRange(sheet.getLastRow(), 1, 1, LEADS_HEADERS.length)
            .setNumberFormat('@');

        logInfo('leadCreated', record.leadId + ' :: ' + record.referenceId);

        /* Now that the lead has a number, the upload folder can carry
           it. Best-effort — the links on the row do not depend on it. */

        labelPhotoFolder(photos.folderId, record.leadId, record.fullName, record.referenceId);

        /* Notifications are best-effort. The row is already committed,
           so this is wrapped independently: if anything in the mail
           path throws, it must not fall through to the catch below and
           report failure for a lead that was actually saved. */

        try
        {

            sendLeadNotifications(record);

        }
        catch (notificationError)
        {

            logError('sendLeadNotifications', notificationError, record.leadId);

        }

        return successResponse({

            lead: record

        });

    }
    catch (createError)
    {

        /* Reaching here means the sheet write itself failed, so no
           lead exists and the visitor must be told to call. This is
           the one failure the errorLog exists to make impossible to
           miss. */

        logError('handleCreateLead', createError, validation.clean.referenceId);

        return errorResponse(
            ERROR_CODES.serverError,
            'We could not save your request. Please call us instead.'
        );

    }
    finally
    {

        lock.releaseLock();

    }

}

/* ============================================================
   LIST  (dashboard — requires apiKey)
============================================================ */

function handleListLeads()
{

    try
    {

        const sheet = getOrCreateSheet(SHEET_NAMES.leads);

        const leads = tableToObjects(sheet).reverse();

        return successResponse({

            leads: leads,

            count: leads.length

        });

    }
    catch (listError)
    {

        logError('handleListLeads', listError);

        return errorResponse(ERROR_CODES.serverError, 'Could not read leads.');

    }

}

/* ============================================================
   UPDATE  (dashboard — requires apiKey)
============================================================ */

function handleUpdateLead(payload)
{

    const leadId = sanitizeText(payload.leadId, 40);

    if (!leadId)
    {

        return errorResponse(
            ERROR_CODES.validation,
            'A leadId is required.',
            { leadId: 'Required.' }
        );

    }

    const validation = validateUpdatePayload(payload);

    if (!validation.valid)
    {

        return errorResponse(
            ERROR_CODES.validation,
            'Some details need another look.',
            validation.fields
        );

    }

    const lock = LockService.getScriptLock();

    try
    {

        lock.waitLock(LOCK_TIMEOUT_MS);

    }
    catch (lockError)
    {

        logError('handleUpdateLead:lockTimeout', lockError, leadId);

        return errorResponse(ERROR_CODES.lockTimeout, 'The system is busy. Try again shortly.');

    }

    try
    {

        const sheet = getOrCreateSheet(SHEET_NAMES.leads);

        const existing = findLeadById(sheet, leadId);

        if (!existing)
        {

            return errorResponse(ERROR_CODES.notFound, 'No lead found with that id.');

        }

        const record = existing.record;

        Object.keys(validation.clean).forEach(function (field)
        {

            record[field] = validation.clean[field];

        });

        record.lastUpdated = new Date().toISOString();

        const row = objectToRow(record);

        sheet
            .getRange(existing.rowNumber, 1, 1, LEADS_HEADERS.length)
            .setNumberFormat('@')
            .setValues([row]);

        logInfo('leadUpdated', leadId);

        return successResponse({ lead: record });

    }
    catch (updateError)
    {

        logError('handleUpdateLead', updateError, leadId);

        return errorResponse(ERROR_CODES.serverError, 'Could not update the lead.');

    }
    finally
    {

        lock.releaseLock();

    }

}

/* ============================================================
   SEQUENTIAL ID ALLOCATION

   The next number is derived from the sheet rather than kept in a
   counter. That costs one column read — the same read dedupe already
   pays — and buys two things worth more than the read: the numbering
   can never drift out of step with the rows it describes, and
   clearing the test rows before launch is the whole reset, with no
   Script Property left holding a stale count.

   Callers must already hold the script lock.
============================================================ */

function allocateNextLeadId(sheet)
{

    return LEAD_ID_PREFIX + padLeadNumber(findHighestLeadNumber(sheet) + 1);

}

function findHighestLeadNumber(sheet)
{

    const lastRow = sheet.getLastRow();

    if (lastRow < 2)
    {

        return 0;

    }

    const idColumnIndex = LEADS_HEADERS.indexOf('leadId') + 1;

    const ids = sheet.getRange(2, idColumnIndex, lastRow - 1, 1).getValues();

    let highest = 0;

    for (let index = 0; index < ids.length; index += 1)
    {

        const number = parseLeadNumber(normalizeCellValue(ids[index][0]));

        if (number > highest)
        {

            highest = number;

        }

    }

    return highest;

}

/* Returns 0 for anything that is not a sequential id — including the
   long-form ids this column held before the split, which would
   otherwise be read as a sequence number in the trillions and send
   the very next lead to BG-1786635839699.

   That guard is why an unmigrated sheet still numbers correctly
   instead of silently exploding. */

function parseLeadNumber(value)
{

    const match = /^BG-(\d+)$/.exec(String(value).trim());

    if (!match)
    {

        return 0;

    }

    const number = Number(match[1]);

    if (!isFinite(number) || number > MAX_SEQUENTIAL_LEAD_NUMBER)
    {

        return 0;

    }

    return number;

}

function padLeadNumber(number)
{

    let text = String(number);

    while (text.length < LEAD_ID_PAD_LENGTH)
    {

        text = '0' + text;

    }

    return text;

}

/* ============================================================
   LOOKUP
============================================================ */

/* Two identifiers, two lookups, each used where it means something:
   create dedupes on referenceId because that is what a retry carries,
   and the dashboard updates by leadId because that is what a human
   reads off the sheet. Both scan a single column rather than pulling
   every row, so they stay cheap as the sheet grows. */

function findLeadById(sheet, leadId)
{

    return findLeadByColumn(sheet, 'leadId', leadId);

}

function findLeadByReferenceId(sheet, referenceId)
{

    return findLeadByColumn(sheet, 'referenceId', referenceId);

}

function findLeadByColumn(sheet, columnName, wantedValue)
{

    const lastRow = sheet.getLastRow();

    if (lastRow < 2 || !wantedValue)
    {

        return null;

    }

    const idColumnIndex = LEADS_HEADERS.indexOf(columnName) + 1;

    const ids = sheet.getRange(2, idColumnIndex, lastRow - 1, 1).getValues();

    for (let index = 0; index < ids.length; index += 1)
    {

        if (normalizeCellValue(ids[index][0]) === wantedValue)
        {

            const rowNumber = index + 2;

            const values = sheet
                .getRange(rowNumber, 1, 1, LEADS_HEADERS.length)
                .getValues()[0];

            const record = {};

            LEADS_HEADERS.forEach(function (header, headerIndex)
            {

                record[header] = normalizeCellValue(values[headerIndex]);

            });

            return {

                rowNumber: rowNumber,

                record: parseArrayFields(record)

            };

        }

    }

    return null;

}
