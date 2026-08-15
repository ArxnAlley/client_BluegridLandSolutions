/* ============================================================
   BLUEGRID API — PHOTO STORAGE

   Where submitted project photos actually live.

   Phase 1 recorded photoCount and photoNames only. The browser held
   the files, animated a progress bar at them, and dropped them on
   submit — so the owner received an email naming photos that existed
   nowhere. This module is the storage half of the fix: the website
   uploads each photo to leads.addPhotos before it creates the lead,
   and leads.create then asks this module what actually arrived rather
   than taking the browser's word for it.

   Layout — one folder per lead under a single root:

     BlueGrid Lead Photos/
       BG-0001 · Dale Compton · BG-1786635839698/
         01-backLot.jpg
         02-frontField.jpg

   The folder is created under the referenceId, which is the only
   identifier that exists while photos are still uploading, and
   relabelled with the sequential leadId once the row is written.

   Nothing in this file is ever allowed to fail a lead. Every entry
   point either returns an empty result or logs and returns: a photo
   problem must cost photos, never the customer's enquiry.
============================================================ */

/* ============================================================
   ADD PHOTO  (public — the website posts here, one photo per call)
============================================================ */

function handleAddPhoto(payload)
{

    /* Declared out here so the catch can still name the reference even
       when the throw happened inside validation. */

    let referenceId = '';

    try
    {

        const validation = validatePhotoPayload(payload || {});

        referenceId = validation.clean.referenceId || '';

        if (!validation.valid)
        {

            logValidationFailure('handleAddPhoto', validation.fields, referenceId);

            return errorResponse(
                ERROR_CODES.validation,
                'That photo could not be accepted.',
                validation.fields
            );

        }

        const folder = getLeadPhotoFolder(validation.clean.referenceId, true);

        if (!folder)
        {

            return errorResponse(
                ERROR_CODES.serverError,
                'Photo storage is unavailable.'
            );

        }

        const targetName = buildPhotoFileName(validation.clean.index, validation.clean.fileName);

        /* Idempotent by name: a retried upload finds the file it wrote
           last time and returns that, rather than storing a second
           copy of the same photo. */

        const alreadyStored = folder.getFilesByName(targetName);

        if (alreadyStored.hasNext())
        {

            return successResponse({

                photo: describePhotoFile(alreadyStored.next()),

                duplicate: true

            });

        }

        /* Every limit below is enforced HERE rather than trusted from
           the browser. The website applies the same numbers first so a
           customer gets instant feedback, but this endpoint is public
           and anonymous: the front end is a courtesy and this is the
           control. Counted from the folder's real contents, so
           spreading a payload across requests cannot defeat it. */

        const folderState = summarizeFolderContents(folder);

        if (folderState.count >= MAX_PHOTOS_PER_LEAD)
        {

            logInfo('photoRejected', validation.clean.referenceId
                + ' :: photo limit (' + MAX_PHOTOS_PER_LEAD + ') reached');

            return errorResponse(
                ERROR_CODES.validation,
                'That is the maximum number of photos for one request.',
                { index: 'Too many photos.' }
            );

        }

        if ((folderState.bytes + validation.clean.byteSize) > MAX_TOTAL_PHOTO_BYTES)
        {

            logInfo('photoRejected', validation.clean.referenceId
                + ' :: combined size would reach '
                + (folderState.bytes + validation.clean.byteSize) + ' bytes');

            return errorResponse(
                ERROR_CODES.validation,
                'Those photos are too large in total.',
                { dataBase64: 'Combined photo size is too large.' }
            );

        }

        /* Global ceiling, checked last so a rejected upload never
           consumes throttle budget. */

        if (!consumePhotoUploadAllowance())
        {

            logError(
                'handleAddPhoto',
                new Error('upload throttle reached for this hour'),
                validation.clean.referenceId
            );

            return errorResponse(
                ERROR_CODES.serverError,
                'Photos cannot be accepted right now. Please try again shortly.'
            );

        }

        if (validation.clean.mimeTypeMismatch)
        {

            logInfo('photoTypeMismatch', validation.clean.referenceId
                + ' :: ' + validation.clean.mimeTypeMismatch);

        }

        const blob = Utilities.newBlob(
            Utilities.base64Decode(validation.clean.dataBase64),
            validation.clean.mimeType,
            targetName
        );

        const file = folder.createFile(blob);

        logInfo('photoStored', validation.clean.referenceId + ' :: ' + targetName
            + ' :: ' + validation.clean.detected.type + ' :: ' + validation.clean.byteSize + ' bytes');

        return successResponse({

            photo: describePhotoFile(file)

        });

    }
    catch (photoError)
    {

        /* The customer sees "That photo could not be saved." and never
           anything more. The real exception — including the Drive
           authorization message, which is the one that actually
           stopped this working in production — goes to the errorLog
           sheet with its stack, tagged with the reference so it can be
           matched to the lead row. */

        logError('handleAddPhoto', photoError, referenceId);

        return errorResponse(
            ERROR_CODES.serverError,
            'That photo could not be saved.'
        );

    }

}

