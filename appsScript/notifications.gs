/* ============================================================
   BLUEGRID API — NOTIFICATIONS

   Every function here is best-effort. The leads sheet is the audit
   trail: by the time these run the row is already committed, so a
   mail failure is logged to the errorLog sheet and swallowed. It must
   never surface as a failed submission to the visitor, and never
   trigger a retry that would duplicate the lead.

   The business owner is the only recipient of customer submissions.
   The recipient address comes from the spreadsheet's "config" tab so
   it can change without a redeploy; config.gs holds the fallback.
============================================================ */

/* ============================================================
   ENTRY POINT
============================================================ */

function sendLeadNotifications(record)
{

    if (!isConfigFlagEnabled('notificationsEnabled'))
    {

        logInfo('notificationsDisabled', record.leadId);

        return;

    }

    sendOwnerNotification(record);

    if (isConfigFlagEnabled('autoReplyEnabled'))
    {

        sendCustomerAutoReply(record);

    }

}

/* ============================================================
   OWNER NOTIFICATION
============================================================ */

/* The business owner is the only recipient. Nulo Studio is
   deliberately not copied — the studio does not belong in the
   customer's email thread. Delivery problems are visible in the
   errorLog sheet instead. */

function sendOwnerNotification(record)
{

    const config = getConfig();

    const ownerRecipient = config.notificationEmail || DEFAULT_NOTIFICATION_EMAIL;

    const subject = 'New Estimate Request — '
        + record.fullName
        + ' (' + record.serviceNeeded + ')';

    const body = buildOwnerEmailBody(record);

    const htmlBody = buildOwnerEmailHtml(record);

    try
    {

        MailApp.sendEmail({

            to: ownerRecipient,

            replyTo: record.email,

            name: NOTIFICATION_SENDER_NAME,

            subject: subject,

            body: body,

            htmlBody: htmlBody

        });

        logInfo('ownerNotificationSent', record.leadId);

    }
    catch (mailError)
    {

        /* The lead is already committed to the sheet, so this is a
           notification problem, not a lost lead. Record it and retry
           once as plain text — some mail failures are specific to the
           HTML payload or the replyTo header. */

        logError('sendOwnerNotification', mailError, record.leadId);

        trySendPlain(ownerRecipient, subject, body, record.leadId);

    }

}

function trySendPlain(recipient, subject, body, leadId)
{

    if (!recipient)
    {

        return;

    }

    try
    {

        MailApp.sendEmail(recipient, subject, body);

        logInfo('fallbackNotificationSent', leadId + ' -> ' + recipient);

    }
    catch (fallbackError)
    {

        logError('trySendPlain', fallbackError, leadId);

    }

}

/* ============================================================
   CUSTOMER AUTO-REPLY
============================================================ */

function sendCustomerAutoReply(record)
{

    if (!record.email)
    {

        return;

    }

    const config = getConfig();

    const subject = 'We got your estimate request — BlueGrid Land Solutions';

    const body = [

        'Hi ' + record.fullName + ',',
        '',
        'Thanks for reaching out to BlueGrid Land Solutions. Your request came',
        'through and the owner will get back to you within 24 hours — usually',
        'a good bit sooner.',
        '',
        'Here is what you sent us:',
        '',
        '  Service requested : ' + record.serviceNeeded,
        '  Property address  : ' + record.propertyAddress,
        '  Approximate acres : ' + (record.estimatedAcres || 'Not specified'),
        '  Reference number  : ' + record.leadId,
        '',
        'If anything above is wrong, just reply to this email and we will fix it.',
        '',
        'Talk soon,',
        'BlueGrid Land Solutions',
        (config.notificationEmail || DEFAULT_NOTIFICATION_EMAIL)

    ].join('\n');

    try
    {

        MailApp.sendEmail({

            to: record.email,

            name: 'BlueGrid Land Solutions',

            replyTo: config.notificationEmail || DEFAULT_NOTIFICATION_EMAIL,

            subject: subject,

            body: body

        });

        logInfo('autoReplySent', record.leadId);

    }
    catch (replyError)
    {

        logError('sendCustomerAutoReply', replyError, record.leadId);

    }

}

/* ============================================================
   EMAIL BODIES
============================================================ */

/* Plain text first — it is what shows in a phone notification and
   what survives every mail client. The five fields the brief calls
   out (name, phone, email, message, timestamp) lead the message. */

