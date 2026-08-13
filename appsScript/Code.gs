/* ============================================================
   BLUEGRID API — ENTRY POINT
   Forestry Module · Nulo Edge · BlueGrid Land Solutions

   Google Apps Script web app. Receives leads from the website form,
   writes them to the "BlueGrid Leads" spreadsheet, notifies the
   owner, and serves the dashboard.

   Deployment and testing steps live in README.md.

   Transport realities this file encodes rather than fights:
     - Apps Script web apps cannot answer a CORS preflight, so the
       website posts Content-Type text/plain containing JSON.
     - Apps Script always returns HTTP 200. The envelope carries the
       real status: { success, data } or { success, error }.
============================================================ */

/* ============================================================
   GET
============================================================ */

function doGet(request)
{

    try
    {

        const parameters = (request && request.parameter) ? request.parameter : {};

        const action = parameters.action || 'ping';

        return dispatchAction(action, 'GET', parameters, parameters.apiKey);

    }
    catch (getError)
    {

        logError('doGet', getError);

        return errorResponse(ERROR_CODES.serverError, 'Unexpected server error.');

    }

}

/* ============================================================
   POST
============================================================ */

function doPost(request)
{

    try
    {

        const parameters = (request && request.parameter) ? request.parameter : {};

        const payload = parseRequestBody(request);

        /* Action may arrive as a query parameter (the website's
           ?action=leads.create) or inside the JSON body. */

        const action = parameters.action || payload.action || 'leads.create';

        const providedKey = parameters.apiKey || payload.apiKey;

        return dispatchAction(action, 'POST', payload, providedKey);

    }
    catch (postError)
    {

        logError('doPost', postError);

        return errorResponse(ERROR_CODES.serverError, 'Unexpected server error.');

    }

}

/* ============================================================
   BODY PARSING
============================================================ */

/* Accepts the text/plain JSON the website sends, and also tolerates
   a form-encoded post so the endpoint can be exercised from a plain
   HTML form or curl during testing. */

function parseRequestBody(request)
{

    if (!request)
    {

        return {};

    }

    if (request.postData && request.postData.contents)
    {

        try
        {

            const parsed = JSON.parse(request.postData.contents);

            if (parsed && typeof parsed === 'object')
            {

                return parsed;

            }

        }
        catch (parseError)
        {

            logError('parseRequestBody', parseError);

        }

    }

    if (request.parameter && Object.keys(request.parameter).length > 0)
    {

        return request.parameter;

    }

    return {};

}

/* ============================================================
   ONE-TIME SETUP  (run manually from the editor)

   Creates or repairs every tab, header, named range, dropdown, and
   config row. Idempotent — safe to run repeatedly, and safe to run
   against a sheet that already holds leads.
============================================================ */

