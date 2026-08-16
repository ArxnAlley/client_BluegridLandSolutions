/* ============================================================
   BLUEGRID — ANALYTICS CONSENT

   Nothing in Google Analytics or Microsoft Clarity loads until the
   visitor says yes. This file is the only thing on the site that
   injects either tag, so consent cannot be bypassed by editing a
   page: the loaders exist in exactly one place.

   WHY THE TAGS ARE NOT IN THE PAGE HEAD
   A banner that appears while the trackers are already running is
   theatre. Both vendors are loaded from here, after a stored grant
   is read or an Accept is clicked, and never before.

   WHY GOOGLE CONSENT MODE IS STILL USED
   Even though gtag.js is withheld until consent, the Consent Mode
   defaults are declared up front and updated on the visitor's
   decision. That is the handshake Google documents, it makes the
   tag's state unambiguous the moment it does load, and it means a
   future Ads or Search Console tag inherits the same decision
   instead of needing its own gate.

   LOADED WITH defer, BEFORE indexJS.js
   Deferred scripts run in document order, so this file always
   finishes before js/indexJS.js starts. That is what lets
   trackAnalyticsEvent() ask this module whether it may send.

   STORAGE
   localStorage.bluegridConsent = { version, analytics, decidedAt }
   The version is what allows a future policy change to invalidate
   every stored decision and re-ask, rather than silently keeping a
   consent that was given for different terms.
============================================================ */

'use strict';