/* ============================================================
   ERROR DESCRIPTION  (internal only — never sent to a customer)
============================================================ */

/* Apps Script throws several shapes: real Errors, bare strings, and
   the permission objects the runtime raises when a scope is missing.
   Flattens all of them to one short internal line. */

function describePhotoError(error)
{

    if (!error)
    {

        return 'unknown error';

    }

    const name = error.name ? String(error.name) : 'Error';

    const message = error.message ? String(error.message) : String(error);

    return (name + ': ' + message).substring(0, 300);

}

/* ============================================================
   RESOLUTION  (leads.create asks what actually arrived)
============================================================ */

/* Reads the folder rather than accepting URLs from the client. That
   is the whole security model for this feature: the owner's email is
   built from links this script wrote itself, so a hand-crafted POST
   cannot put an arbitrary URL in front of the owner.

   Returns empty on any failure — a lead with no photo links is worth
   far more than no lead. */

function resolveLeadPhotos(referenceId)
{

    /* `failed` is the distinction this function used to lose. An empty
       result meant both "the customer attached nothing" and "Drive
       threw and we swallowed it", so the owner's email could not tell
       a quiet lead from a broken pipeline. The flag never reaches the
       sheet — objectToRow only writes LEADS_HEADERS — it exists so the
       owner email can say which of the two happened. */

    const empty = {

        urls: [],

        names: [],

        folderUrl: '',

        folderId: '',

        failed: false,

        failureReason: ''

    };

    try
    {

        const folder = getLeadPhotoFolder(referenceId, false);

        if (!folder)
        {

            return empty;

        }

        const files = [];

        const iterator = folder.getFiles();

        while (iterator.hasNext())
        {

            files.push(iterator.next());

        }

        if (files.length === 0)
        {

            return empty;

        }

        /* Stored names carry a zero-padded position prefix, so sorting
           by name restores the order the visitor chose them in. */

        files.sort(function (first, second)
        {

            return String(first.getName()).localeCompare(String(second.getName()));

        });

        return {

            urls: files.map(function (file) { return file.getUrl(); }),

            names: files.map(function (file) { return file.getName(); }),

            folderUrl: folder.getUrl(),

            folderId: folder.getId(),

            failed: false,

            failureReason: ''

        };

    }
    catch (resolveError)
    {

        logError('resolveLeadPhotos', resolveError, referenceId);

        /* Still returns empty arrays, so a storage fault can never cost
           the lead — but now it says so. */

        return {

            urls: [],

            names: [],

            folderUrl: '',

            folderId: '',

            failed: true,

            failureReason: describePhotoError(resolveError)

        };

    }

}

/* Renames the upload folder once the lead has a sequential number, so
   the owner's Drive reads "BG-0001 · Dale Compton" instead of a wall
   of timestamps. The reference stays on the end because it is what
   the customer would quote.

   Best-effort by design: the links are already on the row and keep
   working whatever happens here. */

function labelPhotoFolder(folderId, leadId, fullName, referenceId)
{

    if (!folderId)
    {

        return;

    }

    try
    {

        DriveApp
            .getFolderById(folderId)
            .setName(leadId + ' · ' + (fullName || 'Lead') + ' · ' + referenceId);

    }
    catch (labelError)
    {

        logError('labelPhotoFolder', labelError, leadId);

    }

}