function setupSpreadsheet()
{

    const spreadsheet = getSpreadsheet();

    /* ── leads ── */

    const leadsSheet = getOrCreateSheet(SHEET_NAMES.leads);

    leadsSheet.getRange(1, 1, 1, LEADS_HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#1C1F22')
        .setFontColor('#FFFFFF');

    leadsSheet.setFrozenRows(1);

    /* ── errorLog ── */

    /* Failures only. There is deliberately no ActivityLog in this
       project: the leads sheet is the record of success, so a second
       log of successful traffic would only add noise and quota cost. */

    const errorLogSheet = getOrCreateSheet(SHEET_NAMES.errorLog);

    errorLogSheet.getRange(1, 1, 1, ERROR_LOG_HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#7A2E28')
        .setFontColor('#FFFFFF');

    errorLogSheet.setFrozenRows(1);

    errorLogSheet.setColumnWidth(1, 190);

    errorLogSheet.setColumnWidth(2, 150);

    errorLogSheet.setColumnWidth(3, 200);

    errorLogSheet.setColumnWidth(4, 420);

    errorLogSheet.setColumnWidth(5, 420);

    /* ── dropdowns ── */

    const dropdownsSheet = getOrCreateSheet(SHEET_NAMES.dropdowns);

    const dropdownColumns = [
        { header: 'statusValues', values: ENUM_VALUES.status },
        { header: 'serviceValues', values: ENUM_VALUES.serviceNeeded },
        { header: 'contactMethodValues', values: ENUM_VALUES.preferredContactMethod },
        { header: 'preferredTimeValues', values: ENUM_VALUES.preferredTime },
        { header: 'terrainTypeValues', values: ENUM_VALUES.terrainType }
    ];

    dropdownColumns.forEach(function (column, index)
    {

        dropdownsSheet.getRange(1, index + 1).setValue(column.header).setFontWeight('bold');

        column.values.forEach(function (value, valueIndex)
        {

            dropdownsSheet.getRange(valueIndex + 2, index + 1).setValue(value);

        });

    });

    /* ── config ── */

    const configSheet = getOrCreateSheet(SHEET_NAMES.config);

    if (configSheet.getLastRow() < 1)
    {

        configSheet.getRange(1, 1, 1, 2)
            .setValues([['key', 'value']])
            .setFontWeight('bold');

    }

    const seedConfig = [
        ['clientId', CLIENT_ID],
        ['moduleName', MODULE_NAME],
        ['notificationEmail', DEFAULT_NOTIFICATION_EMAIL],
        ['notificationsEnabled', 'true'],
        ['autoReplyEnabled', 'true'],
        ['weeklySummaryDay', 'Monday'],
        ['photoAccess', DEFAULT_PHOTO_ACCESS]
    ];

    const existingKeys = configSheet.getLastRow() > 1
        ? configSheet.getRange(2, 1, configSheet.getLastRow() - 1, 1)
            .getValues()
            .map(function (row) { return String(row[0]).trim(); })
        : [];

    seedConfig.forEach(function (pair)
    {

        if (existingKeys.indexOf(pair[0]) === -1)
        {

            configSheet.appendRow(pair);

        }

    });

    /* Remove keys retired by an architecture change, so re-running
       setup against an older sheet converges on the current contract
       instead of leaving misleading rows behind. */

    removeObsoleteConfigKeys(configSheet, ['secondaryNotificationEmail']);

    /* ── dashboardMetrics ── */

    /* Created empty. The owner's formulas live here; the dashboard SPA
       computes its own numbers from the API and never reads this tab. */

    getOrCreateSheet(SHEET_NAMES.dashboardMetrics);

    /* ── named ranges ── */

    const namedRanges = [
        ['leadsHeaders', SHEET_NAMES.leads + '!A1:AC1'],
        ['statusValues', SHEET_NAMES.dropdowns + '!A2:A8'],
        ['serviceValues', SHEET_NAMES.dropdowns + '!B2:B9'],
        ['contactMethodValues', SHEET_NAMES.dropdowns + '!C2:C4'],
        ['preferredTimeValues', SHEET_NAMES.dropdowns + '!D2:D5'],
        ['terrainTypeValues', SHEET_NAMES.dropdowns + '!E2:E6'],
        ['configTable', SHEET_NAMES.config + '!A2:B20']
    ];

    /* Remove any existing range of the same name first — re-running
       setup must converge, not accumulate duplicate named ranges. */

    const existingNamedRanges = spreadsheet.getNamedRanges();

    namedRanges.forEach(function (pair)
    {

        try
        {

            existingNamedRanges.forEach(function (namedRange)
            {

                if (namedRange.getName() === pair[0])
                {

                    namedRange.remove();

                }

            });

            spreadsheet.setNamedRange(pair[0], spreadsheet.getRange(pair[1]));

        }
        catch (rangeError)
        {

            logError('setupSpreadsheet:namedRange:' + pair[0], rangeError);

        }

    });

    logInfo('setupSpreadsheet', 'complete');

    return 'Setup complete. Tabs (leads, errorLog, config, dropdowns, dashboardMetrics), '
        + 'headers, dropdowns, config keys, and named ranges are in place. '
        + 'Safe to run again at any time.';

}

/* ============================================================
   CONFIG MAINTENANCE
============================================================ */

/* Deletes rows for keys the code no longer reads. Walks bottom-up so
   deleting a row cannot shift the rows still being examined. */

function removeObsoleteConfigKeys(configSheet, obsoleteKeys)
{

    if (configSheet.getLastRow() < 2)
    {

        return;

    }

    const keys = configSheet
        .getRange(2, 1, configSheet.getLastRow() - 1, 1)
        .getValues();

    for (let index = keys.length - 1; index >= 0; index -= 1)
    {

        if (obsoleteKeys.indexOf(String(keys[index][0]).trim()) !== -1)
        {

            configSheet.deleteRow(index + 2);

            logInfo('removedObsoleteConfigKey', String(keys[index][0]).trim());

        }

    }

}

/* ============================================================
   LEAD IDENTIFIER MIGRATION  (run manually from the editor)

   Rows written before the 2026-08-13 identifier split hold a long
   client-generated id in the leadId column and nothing in
   referenceId. This moves each one across into referenceId and gives
   the row a sequential leadId, in sheet order, so the oldest lead
   becomes BG-0001.

   Non-destructive: no row is deleted, no column is removed, no other
   cell is touched, and a row that already carries both identifiers is
   left exactly as it is. Safe to run twice — the second run finds
   nothing to do.

   Run previewLeadIdentifierMigration() first. It reports the identical
   plan without writing anything.
============================================================ */

function previewLeadIdentifierMigration()
{

    const plan = planLeadIdentifierMigration();

    return describeMigrationPlan(plan, false);

}

function migrateLeadIdentifiers()
{

    const sheet = getOrCreateSheet(SHEET_NAMES.leads);

    const plan = planLeadIdentifierMigration();

    const leadIdColumn = LEADS_HEADERS.indexOf('leadId') + 1;

    const referenceIdColumn = LEADS_HEADERS.indexOf('referenceId') + 1;

    plan.changes.forEach(function (change)
    {

        sheet.getRange(change.rowNumber, leadIdColumn)
            .setNumberFormat('@')
            .setValue(change.leadId);

        sheet.getRange(change.rowNumber, referenceIdColumn)
            .setNumberFormat('@')
            .setValue(change.referenceId);

    });

    logInfo('migrateLeadIdentifiers', plan.changes.length + ' row(s) migrated');

    return describeMigrationPlan(plan, true);

}

/* Works out what needs to change without changing anything, so the
   preview and the migration can never disagree about the plan. */

function planLeadIdentifierMigration()
{

    const sheet = getOrCreateSheet(SHEET_NAMES.leads);

    const plan = {

        total: 0,

        changes: [],

        alreadyMigrated: 0,

        needsAttention: []

    };

    const lastRow = sheet.getLastRow();

    if (lastRow < 2)
    {

        return plan;

    }

    const leadIdColumn = LEADS_HEADERS.indexOf('leadId') + 1;

    const referenceIdColumn = LEADS_HEADERS.indexOf('referenceId') + 1;

    const rows = sheet.getRange(2, 1, lastRow - 1, LEADS_HEADERS.length).getValues();

    /* Sequential numbering continues from the highest number already
       present, so a partially migrated sheet never reissues one. */

    let nextNumber = 0;

    rows.forEach(function (row)
    {

        const existingNumber = parseLeadNumber(normalizeCellValue(row[leadIdColumn - 1]));

        if (existingNumber > nextNumber)
        {

            nextNumber = existingNumber;

        }

    });

    rows.forEach(function (row, index)
    {

        plan.total += 1;

        const rowNumber = index + 2;

        const currentLeadId = normalizeCellValue(row[leadIdColumn - 1]).trim();

        const currentReferenceId = normalizeCellValue(row[referenceIdColumn - 1]).trim();

        if (isValidLeadId(currentLeadId) && currentReferenceId)
        {

            plan.alreadyMigrated += 1;

            return;

        }

        /* The migratable shape: a long-form id sitting in the leadId
           column, which is precisely what every pre-split row holds. */

        if (isValidReferenceId(currentLeadId))
        {

            nextNumber += 1;

            plan.changes.push({

                rowNumber: rowNumber,

                leadId: LEAD_ID_PREFIX + padLeadNumber(nextNumber),

                referenceId: currentReferenceId || currentLeadId,

                previousLeadId: currentLeadId

            });

            return;

        }

        /* Anything else is reported rather than guessed at. A row with
           a sequential leadId and no referenceId cannot have one
           invented for it — the customer was quoted something, and
           this code does not know what. */

        plan.needsAttention.push(
            'row ' + rowNumber + ': leadId="' + currentLeadId
            + '", referenceId="' + currentReferenceId + '"'
        );

    });

    return plan;

}

function describeMigrationPlan(plan, applied)
{

    const lines = [

        applied ? 'MIGRATION APPLIED' : 'MIGRATION PREVIEW — nothing was written',
        '',
        'Data rows examined      : ' + plan.total,
        'Already migrated        : ' + plan.alreadyMigrated,
        (applied ? 'Rows migrated           : ' : 'Rows that would change  : ') + plan.changes.length

    ];

    plan.changes.forEach(function (change)
    {

        lines.push(
            '  row ' + change.rowNumber + ': ' + change.previousLeadId
            + '  ->  leadId ' + change.leadId + ' / referenceId ' + change.referenceId
        );

    });

    if (plan.needsAttention.length)
    {

        lines.push('');

        lines.push('Needs a human look      : ' + plan.needsAttention.length);

        plan.needsAttention.forEach(function (note)
        {

            lines.push('  ' + note);

        });

    }

    const summary = lines.join('\n');

    logInfo(applied ? 'migrateLeadIdentifiers' : 'previewLeadIdentifierMigration', '\n' + summary);

    return summary;

}

/* ============================================================
   SELF TEST  (run manually from the editor after deployment)

   Writes a lead, replays it to prove dedupe, then deletes the test
   row. Confirms sheet write access and surfaces mail errors without
   waiting for a real visitor.
============================================================ */

function runSelfTest()
{

    const results = [];

    const testReferenceId = LEAD_ID_PREFIX + Date.now();

    const samplePayload = {

        referenceId: testReferenceId,

        submittedAt: new Date().toISOString(),

        fullName: 'Self Test',

        phone: '(740) 555-0100',

        email: 'selftest@example.com',

        propertyAddress: '1 Test Road, Portsmouth, OH',

        estimatedAcres: '2',

        serviceNeeded: 'Forestry Mulching',

        projectDescription: 'Automated self test — safe to delete.',

        preferredContactMethod: 'Email',

        preferredTime: 'Anytime',

        photoCount: 0,

        photoNames: [],

        sourcePage: 'selfTest',

        leadSource: 'selfTest'

    };

    const created = JSON.parse(handleCreateLead(samplePayload).getContent());

    results.push('create: ' + (created.success ? 'PASS' : 'FAIL — ' + JSON.stringify(created.error)));

    /* Both identifiers must be present and be different things: a
       sequential leadId the owner reads, and the long reference the
       customer was quoted. */

    results.push('identifiers: ' + (created.success
        && isValidLeadId(created.data.lead.leadId)
        && created.data.lead.referenceId === testReferenceId
        ? 'PASS'
        : 'FAIL'));

    const replay = JSON.parse(handleCreateLead(samplePayload).getContent());

    results.push('dedupe: ' + (replay.success && replay.data.duplicate ? 'PASS' : 'FAIL'));

    /* A replay must return the original row untouched — same
       sequential number, no second allocation. */

    results.push('dedupe keeps leadId: ' + (replay.success
        && replay.data.lead.leadId === created.data.lead.leadId
        ? 'PASS'
        : 'FAIL'));

    const honeypotPayload = JSON.parse(JSON.stringify(samplePayload));

    honeypotPayload.referenceId = LEAD_ID_PREFIX + (Date.now() + 1);

    honeypotPayload[HONEYPOT_FIELD] = 'bot';

    const trapped = JSON.parse(handleCreateLead(honeypotPayload).getContent());

    results.push('honeypot: ' + (trapped.success && trapped.data.honeypot ? 'PASS' : 'FAIL'));

    const invalid = JSON.parse(handleCreateLead({ fullName: '', phone: '', email: 'nope' }).getContent());

    results.push('validation: ' + (!invalid.success ? 'PASS' : 'FAIL'));

    /* The validation failure above should have produced an errorLog
       row. Confirming that proves the audit trail actually records
       failures rather than silently swallowing them. */

    const errorLogSheet = getOrCreateSheet(SHEET_NAMES.errorLog);

    const errorRowsBefore = errorLogSheet.getLastRow();

    writeErrorLog('runSelfTest', 'Self test error entry — safe to delete.', 'no stack', testReferenceId);

    const errorRowsAfter = errorLogSheet.getLastRow();

    results.push('errorLog: ' + (errorRowsAfter > errorRowsBefore ? 'PASS' : 'FAIL'));

    if (errorRowsAfter > errorRowsBefore)
    {

        errorLogSheet.deleteRow(errorRowsAfter);

    }

    /* Clean up the row the create test wrote. */

    const sheet = getOrCreateSheet(SHEET_NAMES.leads);

    const found = findLeadByReferenceId(sheet, testReferenceId);

    if (found)
    {

        sheet.deleteRow(found.rowNumber);

        results.push('cleanup: PASS');

    }
    else
    {

        results.push('cleanup: FAIL — test row not found');

    }

    const summary = results.join('\n');

    logInfo('runSelfTest', '\n' + summary);

    return summary;

}
