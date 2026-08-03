/* ============================================================
   BLUEGRID API — UTILITIES
   Spreadsheet access, header enforcement, row/object mapping,
   config reading, response envelopes, and logging.
============================================================ */

/* ============================================================
   RESPONSE ENVELOPES
============================================================ */

/* Apps Script web apps always answer HTTP 200. The envelope is the
   real status — every caller checks `success`, never the HTTP code. */

function jsonResponse(payload)
{

    return ContentService
        .createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON);

}

function successResponse(data)
{

    return jsonResponse({

        success: true,

        data: data

    });

}

function errorResponse(code, message, fields)
{

    const error = {

        code: code,

        message: message

    };

    if (fields)
    {

        error.fields = fields;

    }

    return jsonResponse({

        success: false,

        error: error

    });

}

/* ============================================================
   LOGGING

   Two destinations, deliberately different:

     logInfo  — execution log only. Successful activity is NOT
                mirrored to a sheet; there is no ActivityLog in this
                project. The leads sheet is the record of success.

     logError — execution log AND the errorLog sheet, so failures
                survive past the 7-day execution log retention and the
                owner can see them without opening Apps Script.

   Never log full personal details — a lead's name and email do not
   belong in a log. The leadId is the join key back to the row.
============================================================ */

const ERROR_LOG_HEADERS = [

    'timestamp',
    'leadId',
    'functionName',
    'errorMessage',
    'stackTrace'

];

function logInfo(label, detail)
{

    console.log('[BlueGridAPI] ' + label + (detail ? ' :: ' + detail : ''));

}

function logError(functionName, error, leadId)
{

    const message = (error && error.message) ? error.message : String(error);

    const stack = (error && error.stack) ? String(error.stack) : '';

    console.error('[BlueGridAPI] ' + functionName + ' :: ' + message);

    writeErrorLog(functionName, message, stack, leadId);

}

/* Validation failures are expected traffic, not crashes, but the
   owner still wants to know when real people are being turned away by
   the form — so they land in errorLog with their field detail. */

function logValidationFailure(functionName, fields, leadId)
{

    const summary = Object.keys(fields)
        .map(function (field)
        {

            return field + ': ' + fields[field];

        })
        .join(' | ');

    console.warn('[BlueGridAPI] ' + functionName + ' :: validation :: ' + summary);

    writeErrorLog(functionName, 'VALIDATION_ERROR — ' + summary, '', leadId);

}

/* ============================================================
   ERROR LOG SHEET
============================================================ */

/* Guard against re-entry: writeErrorLog itself touches the
   spreadsheet, and a failure in here must not call logError and
   recurse forever. On failure we fall back to the execution log and
   give up quietly — an error-logging failure must never propagate
   into the lead path. */

let isWritingErrorLog = false;

function writeErrorLog(functionName, errorMessage, stackTrace, leadId)
{

    if (isWritingErrorLog)
    {

        return;

    }

    isWritingErrorLog = true;

    try
    {

        const sheet = getOrCreateSheet(SHEET_NAMES.errorLog);

        sheet.appendRow([

            new Date().toISOString(),

            leadId || '',

            functionName || '',

            String(errorMessage).substring(0, 1000),

            String(stackTrace || '').substring(0, 2000)

        ]);

        sheet
            .getRange(sheet.getLastRow(), 1, 1, ERROR_LOG_HEADERS.length)
            .setNumberFormat('@');

    }
    catch (loggingError)
    {

        console.error('[BlueGridAPI] writeErrorLog failed :: ' + loggingError);

    }
    finally
    {

        isWritingErrorLog = false;

    }

}

/* ============================================================
   SPREADSHEET ACCESS
============================================================ */

/* Works both bound (normal deployment) and standalone (when the
   Script Property LEADS_SPREADSHEET_ID is set). */

function getSpreadsheet()
{

    const boundSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();

    if (boundSpreadsheet)
    {

        return boundSpreadsheet;

    }

    const spreadsheetId = PropertiesService
        .getScriptProperties()
        .getProperty(SPREADSHEET_ID_PROPERTY);

    if (!spreadsheetId)
    {

        throw new Error(
            'No bound spreadsheet and no ' + SPREADSHEET_ID_PROPERTY + ' Script Property set.'
        );

    }

    return SpreadsheetApp.openById(spreadsheetId);

}

/* Returns the named sheet, creating it when absent. For the leads
   tab the canonical header row is written or repaired every time —
   we never trust pre-existing headers. */

function getOrCreateSheet(sheetName)
{

    const spreadsheet = getSpreadsheet();

    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet)
    {

        sheet = spreadsheet.insertSheet(sheetName);

        logInfo('createdSheet', sheetName);

    }

    /* Both structured sheets get their header row verified on every
       access. Repair is cheap; a silently mislabeled header is not. */

    if (sheetName === SHEET_NAMES.leads)
    {

        enforceCanonicalHeaders(sheet, LEADS_HEADERS);

    }
    else if (sheetName === SHEET_NAMES.errorLog)
    {

        enforceCanonicalHeaders(sheet, ERROR_LOG_HEADERS);

    }

    return sheet;

}

/* Writes the canonical header list into row 1 when the row is
   missing, short, or mislabeled. Only the header row is touched —
   data rows are never moved. A single mislabeled header silently
   drops fields on read, which is exactly the defect this prevents. */