function buildOwnerEmailBody(record)
{

    return [

        'NEW ESTIMATE REQUEST',
        '====================',
        '',
        'Name       : ' + record.fullName,
        'Phone      : ' + record.phone,
        'Email      : ' + record.email,
        'Submitted  : ' + formatTimestamp(record.submittedAt),
        '',
        'Message / project description:',
        (record.projectDescription || '(none provided)'),
        '',
        '--- PROPERTY ---',
        'Service    : ' + record.serviceNeeded,
        'Address    : ' + record.propertyAddress,
        'Acres      : ' + (record.estimatedAcres || 'Not specified'),
        '',
        '--- CONTACT PREFERENCE ---',
        'Method     : ' + (record.preferredContactMethod || 'Not specified'),
        'Best time  : ' + (record.preferredTime || 'Not specified'),
        '',
        '--- PHOTOS ---',
        'Attached   : ' + record.photoCount + ' photo(s)',
        'Names      : ' + (formatPhotoNames(record.photoNames) || 'none'),
        'Note       : photos are not uploaded yet — reply or text the customer to request them.',
        '',
        '--- SOURCE ---',
        'Page       : ' + (record.sourcePage || 'unknown'),
        'Lead source: ' + (record.leadSource || 'website'),
        'UTM        : ' + formatAttribution(record),
        '',
        'Reference  : ' + record.leadId,
        '',
        'Reply directly to this email to reach the customer.'

    ].join('\n');

}

function buildOwnerEmailHtml(record)
{

    const rows = [

        ['Name', record.fullName],
        ['Phone', linkifyPhone(record.phone)],
        ['Email', linkifyEmail(record.email)],
        ['Submitted', formatTimestamp(record.submittedAt)],
        ['Service', record.serviceNeeded],
        ['Address', record.propertyAddress],
        ['Acres', record.estimatedAcres || 'Not specified'],
        ['Contact method', record.preferredContactMethod || 'Not specified'],
        ['Best time', record.preferredTime || 'Not specified'],
        ['Photos', record.photoCount + ' attached ' + (formatPhotoNames(record.photoNames) || '')],
        ['Source page', record.sourcePage || 'unknown'],
        ['Lead source', record.leadSource || 'website'],
        ['Attribution', formatAttribution(record)],
        ['Reference', record.leadId]

    ];

    const rowHtml = rows.map(function (pair)
    {

        return '<tr>'
            + '<td style="padding:8px 14px;border-bottom:1px solid #e6eaee;'
            + 'font-weight:600;color:#232A30;white-space:nowrap;">'
            + escapeHtml(pair[0])
            + '</td>'
            + '<td style="padding:8px 14px;border-bottom:1px solid #e6eaee;color:#232A30;">'
            + pair[1]
            + '</td>'
            + '</tr>';

    }).join('');

    return [

        '<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;">',

        '<div style="background:#1C1F22;color:#ffffff;padding:18px 22px;">',
        '<div style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#5B9BD5;">',
        'BlueGrid Land Solutions',
        '</div>',
        '<div style="font-size:22px;font-weight:700;margin-top:4px;">New Estimate Request</div>',
        '</div>',

        '<div style="padding:18px 22px;background:#F7F9FB;">',
        '<div style="font-weight:600;margin-bottom:6px;color:#232A30;">Message / project description</div>',
        '<div style="background:#ffffff;border:1px solid #e6eaee;padding:12px 14px;color:#232A30;white-space:pre-wrap;">',
        escapeHtml(record.projectDescription || '(none provided)'),
        '</div>',
        '</div>',

        '<table style="width:100%;border-collapse:collapse;font-size:14px;">',
        rowHtml,
        '</table>',

        '<div style="padding:14px 22px;background:#F7F9FB;color:#7C8894;font-size:12px;">',
        'Photos are recorded by name only in this phase — reply or text the customer to request the actual images.',
        '<br>Reply directly to this email to reach the customer.',
        '</div>',

        '</div>'

    ].join('');

}

/* ============================================================
   FORMATTING HELPERS
============================================================ */

function formatTimestamp(isoString)
{

    if (!isoString)
    {

        return 'Unknown';

    }

    const parsed = new Date(isoString);

    if (isNaN(parsed.getTime()))
    {

        return String(isoString);

    }

    /* Shown in the business's own timezone, not UTC — the owner
       should never have to do timezone math on a lead. */

    return Utilities.formatDate(
        parsed,
        Session.getScriptTimeZone() || 'America/New_York',
        'EEE, MMM d yyyy \'at\' h:mm a z'
    );

}

function formatPhotoNames(photoNames)
{

    const names = safeParseArray(photoNames);

    if (names.length === 0)
    {

        return '';

    }

    return '(' + names.join(', ') + ')';

}

function formatAttribution(record)
{

    const parts = [];

    if (record.utmSource)
    {

        parts.push('source=' + record.utmSource);

    }

    if (record.utmMedium)
    {

        parts.push('medium=' + record.utmMedium);

    }

    if (record.utmCampaign)
    {

        parts.push('campaign=' + record.utmCampaign);

    }

    if (record.facebookCampaign)
    {

        parts.push('fb=' + record.facebookCampaign);

    }

    return parts.length ? parts.join(' · ') : 'direct / none';

}

function linkifyPhone(phone)
{

    const digits = String(phone).replace(/\D/g, '');

    return '<a href="tel:' + digits + '" style="color:#3E7CB8;">' + escapeHtml(phone) + '</a>';

}

function linkifyEmail(email)
{

    return '<a href="mailto:' + encodeURI(email) + '" style="color:#3E7CB8;">'
        + escapeHtml(email)
        + '</a>';

}

function escapeHtml(value)
{

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

}
