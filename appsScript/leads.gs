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
    'lastUpdated'

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

            lead: { leadId: 'BG-' + Date.now() },

            honeypot: true

        });

    }

    const validation = validateLeadPayload(payload);

    if (!validation.valid)
    {

        logValidationFailure('handleCreateLead', validation.fields, validation.clean.leadId);

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

        logError('handleCreateLead:lockTimeout', lockError, validation.clean.leadId);

        return errorResponse(
            ERROR_CODES.lockTimeout,
            'The system is busy. Please try again in a moment.'
        );

    }

    try
    {

        const sheet = getOrCreateSheet(SHEET_NAMES.leads);

        /* ── Dedupe: create is idempotent, so a double-tap or a
           mobile retry never produces two rows. ── */

        const existing = findLeadById(sheet, validation.clean.leadId);

        if (existing)
        {

            logInfo('duplicateLead', validation.clean.leadId);

            return successResponse({

                lead: existing.record,

                duplicate: true

            });

        }

        /* ── Compose the row. Server-authoritative fields are set
           here and never accepted from the client. ── */

        const record = {

            leadId: validation.clean.leadId,

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

            photoNames: validation.clean.photoNames,

            photoUrls: [],

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

        logInfo('leadCreated', record.leadId);

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

        logError('handleCreateLead', createError, validation.clean.leadId);

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
   LOOKUP
============================================================ */

/* Scans only the leadId column rather than pulling every row, so
   dedupe stays cheap as the sheet grows. */

function findLeadById(sheet, leadId)
{

    const lastRow = sheet.getLastRow();

    if (lastRow < 2)
    {

        return null;

    }

    const idColumnIndex = LEADS_HEADERS.indexOf('leadId') + 1;

    const ids = sheet.getRange(2, idColumnIndex, lastRow - 1, 1).getValues();

    for (let index = 0; index < ids.length; index += 1)
    {

        if (normalizeCellValue(ids[index][0]) === leadId)
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
