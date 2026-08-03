/* ============================================================
   BLUEGRID API — ROUTE REGISTRY

   One table describing every action: which HTTP method it answers,
   whether it needs the module API key, and which handler runs it.
   Adding an endpoint (for example Phase 11's leads.addPhotos) means
   adding a row here and writing the handler — nothing else changes.
============================================================ */

const ROUTES = {

    'ping': {

        method: 'GET',

        requiresAuth: false,

        handler: function ()
        {

            return successResponse({

                module: MODULE_NAME,

                clientId: CLIENT_ID,

                version: API_VERSION,

                time: new Date().toISOString()

            });

        }

    },

    'leads.list': {

        method: 'GET',

        requiresAuth: true,

        handler: function ()
        {

            return handleListLeads();

        }

    },

    /* Deliberately public: this is the website's form endpoint and a
       browser cannot hold a secret. The honeypot, validation, and
       dedupe are its gate. */

    'leads.create': {

        method: 'POST',

        requiresAuth: false,

        handler: function (payload)
        {

            return handleCreateLead(payload);

        }

    },

    'leads.update': {

        method: 'POST',

        requiresAuth: true,

        handler: function (payload)
        {

            return handleUpdateLead(payload);

        }

    }

};

/* ============================================================
   DISPATCH
============================================================ */

function dispatchAction(action, method, payload, providedKey)
{

    const route = ROUTES[action];

    if (!route)
    {

        logInfo('unknownAction', String(action));

        return errorResponse(
            ERROR_CODES.unknownAction,
            'Unknown action: ' + action
        );

    }

    if (route.method !== method)
    {

        return errorResponse(
            ERROR_CODES.unknownAction,
            'Action ' + action + ' expects ' + route.method + '.'
        );

    }

    if (route.requiresAuth && !isAuthorized(providedKey))
    {

        logInfo('unauthorized', action);

        return errorResponse(
            ERROR_CODES.unauthorized,
            'A valid apiKey is required for this action.'
        );

    }

    return route.handler(payload);

}