function enforceCanonicalHeaders(sheet, headers)
{

    const columnCount = headers.length;

    if (sheet.getMaxColumns() < columnCount)
    {

        sheet.insertColumnsAfter(sheet.getMaxColumns(), columnCount - sheet.getMaxColumns());

    }

    const headerRange = sheet.getRange(1, 1, 1, columnCount);

    const currentHeaders = headerRange.getValues()[0];

    let headersMatch = true;

    for (let index = 0; index < columnCount; index += 1)
    {

        if (String(currentHeaders[index]).trim() !== headers[index])
        {

            headersMatch = false;

            break;

        }

    }

    if (headersMatch)
    {

        return;

    }

    /* Plain text everywhere: ISO timestamps and phone numbers must
       round-trip as strings, never coerce to Date or number cells. */

    sheet.getRange(1, 1, sheet.getMaxRows(), columnCount).setNumberFormat('@');

    headerRange.setValues([headers]);

    headerRange.setFontWeight('bold');

    if (sheet.getFrozenRows() < 1)
    {

        sheet.setFrozenRows(1);

    }

    logInfo('repairedHeaders', sheet.getName());

}

/* ============================================================
   CELL VALUE NORMALIZATION
============================================================ */

/* Hand edits in Sheets can turn an ISO string back into a Date cell.
   Rescue those so the API always emits strings. */

function normalizeCellValue(value)
{

    if (value === null || value === undefined)
    {

        return '';

    }

    if (Object.prototype.toString.call(value) === '[object Date]')
    {

        return value.toISOString();

    }

    return String(value);

}

/* ============================================================
   ROW / OBJECT MAPPING
============================================================ */

/* Reads are keyed off row 1 text; writes are positional in
   LEADS_HEADERS order. Both directions go through here. */

function tableToObjects(sheet)
{

    const lastRow = sheet.getLastRow();

    if (lastRow < 2)
    {

        return [];

    }

    const columnCount = LEADS_HEADERS.length;

    const values = sheet.getRange(2, 1, lastRow - 1, columnCount).getValues();

    return values.map(function (row)
    {

        const record = {};

        LEADS_HEADERS.forEach(function (header, index)
        {

            record[header] = normalizeCellValue(row[index]);

        });

        return parseArrayFields(record);

    });

}

function objectToRow(record)
{

    return LEADS_HEADERS.map(function (header)
    {

        const value = record[header];

        if (value === null || value === undefined)
        {

            return '';

        }

        if (Array.isArray(value))
        {

            return JSON.stringify(value);

        }

        return String(value);

    });

}

/* photoNames and photoUrls live in single cells as JSON array
   strings. Parse them on the way out so callers get real arrays. */

function parseArrayFields(record)
{

    ['photoNames', 'photoUrls'].forEach(function (field)
    {

        record[field] = safeParseArray(record[field]);

    });

    return record;

}

function safeParseArray(value)
{

    if (Array.isArray(value))
    {

        return value;

    }

    if (!value)
    {

        return [];

    }

    try
    {

        const parsed = JSON.parse(value);

        return Array.isArray(parsed) ? parsed : [];

    }
    catch (parseError)
    {

        return [];

    }

}

/* ============================================================
   CONFIG TAB
============================================================ */

/* The owner-editable settings live in the spreadsheet, not in code.
   Cached per execution because a single request can read it several
   times. A missing config tab is not an error — defaults apply. */

let cachedConfig = null;

function getConfig()
{

    if (cachedConfig)
    {

        return cachedConfig;

    }

    const defaults = {

        clientId: CLIENT_ID,

        moduleName: MODULE_NAME,

        notificationEmail: DEFAULT_NOTIFICATION_EMAIL,

        notificationsEnabled: 'true',

        autoReplyEnabled: 'true',

        weeklySummaryDay: 'Monday'

    };

    try
    {

        const spreadsheet = getSpreadsheet();

        const configSheet = spreadsheet.getSheetByName(SHEET_NAMES.config);

        if (configSheet && configSheet.getLastRow() > 1)
        {

            const rows = configSheet
                .getRange(2, 1, configSheet.getLastRow() - 1, 2)
                .getValues();

            rows.forEach(function (row)
            {

                const key = String(row[0]).trim();

                const value = normalizeCellValue(row[1]).trim();

                if (key && value)
                {

                    defaults[key] = value;

                }

            });

        }

    }
    catch (configError)
    {

        logError('getConfig', configError);

    }

    cachedConfig = defaults;

    return cachedConfig;

}

function isConfigFlagEnabled(flagName)
{

    const config = getConfig();

    return String(config[flagName]).toLowerCase() === 'true';

}

/* ============================================================
   AUTHENTICATION
============================================================ */

/* Compared against the MODULE_API_KEY Script Property. leads.create
   is deliberately public — the honeypot and validation are its gate. */

function isAuthorized(providedKey)
{

    if (!providedKey)
    {

        return false;

    }

    const expectedKey = PropertiesService
        .getScriptProperties()
        .getProperty(API_KEY_PROPERTY);

    if (!expectedKey)
    {

        logError('isAuthorized', 'Script Property ' + API_KEY_PROPERTY + ' is not set.');

        return false;

    }

    return String(providedKey) === String(expectedKey);

}