/* ============================================================
   FOLDERS
============================================================ */

/* The root is looked up by id from a Script Property, falling back to
   a search by name and finally to creating it. The property means the
   normal path is one property read; the fallbacks mean someone moving
   or deleting the folder costs one slow execution rather than every
   upload from then on. */

function getPhotoRootFolder()
{

    const properties = PropertiesService.getScriptProperties();

    const storedId = properties.getProperty(PHOTO_ROOT_FOLDER_PROPERTY);

    if (storedId)
    {

        try
        {

            return DriveApp.getFolderById(storedId);

        }
        catch (missingFolderError)
        {

            logError('getPhotoRootFolder', missingFolderError);

        }

    }

    const existing = DriveApp.getFoldersByName(PHOTO_ROOT_FOLDER_NAME);

    const folder = existing.hasNext()
        ? existing.next()
        : DriveApp.createFolder(PHOTO_ROOT_FOLDER_NAME);

    properties.setProperty(PHOTO_ROOT_FOLDER_PROPERTY, folder.getId());

    return folder;

}

/* Found by exact referenceId, which is safe because the relabel only
   happens after the lead row is written and no upload for that
   reference can still be in flight by then. */

function getLeadPhotoFolder(referenceId, createIfMissing)
{

    const root = getPhotoRootFolder();

    const matches = root.getFoldersByName(referenceId);

    if (matches.hasNext())
    {

        return matches.next();

    }

    if (!createIfMissing)
    {

        return null;

    }

    const created = root.createFolder(referenceId);

    applyPhotoFolderAccess(created);

    return created;

}

/* Runs once per newly created lead folder.

   Under the approved architecture this does NOTHING, and that is the
   point: access comes from a single Viewer grant on the photo root,
   applied once by shareRootFolderWithOwner(), which every folder and
   file beneath it inherits. A customer submission performs no Drive
   sharing call, so there is no per-estimate "shared with you" mail, no
   per-lead grant to fail silently, and no growing list of individually
   shared folders.

   Only the deliberate anyoneWithLink escape hatch still shares here. */

function applyPhotoFolderAccess(folder)
{

    const config = getConfig();

    const requested = String(config.photoAccess || '').trim();

    const recognised = PHOTO_ACCESS_MODES.indexOf(requested) !== -1;

    if (!recognised && requested)
    {

        /* Names the bad value rather than silently correcting it — a
           typo in the config tab used to be indistinguishable from a
           deliberate setting. Not an error: the fallback is the safe
           mode, so the lead proceeds normally. */

        logInfo(
            'applyPhotoFolderAccess',
            'unrecognised photoAccess "' + requested
            + '" — falling back to ' + DEFAULT_PHOTO_ACCESS
        );

    }

    const mode = recognised ? requested : DEFAULT_PHOTO_ACCESS;

    if (mode === 'rootInherited')
    {

        return;

    }

    try
    {

        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        logInfo('applyPhotoFolderAccess', 'link sharing applied to ' + folder.getName());

    }
    catch (sharingError)
    {

        /* Storage still succeeded, so the lead is never failed for
           this — but it is recorded loudly enough to find. */

        logError('applyPhotoFolderAccess', sharingError);

    }

}

/* ============================================================
   ROOT FOLDER ACCESS — DRIVE PRIMITIVES

   The three functions a human actually runs live in Code.gs, with
   every other editor entry point. The reason is mechanical: the Apps
   Script editor's Run selector lists the functions of the file
   currently open, so admin entry points scattered across modules are
   invisible unless you happen to have the right file open. Code.gs is
   the one file that is always open.

   What stays here is the Drive work itself. None of it is reachable
   from routes.gs, and neither handleCreateLead nor handleAddPhoto
   calls any of it — a sharing call on the submission path is exactly
   what this architecture removed.
============================================================ */

/* Removes Viewer from the photo root for one address.

   Scope is the root folder and nothing else. Returns a description
   rather than throwing when the account was not a viewer to begin
   with, so a repeated revoke is safe. */