(function ()
{

    /* ============================================================
       CONSTANTS
    ============================================================ */

    /* Bump this when the policy materially changes. Every stored
       decision made under an older version is treated as no decision
       at all, and the banner asks again. */

    const CONSENT_VERSION = 1;

    const STORAGE_KEY = 'bluegridConsent';

    const GA4_MEASUREMENT_ID = 'G-VLELCYHTQ8';

    const CLARITY_PROJECT_ID = 'y30pzk1nix';

    /* First-party cookies the two vendors set. Cleared on withdrawal
       so a visitor who changes their mind is not left carrying the
       identifiers their previous decision created. CLID is set on
       clarity.ms rather than this domain, so it cannot be reached
       from here — the reload below stops it being refreshed. */

    const ANALYTICS_COOKIE_PREFIXES = ['_ga', '_gid', '_clck', '_clsk'];


    /* ============================================================
       CONSENT MODE DEFAULTS
    ============================================================ */

    window.dataLayer = window.dataLayer || [];

    function gtag()
    {

        window.dataLayer.push(arguments);

    }

    window.gtag = gtag;

    /* Denied until told otherwise. functionality and security storage
       stay granted: they cover the site working at all, not tracking. */

    gtag('consent', 'default', {

        ad_storage: 'denied',

        ad_user_data: 'denied',

        ad_personalization: 'denied',

        analytics_storage: 'denied',

        functionality_storage: 'granted',

        security_storage: 'granted'

    });


    /* ============================================================
       STORED DECISION
    ============================================================ */

    let analyticsLoaded = false;

    /* Every storage read is guarded. Safari in private mode and any
       browser with site data disabled throw on localStorage access,
       and an exception here would take the whole page down with it.
       A visitor whose storage is unavailable is treated as undecided,
       which means analytics stays off. */

    function readConsent()
    {

        try
        {

            const raw = window.localStorage.getItem(STORAGE_KEY);

            if (!raw)
            {

                return null;

            }

            const parsed = JSON.parse(raw);

            if (!parsed || parsed.version !== CONSENT_VERSION)
            {

                return null;

            }

            if (typeof parsed.analytics !== 'boolean')
            {

                return null;

            }

            return parsed;

        }
        catch (storageError)
        {

            return null;

        }

    }

    function writeConsent(analyticsAllowed)
    {

        try
        {

            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({

                    version: CONSENT_VERSION,

                    analytics: analyticsAllowed,

                    decidedAt: new Date().toISOString()

                })
            );

        }
        catch (storageError)
        {

            /* The decision still applies to this page view — it just
               cannot be remembered for the next one. */

        }

    }

    function hasDecision()
    {

        return readConsent() !== null;

    }

    function analyticsGranted()
    {

        const stored = readConsent();

        return stored !== null && stored.analytics === true;

    }


    /* ============================================================
       LOADING THE VENDORS
    ============================================================ */

    function injectScript(source)
    {

        const tag = document.createElement('script');

        tag.async = true;

        tag.src = source;

        const first = document.getElementsByTagName('script')[0];

        if (first && first.parentNode)
        {

            first.parentNode.insertBefore(tag, first);

            return;

        }

        document.head.appendChild(tag);

    }

    /* Idempotent by design. Called on a stored grant at boot and again
       on an Accept click; the flag is what stops a second call adding
       a second gtag.js and double-counting every session. */

    function loadAnalytics()
    {

        if (analyticsLoaded)
        {

            return;

        }

        analyticsLoaded = true;

        gtag('consent', 'update', {

            analytics_storage: 'granted'

        });

        injectScript('https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID);

        gtag('js', new Date());

        gtag('config', GA4_MEASUREMENT_ID);

        loadClarity();

    }

    /* Clarity's own snippet, with the queue stub it needs so calls
       made before the tag arrives are not lost. Withholding this
       function until consent is the real gate; the clarity('consent')
       call below is the vendor's documented acknowledgement of it. */

    function loadClarity()
    {

        (function (c, l, a, r, i, t, y)
        {

            c[a] = c[a] || function ()
            {

                (c[a].q = c[a].q || []).push(arguments);

            };

            t = l.createElement(r);
            t.async = 1;
            t.src = 'https://www.clarity.ms/tag/' + i;

            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);

        })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);

        if (typeof window.clarity === 'function')
        {

            window.clarity('consent');

        }

    }


    /* ============================================================
       WITHDRAWAL
    ============================================================ */

    function clearAnalyticsCookies()
    {

        /* Cleared against both the exact host and the dot-prefixed
           registrable domain, because GA sets on the latter and a
           delete only works when the domain and path match what was
           written. */

        const hostname = window.location.hostname;

        const domains = ['', hostname, '.' + hostname];

        const parts = hostname.split('.');

        if (parts.length > 2)
        {

            domains.push('.' + parts.slice(-2).join('.'));

        }

        document.cookie.split(';').forEach(function (entry)
        {

            const name = entry.split('=')[0].trim();

            const isAnalyticsCookie = ANALYTICS_COOKIE_PREFIXES.some(function (prefix)
            {

                return name === prefix || name.indexOf(prefix) === 0;

            });

            if (!isAnalyticsCookie)
            {

                return;

            }

            domains.forEach(function (domain)
            {

                document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
                    + (domain ? '; domain=' + domain : '');

            });

        });

    }

    /* A script that has already executed cannot be un-executed. So a
       withdrawal writes the decision, tells Consent Mode, clears the
       identifiers, and then reloads — which is the only honest way to
       stop a tag that is already running. On a page where nothing was
       ever loaded, the reload is skipped. */

    function denyAnalytics(options)
    {

        const wasLoaded = analyticsLoaded;

        writeConsent(false);

        gtag('consent', 'update', {

            analytics_storage: 'denied'

        });

        clearAnalyticsCookies();

        hideBanner();

        if (wasLoaded && (!options || options.reload !== false))
        {

            window.location.reload();

        }

    }

    function grantAnalytics()
    {

        writeConsent(true);

        loadAnalytics();

        hideBanner();

    }


    /* ============================================================
       BANNER
    ============================================================ */

    /* Mirrors the site's own relative-link convention rather than
       using a root-relative path, so the banner's privacy link
       resolves the same way every other link on the page does —
       including when the site is opened from disk. */

    function resolvePrivacyHref()
    {

        const segments = window.location.pathname.split('/').filter(Boolean);

        const last = segments[segments.length - 1] || '';

        const folderDepth = last.indexOf('.') !== -1
            ? segments.length - 1
            : segments.length;

        return folderDepth > 0
            ? '../privacy/index.html'
            : 'privacy/index.html';

    }

    let bannerElement = null;

    function buildBanner()
    {

        const banner = document.createElement('section');

        banner.className = 'consentBanner';

        banner.id = 'consentBanner';

        /* A region, not a dialog. It does not trap focus and it does
           not cover the page — the visitor can read, navigate and
           request an estimate without answering it. */

        banner.setAttribute('role', 'region');

        banner.setAttribute('aria-label', 'Privacy choices');

        /* Written for a landowner, not a developer, and kept to one
           sentence. The detail it does not carry — which vendors run,
           what is masked from them, that the choice is reversible —
           all lives one click away on the privacy page, which is why
           the link below is part of the copy rather than an extra.
           Cookie Settings in the footer of every page is the other
           half of that: the banner stays short because neither the
           disclosure nor the way back is trapped inside it. */

        /* THE CLOSE BUTTON CARRIES data-consentreject, NOT A HOOK OF
           ITS OWN. Dismissing the banner is a refusal, so it runs the
           exact same denyAnalytics() path the Decline button does —
           identical behaviour by construction rather than by two
           parallel branches that could drift apart later.

           Closing therefore persists the refusal and leaves both
           vendors blocked. It never implies consent, and the
           aria-label says so out loud rather than announcing a bare
           "close" that would hide the consequence from anyone not
           looking at the screen. */

        banner.innerHTML =
            '<div class="consentBannerInner">'
            + '<button class="consentBannerClose" type="button" data-consentreject '
            + 'aria-label="Decline cookies and close this notice">'
            + '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
            + '<path d="M6 6 L18 18 M18 6 L6 18"></path>'
            + '</svg>'
            + '</button>'
            + '<div class="consentBannerCopy">'
            + '<p class="consentBannerHeading">Cookies &amp; Privacy</p>'
            + '<p class="consentBannerText">'
            + 'This website uses cookies to understand how visitors use the site and '
            + 'improve their experience. '
            + '<a class="consentBannerLink" href="' + resolvePrivacyHref() + '">Read our privacy policy</a>.'
            + '</p>'
            + '</div>'
            + '<div class="consentBannerActions">'
            + '<button class="consentButton consentButtonAccept" type="button" data-consentaccept>Allow Cookies</button>'
            + '<button class="consentButton consentButtonReject" type="button" data-consentreject>Decline Cookies</button>'
            + '</div>'
            + '</div>';

        return banner;

    }

    /* The floating mobile bar and the back-to-top button are both
       pinned to the bottom of the viewport, and both add this offset
       to their own. Publishing the banner's measured height keeps
       them clear of it instead of being buried underneath — on a
       phone those are the call and estimate buttons, which must stay
       reachable while the banner is still unanswered. */

    function publishBannerOffset()
    {

        if (!bannerElement)
        {

            return;

        }

        const height = Math.ceil(bannerElement.getBoundingClientRect().height);

        document.documentElement.style.setProperty(
            '--consentBannerOffset',
            height + 'px'
        );

    }

    function clearBannerOffset()
    {

        document.documentElement.style.removeProperty('--consentBannerOffset');

    }

    function showBanner()
    {

        if (!bannerElement)
        {

            bannerElement = buildBanner();

            document.body.appendChild(bannerElement);

        }

        /* Appended, then flagged on the next frame so the entrance
           transition has two states to move between. */

        window.requestAnimationFrame(function ()
        {

            bannerElement.classList.add('isVisible');

            publishBannerOffset();

        });

    }

    function hideBanner()
    {

        if (!bannerElement)
        {

            return;

        }

        bannerElement.classList.remove('isVisible');

        clearBannerOffset();

    }

    function reopenBanner()
    {

        showBanner();

        const acceptButton = bannerElement.querySelector('[data-consentaccept]');

        /* Reopening is a deliberate act, so moving focus into the
           banner is helpful here in a way it would not be on load. */

        if (acceptButton)
        {

            acceptButton.focus();

        }

    }


    /* ============================================================
       EVENT LISTENERS
    ============================================================ */

    /* Delegated, so the banner can be built and rebuilt without
       rebinding, and so the footer's Cookie Settings control works on
       every page without this file knowing where it sits. */

    document.addEventListener('click', function (event)
    {

        if (!event.target.closest)
        {

            return;

        }

        if (event.target.closest('[data-consentaccept]'))
        {

            grantAnalytics();

            return;

        }

        if (event.target.closest('[data-consentreject]'))
        {

            denyAnalytics();

            return;

        }

        const settingsControl = event.target.closest('[data-consentsettings]');

        if (settingsControl)
        {

            event.preventDefault();

            reopenBanner();

        }

    });

    /* The banner reflows from one row to two as the viewport narrows,
       so its height changes. Re-measured on resize while it is up,
       otherwise the floating bar's offset would be stale and either
       overlap it or float above nothing. */

    window.addEventListener('resize', function ()
    {

        if (bannerElement && bannerElement.classList.contains('isVisible'))
        {

            publishBannerOffset();

        }

    });


    /* ============================================================
       PUBLIC API
    ============================================================ */

    /* js/indexJS.js asks analyticsGranted() before sending any event,
       so a denied visitor produces no gtag traffic at all rather than
       quietly queueing events into a dataLayer nobody will read. */

    window.blueGridConsent = {

        version: CONSENT_VERSION,

        hasDecision: hasDecision,

        analyticsGranted: analyticsGranted,

        grant: grantAnalytics,

        deny: denyAnalytics,

        openSettings: reopenBanner

    };


    /* ============================================================
       BOOT
    ============================================================ */

    if (analyticsGranted())
    {

        loadAnalytics();

    }

    document.addEventListener('DOMContentLoaded', function ()
    {

        if (!hasDecision())
        {

            showBanner();

        }

    });

}());
