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

    const validation = validatePhotoPayload(payload);

    if (!validation.valid)
    {

        logValidationFailure('handleAddPhoto', validation.fields, validation.clean.referenceId);

        return errorResponse(
            ERROR_CODES.validation,
            'That photo could not be accepted.',
            validation.fields
        );

    }

    try
    {

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

        /* Enforced here rather than trusted from the browser — this
           endpoint is public, so the website's own limit is a
           courtesy and this is the control. */

        if (countFolderFiles(folder) >= MAX_PHOTOS_PER_LEAD)
        {

            return errorResponse(
                ERROR_CODES.validation,
                'That is the maximum number of photos for one request.',
                { index: 'Too many photos.' }
            );

        }

        const blob = Utilities.newBlob(
            Utilities.base64Decode(validation.clean.dataBase64),
            validation.clean.mimeType,
            targetName
        );

        const file = folder.createFile(blob);

        logInfo('photoStored', validation.clean.referenceId + ' :: ' + targetName);

        return successResponse({

            photo: describePhotoFile(file)

        });

    }
    catch (photoError)
    {

        logError('handleAddPhoto', photoError, validation.clean.referenceId);

        return errorResponse(
            ERROR_CODES.serverError,
            'That photo could not be saved.'
        );

    }

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

    const empty = {

        urls: [],

        names: [],

        folderUrl: '',

        folderId: ''

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

            folderId: folder.getId()

        };

    }
    catch (resolveError)
    {

        logError('resolveLeadPhotos', resolveError, referenceId);

        return empty;

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

/* Sharing is applied to the folder rather than to each file, so it is
   one call per lead and any photo added later inherits it. */

function applyPhotoFolderAccess(folder)
{

    const config = getConfig();

    const mode = (PHOTO_ACCESS_MODES.indexOf(config.photoAccess) !== -1)
        ? config.photoAccess
        : DEFAULT_PHOTO_ACCESS;

    if (mode === 'private')
    {

        return;

    }

    try
    {

        if (mode === 'anyoneWithLink')
        {

            folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

            return;

        }

        /* Granting view access to the account that already owns the
           folder throws, and that case needs no grant at all — which
           is why this is inside the try rather than guarded. */

        folder.addViewer(config.notificationEmail || DEFAULT_NOTIFICATION_EMAIL);

    }
    catch (sharingError)
    {

        /* A convenience, not a requirement: the photos are stored
           either way and the owner can always reach them from Drive
           directly. */

        logError('applyPhotoFolderAccess', sharingError);

    }

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

    const iterator = folder.getFiles();

    let count = 0;

    while (iterator.hasNext())
    {

        iterator.next();

        count += 1;

    }

    return count;

}