function revokeRootFolderViewerByEmail(emailAddress)
{

    const target = String(emailAddress || '').trim();

    if (!target)
    {

        throw new Error('revokeRootFolderViewerByEmail needs an address.');

    }

    const root = getPhotoRootFolder();

    if (!folderHasViewer(root, target))
    {

        return 'NOT A VIEWER (no change made)'
            + '\n  folder : ' + root.getName()
            + '\n  account: ' + target;

    }

    try
    {

        root.removeViewer(target);

    }
    catch (revokeError)
    {

        logError('revokeRootFolderViewerByEmail', revokeError, target);

        throw new Error('Revoke failed for ' + target + ': ' + describePhotoError(revokeError));

    }

    return 'REVOKED'
        + '\n  folder : ' + root.getName()
        + '\n  account: ' + target;

}

/* Every account that can currently see the photo root, lowercased.
   Viewers and editors together — for "can this account open the
   links?" the distinction does not matter. */

function rootFolderViewerEmails()
{

    const root = getPhotoRootFolder();

    return root.getViewers()
        .concat(root.getEditors())
        .map(function (user) { return String(user.getEmail()).trim().toLowerCase(); });

}

function folderHasViewer(folder, emailAddress)
{

    const wanted = String(emailAddress).trim().toLowerCase();

    /* Editors are checked too: an account that already has edit access
       is not "missing" access, and calling addViewer on it would
       silently downgrade nothing and report a misleading success. */

    const holders = folder.getViewers().concat(folder.getEditors());

    return holders.some(function (user)
    {

        return String(user.getEmail()).trim().toLowerCase() === wanted;

    });

}

/* ============================================================
   HELPERS
============================================================ */

/* Zero-padded so a plain name sort puts photo 2 before photo 10. */

function buildPhotoFileName(index, fileName)
{

    const position = Math.floor(Number(index) || 1);

    const padded = (position < 10) ? ('0' + position) : String(position);

    return padded + '-' + fileName;

}

/* The stored name carries the position prefix; the owner should not
   have to read past it. */

function displayPhotoName(storedName)
{

    return String(storedName).replace(/^\d{2,}-/, '');

}

function describePhotoFile(file)
{

    return {

        fileId: file.getId(),

        name: file.getName(),

        url: file.getUrl()

    };

}

function countFolderFiles(folder)
{

    return summarizeFolderContents(folder).count;

}

/* One pass for both caps. The combined-size limit has to come from
   what is already on disk: each photo is its own POST, so no single
   request can see the total and a client-reported running total would
   be worth exactly nothing. */

function summarizeFolderContents(folder)
{

    const iterator = folder.getFiles();

    let count = 0;

    let bytes = 0;

    while (iterator.hasNext())
    {

        const file = iterator.next();

        count += 1;

        try
        {

            bytes += Number(file.getSize()) || 0;

        }
        catch (sizeError)
        {

            /* A size we cannot read must not be treated as zero, or an
               unreadable file would quietly raise the ceiling. Charge
               the per-photo maximum instead. */

            bytes += MAX_PHOTO_BYTES;

        }

    }

    return { count: count, bytes: bytes };

}

/* ============================================================
   UPLOAD THROTTLE
============================================================ */

/* Coarse global ceiling per clock hour. Apps Script gives a web app no
   client IP, so per-caller limiting is impossible here — this bounds
   total damage rather than identifying an attacker.

   CacheService increments are not atomic, so a burst can undercount
   slightly. That is acceptable: this is a safety net against an
   unattended script, not an accounting record, and undercounting fails
   towards accepting a real customer's photo. */

function consumePhotoUploadAllowance()
{

    try
    {

        const cache = CacheService.getScriptCache();

        const limit = Number(getConfig().photoUploadsPerHour) || DEFAULT_PHOTO_UPLOADS_PER_HOUR;

        const key = PHOTO_THROTTLE_CACHE_PREFIX
            + Utilities.formatDate(new Date(), 'Etc/UTC', 'yyyyMMddHH');

        const used = Number(cache.get(key)) || 0;

        if (used >= limit)
        {

            return false;

        }

        cache.put(key, String(used + 1), 3900);

        return true;

    }
    catch (throttleError)
    {

        /* The throttle failing open is the right trade: a cache outage
           must not stop a real customer sending photographs, and every
           per-lead cap above still applies. */

        logError('consumePhotoUploadAllowance', throttleError);

        return true;

    }

}
