/* ============================================================
   BLUEGRID LAND SOLUTIONS — HOMEPAGE SCRIPTS
   Flagship Nulo Studio build — reusable systems are marked.
============================================================ */

/* ============================================================
   BUSINESS CONFIG
============================================================ */

const businessConfig = {

    // The BlueGridAPI Apps Script Web App. THIS IS THE ONLY PLACE the
    // endpoint is written down — index.html, all 7 service pages, and
    // all 6 location pages share this one file, and there is exactly
    // one fetch() call site (submitEstimateRequest). A future
    // redeployment is a one-line change here and nowhere else.
    //
    // Redeploy note: use Deploy → Manage deployments → edit → New
    // version, which keeps this /exec URL stable. Creating a *new*
    // deployment mints a different URL and silently breaks every form
    // on the site. See appsScript/README.md.
    //
    // If this is ever blanked, the form SIMULATES success: the payload
    // is logged to the console, nothing reaches the sheet, and no email
    // is sent. submitEstimateRequest() warns loudly when that happens.
    estimateEndpoint: 'https://script.google.com/macros/s/AKfycbzFolev7d8cjWopIe_Z7zfMJ27SDw4HgQ9qIsxSuGiBz0anc-R_IebTlG0mKDtD3IhD/exec',

    // TODO: Confirm phone number with the owner — pulled from the BlueGrid flyer.
    phoneDisplay: '(740) 464-2526',

    phoneHref: 'tel:+17404642526',

    // TODO: Replace with the real business email address.
    email: 'estimates@bluegridlandsolutions.com',

    emailHref: 'mailto:estimates@bluegridlandsolutions.com',

    // Official BlueGrid Land Solutions Facebook page.
    facebookUrl: 'https://www.facebook.com/profile.php?id=61587582490592',

    // The Facebook URL above is now the real page — flipping this to true is
    // all that remains, once the client confirms the page renders in the
    // Page Plugin. The embed is then injected into #facebookEmbedSlot,
    // replacing the designed fallback panel.
    facebookPageConfigured: false,

    // TODO: Paste the client's Google Business Profile URL here once it
    // exists. The footer icon is already in place; while this is empty it
    // stays pointed at "#" and applyBusinessConfig() leaves it alone.
    googleBusinessUrl: '',

    // TODO: Chase's introduction video. Paste any one of these, then flip
    // introVideoConfigured to true — the player replaces the placeholder
    // panel in #introMediaSlot automatically:
    //   YouTube      https://www.youtube.com/watch?v=VIDEO_ID  (or youtu.be/ID)
    //   Vimeo        https://vimeo.com/VIDEO_ID
    //   Self-hosted  graphics/videos/chaseIntroduction.mp4
    introVideoUrl: '',

    introVideoConfigured: false,

    // Poster frame used by the self-hosted player and the placeholder.
    introVideoPoster: 'graphics/images/excavator2_PiketonOH.jpg'

};

/* ============================================================
   ENVIRONMENT FLAGS
============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const mobileHeaderMediaQuery = window.matchMedia('(max-width: 1080px)');

const mobileActionMediaQuery = window.matchMedia('(max-width: 640px)');

const mobileParallaxMediaQuery = window.matchMedia('(max-width: 640px)');

/* ============================================================
   SELECTORS
============================================================ */

const siteHeader = document.getElementById('siteHeader');

const megaMenuItems = document.querySelectorAll('.navItem.hasMegaMenu');

const mobileMenu = document.getElementById('mobileMenu');

const mobileMenuToggle = document.getElementById('mobileMenuToggle');

const mobileMenuClose = document.getElementById('mobileMenuClose');

const mobileFloatingActions = document.getElementById('mobileFloatingActions');

const mobileFloatingEstimate = document.getElementById('mobileFloatingEstimate');

const backToTopButton = document.getElementById('backToTopButton');

const heroSection = document.getElementById('top');

const heroPlateBefore = document.getElementById('heroPlateBefore');

const heroPlateAfter = document.getElementById('heroPlateAfter');

const heroTypedText = document.getElementById('heroTypedText');

const heroCursor = document.getElementById('heroCursor');

const heroTypedGhost = document.getElementById('heroTypedGhost');

const estimateMiniForm = document.getElementById('estimateForm');

const estimateFormCtas = document.querySelectorAll('a[href="#estimateForm"]');

const estimateModal = document.getElementById('estimateModal');

const estimateModalForm = document.getElementById('estimateModalForm');

const estimateModalClose = document.getElementById('estimateModalClose');

const estimateModalBackdrop = document.getElementById('estimateModalBackdrop');

const estimateModalStepLabel = document.getElementById('estimateModalStepLabel');

const estimateModalProgressFill = document.getElementById('estimateModalProgressFill');

const modalBackButton = document.getElementById('modalBackButton');

const modalNextButton = document.getElementById('modalNextButton');

const estimateSubmitButton = document.getElementById('estimateSubmitButton');

const formSubmitError = document.getElementById('formSubmitError');

const formSuccessPanel = document.getElementById('formSuccessPanel');

const viewWorkButton = document.getElementById('viewWorkButton');

const siteFooter = document.querySelector('.siteFooter');

const facebookEmbedSlot = document.getElementById('facebookEmbedSlot');

const introMediaSlot = document.getElementById('introMediaSlot');

const reviewSummaryList = document.getElementById('reviewSummaryList');

const photoDropzone = document.getElementById('photoDropzone');

const photoBrowseButton = document.getElementById('photoBrowseButton');

const photoInput = document.getElementById('propertyPhotos');

const photoPreviewGrid = document.getElementById('photoPreviewGrid');

/* Built in JS rather than added to the markup because the estimate
   modal is duplicated into all 28 pages — one element created here
   beats 28 hand-synchronised copies of it. */

const photoNoticeElement = buildPhotoNoticeElement();

function buildPhotoNoticeElement()
{

    if (!photoPreviewGrid || !photoPreviewGrid.parentNode)
    {

        return null;

    }

    const notice = document.createElement('p');

    notice.className = 'photoUploadNotice';

    notice.id = 'photoUploadNotice';

    /* polite, not assertive: a rejected photo is worth announcing but
       must not interrupt someone mid-field. */

    notice.setAttribute('role', 'status');

    notice.setAttribute('aria-live', 'polite');

    notice.hidden = true;

    photoPreviewGrid.parentNode.insertBefore(notice, photoPreviewGrid);

    return notice;

}

const comparisonSlider = document.getElementById('beforeAfterSlider');

const sliderHandle = document.getElementById('sliderHandle');

const serviceAreaMap = document.getElementById('serviceAreaMap');

const mapInfoState = document.getElementById('mapInfoState');

const mapInfoRegion = document.getElementById('mapInfoRegion');

const mapInfoCopy = document.getElementById('mapInfoCopy');

const mapInfoTowns = document.getElementById('mapInfoTowns');

const faqToggles = document.querySelectorAll('.faqToggle');

/* ============================================================
   STATE
============================================================ */

const totalModalSteps = 5;

let currentModalStep = 1;

let modalHasBeenSubmitted = false;

/* One request at a time, and one referenceId for the whole page load.

   The API dedupes on referenceId, so holding it steady lets that
   dedupe collapse a retry into the original row — minting a fresh one
   per attempt would defeat it. Holding it for the page load is right
   because the flow allows exactly one submission per load: once the
   success panel is showing, reopening the modal shows the panel
   again rather than a blank form. A second request means a reload,
   which resets this anyway.

   It is also the key photo uploads are filed under, which is why it
   is minted on demand rather than at submit time — the photos go up
   before the lead is created and need somewhere to go. The internal
   sequential leadId is assigned by the server and never seen here. */

let estimateSubmissionInFlight = false;

let currentEstimateReferenceId = null;

let photoFiles = [];

let photoIdCounter = 0;

let lastFocusedBeforeModal = null;

const attribution = captureAttribution();

/* ============================================================
   HERO DUET CONFIG  (reusable — swap phrases/timings per project;
   see docs/heroDirection/heroSpecification.md)
============================================================ */

const heroDuetConfig = {

    phrases: [
        'YOUR PROPERTY.',
        'YOUR HUNTING LAND.',
        'YOUR TRAILS.',
        'YOUR PASTURE.',
        'YOUR FOOD PLOTS.',
        'YOUR HOMESITE.',
        'ACCESS TO YOUR LAND.'
    ],

    typeMsPerCharRange: [68, 92],

    deleteMsPerCharRange: [36, 48],

    settleAfterPeriodMs: 100,

    afterHoldMs: 1200,

    emptyBreathMs: 220,

    resumeBreathMs: 180,

    forwardSweepMs: 1400,

    reverseDissolveMs: 1800

};

let heroPhraseIndex = 0;

let heroAfterImageReady = false;

let heroOutOfView = false;

let heroTabHidden = false;

let heroPaused = false;

let heroResumeTimerId = null;

const heroPauseSubscribers = new Set();

const heroResumeWaiters = [];

let lastHeaderScrollY = window.scrollY;

let heroEntranceComplete = prefersReducedMotion;

/* ============================================================
   SERVICE AREA DATA  (data-driven — extend for new regions)
============================================================ */

const serviceRegions = {

    ross: { state: 'Southern Ohio', name: 'Ross County', towns: ['Chillicothe', 'Kingston', 'Frankfort'] },

    pike: { state: 'Southern Ohio', name: 'Pike County', towns: ['Waverly', 'Piketon', 'Beaver'] },

    jackson: { state: 'Southern Ohio', name: 'Jackson County', towns: ['Jackson', 'Wellston', 'Oak Hill'] },

    gallia: { state: 'Southern Ohio', name: 'Gallia County', towns: ['Gallipolis', 'Rio Grande', 'Bidwell'] },

    adams: { state: 'Southern Ohio', name: 'Adams County', towns: ['West Union', 'Peebles', 'Manchester'] },

    scioto: { state: 'Southern Ohio', name: 'Scioto County', towns: ['Portsmouth', 'Wheelersburg', 'Lucasville', 'Minford'] },

    lawrenceOh: { state: 'Southern Ohio', name: 'Lawrence County', towns: ['Ironton', 'Proctorville', 'South Point', 'Chesapeake'] },

    greenup: { state: 'Eastern Kentucky', name: 'Greenup County', towns: ['Greenup', 'Flatwoods', 'Russell', 'Wurtland'] },

    boyd: { state: 'Eastern Kentucky', name: 'Boyd County', towns: ['Ashland', 'Catlettsburg', 'Cannonsburg'] },

    carter: { state: 'Eastern Kentucky', name: 'Carter County', towns: ['Grayson', 'Olive Hill'] },

    lawrenceKy: { state: 'Eastern Kentucky', name: 'Lawrence County', towns: ['Louisa', 'Blaine'] },

    // TODO: Confirm with the client. Morehead has always been advertised in the
    // nav and now has a service area page, so Rowan County is listed here for
    // consistency — it sits one county past the original core coverage map.
    rowan: { state: 'Eastern Kentucky', name: 'Rowan County', towns: ['Morehead', 'Clearfield', 'Farmers'] }

};

/* ============================================================
   UTILITY FUNCTIONS
============================================================ */

function captureAttribution()
{

    const params = new URLSearchParams(window.location.search);

    const utmSource = params.get('utm_source') || '';

    const utmCampaign = params.get('utm_campaign') || '';

    const fbclid = params.get('fbclid') || '';

    let facebookCampaign = '';

    if (fbclid)
    {

        facebookCampaign = fbclid;

    }
    else if (utmSource.toLowerCase() === 'facebook' && utmCampaign)
    {

        facebookCampaign = utmCampaign;

    }

    return {

        leadSource: 'website',

        utmSource: utmSource,

        utmMedium: params.get('utm_medium') || '',

        utmCampaign: utmCampaign,

        facebookCampaign: facebookCampaign

    };

}

/* Lead attribution wants the page a lead came from, including its folder
   (e.g. "services/forestryMulching.html#estimateForm") so service and
   location pages are distinguishable in the sheet. */

function getSourcePage()
{

    const segments = window.location.pathname.split('/').filter(Boolean);

    const fileName = segments.pop() || 'index.html';

    const folderName = segments.pop();

    const pagePath = (folderName === 'services' || folderName === 'locations')
        ? folderName + '/' + fileName
        : fileName;

    return pagePath + '#estimateForm';

}

function showFieldError(input, errorId, showIt)
{

    const errorElement = document.getElementById(errorId);

    if (errorElement)
    {

        errorElement.hidden = !showIt;

    }

    input.classList.toggle('hasError', showIt);

    input.setAttribute('aria-invalid', showIt ? 'true' : 'false');

}

function validateRequiredText(input, errorId)
{

    const isValid = input.value.trim().length > 0;

    showFieldError(input, errorId, !isValid);

    return isValid;

}

function validateEmailField(input, errorId)
{

    const value = input.value.trim();

    const isValid = value.length > 3 && value.includes('@') && value.includes('.');

    showFieldError(input, errorId, !isValid);

    return isValid;

}

function validatePhoneField(input, errorId)
{

    const digits = input.value.replace(/\D/g, '');

    const isValid = digits.length >= 7;

    showFieldError(input, errorId, !isValid);

    return isValid;

}

function validateAcresField(input, errorId)
{

    const value = input.value.trim();

    if (value === '')
    {

        showFieldError(input, errorId, false);

        return true;

    }

    const parsed = Number(value);

    const isValid = Number.isFinite(parsed) && parsed >= 0 && parsed <= 100000;

    showFieldError(input, errorId, !isValid);

    return isValid;

}

function lockBodyScroll(shouldLock)
{

    document.body.style.overflow = shouldLock ? 'hidden' : '';

}

/* ============================================================
   ANIMATION ENGINE  (reusable — viewport-triggered only)
============================================================ */

function animateCounter(element)
{

    if (element.dataset.counterAnimated === 'true')
    {

        return;

    }

    const target = Number(element.dataset.countertarget);

    if (!Number.isFinite(target))
    {

        return;

    }

    element.dataset.counterAnimated = 'true';

    const prefix = element.dataset.counterprefix || '';

    const suffix = element.dataset.countersuffix || '';

    const duration = 1400;

    const startTime = performance.now();

    function updateCounter(now)
    {

        const progress = Math.min((now - startTime) / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);

        element.textContent = prefix + Math.round(target * eased) + suffix;

        if (progress < 1)
        {

            requestAnimationFrame(updateCounter);

        }

    }

    requestAnimationFrame(updateCounter);

}

function prepareCounter(element)
{

    const prefix = element.dataset.counterprefix || '';

    const suffix = element.dataset.countersuffix || '';

    element.textContent = prefix + '0' + suffix;

}

function markAnimationComplete(element, delay)
{

    const completionDelay = Number(delay || 0) + 1250;

    window.setTimeout(
        function ()
        {

            element.classList.add('isAnimationComplete');

            element.removeAttribute('data-animate');

            element.style.removeProperty('--animateDelay');

        },
        completionDelay
    );

}

function initializeAnimationEngine()
{

    const animatedElements = document.querySelectorAll('[data-animate]');

    if (prefersReducedMotion || !('IntersectionObserver' in window))
    {

        animatedElements.forEach(function (element)
        {

            element.classList.add('isAnimated', 'isAnimationComplete');

            element.removeAttribute('data-animate');

        });

        return;

    }

    animatedElements.forEach(function (element)
    {

        const delay = element.dataset.animatedelay;

        if (delay)
        {

            element.style.setProperty('--animateDelay', delay + 'ms');

        }

    });

    const standaloneCounters = document.querySelectorAll(
        '.statNumber[data-countertarget]:not(.heroStats .statNumber)'
    );

    const revealObserver = new IntersectionObserver(
        function (entries, observer)
        {

            entries.forEach(function (entry)
            {

                if (!entry.isIntersecting)
                {

                    return;

                }

                if (entry.target.matches('[data-animate]'))
                {

                    entry.target.classList.add('isAnimated');

                    entry.target.querySelectorAll('.statNumber[data-countertarget]').forEach(animateCounter);

                    markAnimationComplete(entry.target, entry.target.dataset.animatedelay);

                }

                if (entry.target.matches('.statNumber[data-countertarget]'))
                {

                    animateCounter(entry.target);

                }

                observer.unobserve(entry.target);

            });

        },
        {
            rootMargin: '0px 0px -24px 0px',
            threshold: 0.12
        }
    );

    animatedElements.forEach(function (element)
    {

        revealObserver.observe(element);

    });

    standaloneCounters.forEach(function (element)
    {

        if (!element.closest('[data-animate]'))
        {

            revealObserver.observe(element);

        }

    });

}

/* ============================================================
   HERO DUET ENGINE  (reusable — auto-looping Before/After +
   human-typed headline; see docs/heroDirection/heroSpecification.md.
   No video, no slider, no manual controls. Typing is claiming;
   deletion is clearing; the land answers.)
============================================================ */

/* ============================================================
   HERO ENTRANCE SEQUENCE  (coordinated initial-load narrative)
============================================================ */

function initializeHeroEntrance()
{

    const heroAnimatedElements = document.querySelectorAll('[data-heroanimate]');

    const heroStatElements = document.querySelectorAll('.heroStat[data-heroanimate]');

    if (heroAnimatedElements.length === 0)
    {

        heroEntranceComplete = true;

        return;

    }

    heroAnimatedElements.forEach(function (element)
    {

        const delay = element.dataset.heroanimatedelay || '0';

        element.style.setProperty('--heroAnimateDelay', delay + 'ms');

    });

    if (prefersReducedMotion)
    {

        document.documentElement.classList.add('heroSequenceReady', 'heroSequenceComplete');

        heroAnimatedElements.forEach(function (element)
        {

            element.removeAttribute('data-heroanimate');

            element.removeAttribute('data-heroanimatedelay');

            element.style.removeProperty('--heroAnimateDelay');

        });

        if (window.animationFallbackTimer)
        {

            window.clearTimeout(window.animationFallbackTimer);

        }

        return;

    }

    heroStatElements.forEach(function (statElement)
    {

        const counter = statElement.querySelector('.statNumber[data-herocountertarget]');

        if (!counter)
        {

            return;

        }

        counter.dataset.countertarget = counter.dataset.herocountertarget;

        counter.dataset.countersuffix = counter.dataset.herocountersuffix || '';

        prepareCounter(counter);

        function startHeroCounter(event)
        {

            if (event.target !== statElement || event.propertyName !== 'opacity')
            {

                return;

            }

            statElement.removeEventListener('transitionend', startHeroCounter);

            animateCounter(counter);

        }

        statElement.addEventListener('transitionend', startHeroCounter);

    });

    window.requestAnimationFrame(
        function ()
        {

            window.requestAnimationFrame(
                function ()
                {

                    document.documentElement.classList.add('heroSequenceReady');

                }
            );

        }
    );

    window.setTimeout(
        function ()
        {

            heroEntranceComplete = true;

            document.documentElement.classList.add('heroSequenceComplete');

            heroAnimatedElements.forEach(function (element)
            {

                element.removeAttribute('data-heroanimate');

                element.removeAttribute('data-heroanimatedelay');

                element.style.removeProperty('--heroAnimateDelay');

            });

        },
        2200
    );

    if (window.animationFallbackTimer)
    {

        window.clearTimeout(window.animationFallbackTimer);

    }

}

function heroRandomBetween(min, max)
{

    return min + (Math.random() * (max - min));

}

function resolveHeroResumeWaiters()
{

    const waitingResolvers = heroResumeWaiters.splice(0);

    waitingResolvers.forEach(function (resolve)
    {

        resolve();

    });

}

/* True while the hero is either paused outright or sitting in the
   resume breath that follows an unpause. Both the promise-based waits
   and the frame-driven typing sequencer read this one condition so
   they can never disagree about whether the hero is running. */

function heroTimingIsHeld()
{

    return heroPaused || heroResumeTimerId !== null;

}

function waitForHeroResume()
{

    if (!heroTimingIsHeld())
    {

        return Promise.resolve();

    }

    return new Promise(
        function (resolve)
        {

            heroResumeWaiters.push(resolve);

        }
    );

}

function waitForHeroTiming(durationMs)
{

    return new Promise(
        function (resolve)
        {

            let remainingMs = Math.max(Number(durationMs) || 0, 0);

            let timeoutId = null;

            let startedAt = 0;

            let hasCompleted = false;

            function completeTiming()
            {

                if (hasCompleted)
                {

                    return;

                }

                hasCompleted = true;

                timeoutId = null;

                heroPauseSubscribers.delete(pauseTiming);

                resolve();

            }

            function pauseTiming()
            {

                if (timeoutId === null || hasCompleted)
                {

                    return;

                }

                window.clearTimeout(timeoutId);

                timeoutId = null;

                remainingMs = Math.max(remainingMs - (performance.now() - startedAt), 0);

                heroPauseSubscribers.delete(pauseTiming);

                continueTiming();

            }

            async function continueTiming()
            {

                await waitForHeroResume();

                if (hasCompleted)
                {

                    return;

                }

                if (remainingMs <= 0)
                {

                    completeTiming();

                    return;

                }

                startedAt = performance.now();

                heroPauseSubscribers.add(pauseTiming);

                timeoutId = window.setTimeout(completeTiming, remainingMs);

            }

            continueTiming();

        }
    );

}

function waitForHeroHookEntrance()
{

    const heroHeadline = document.querySelector('.heroHeadline[data-heroanimate]');

    if (!heroHeadline)
    {

        return Promise.resolve();

    }

    return new Promise(
        function (resolve)
        {

            function handleHookTransitionEnd(event)
            {

                if (event.target !== heroHeadline || event.propertyName !== 'opacity')
                {

                    return;

                }

                heroHeadline.removeEventListener('transitionend', handleHookTransitionEnd);

                resolve();

            }

            heroHeadline.addEventListener('transitionend', handleHookTransitionEnd);

        }
    );

}

/* ── Pause etiquette: typing may freeze anywhere; an in-flight
     sweep or dissolve always finishes first. Resuming waits a
     short breath rather than snapping back instantly. ── */

function updateHeroPausedState()
{

    const shouldPause = heroOutOfView || heroTabHidden;

    if (shouldPause === heroPaused)
    {

        return;

    }

    heroPaused = shouldPause;

    if (shouldPause)
    {

        if (heroResumeTimerId !== null)
        {

            window.clearTimeout(heroResumeTimerId);

            heroResumeTimerId = null;

        }

        heroCursor.classList.add('isPaused');

        heroPauseSubscribers.forEach(function (pauseTiming)
        {

            pauseTiming();

        });

        return;

    }

    heroResumeTimerId = window.setTimeout(
        function ()
        {

            heroResumeTimerId = null;

            heroCursor.classList.remove('isPaused');

            resolveHeroResumeWaiters();

        },
        heroDuetConfig.resumeBreathMs
    );

}

function initializeHeroPauseTriggers()
{

    if (!heroSection || !('IntersectionObserver' in window))
    {

        return;

    }

    const heroVisibilityObserver = new IntersectionObserver(
        function (entries)
        {

            entries.forEach(
                function (entry)
                {

                    heroOutOfView = !entry.isIntersecting;

                    updateHeroPausedState();

                }
            );

        },
        { threshold: 0.34 }
    );

    heroVisibilityObserver.observe(heroSection);

    heroTabHidden = document.hidden;

    updateHeroPausedState();

    document.addEventListener(
        'visibilitychange',
        function ()
        {

            heroTabHidden = document.hidden;

            updateHeroPausedState();

        }
    );

}

/* ============================================================
   HERO TYPING — FRAME-DRIVEN

   The typed line used to be driven by one setTimeout per character
   writing straight into .textContent. Profiling that (see
   docs/engineeringJournal.md, 2026-08-06) found three costs, none of
   them visible in the source:

     1  A timer fires at an arbitrary point inside a frame, so the
        character it writes waits out the rest of that frame before
        anything is painted — 8.5ms on average. Worse, two timers can
        fire inside one frame when the main thread is busy, and the
        second write erases the first before it is ever shown.

     2  The screen can only reveal a character on a frame boundary,
        so a 71ms delay and an 80ms delay are the same five frames.
        Asking for values the display cannot express widened the
        cadence a visitor actually sees from the 43.5ms spread the
        design intends to 50.0ms, and added 24% to its jitter.

     3  Assigning .textContent tears down the child list and builds a
        fresh Text node every keystroke — 873 of them in three
        minutes — where one cached node mutated in place does.

   The rewrite commits inside requestAnimationFrame, drives the
   cadence off an absolute deadline chain, pre-computes the strings
   outside the frame callback, and writes through a cached Text node.
   Committing on the frame boundary is what takes the write-to-paint
   wait to zero and makes a swallowed character structurally
   impossible: one frame can only ever serve one commit.

   The deadlines advance from the previous deadline rather than from
   the frame that served it, so a frame served late does not push the
   rest of the phrase late behind it, and the mean interval stays on
   the configured value instead of drifting up.

   Deliberately NOT rounded to whole frames. Rounding measured very
   slightly smoother at 60Hz — 10.0ms of cadence jitter against the
   10.6ms this gives — but it has to assume a refresh rate, and a
   phrase timed in frames types at double speed on the 120Hz panels
   that ship in most current laptops and phones. Six tenths of a
   millisecond is not worth a display-dependent animation.

   heroDuetConfig is untouched throughout: the delay ranges the
   animation reads are the same ones it always read.
============================================================ */

let heroTypedTextNode = null;

function writeHeroTypedText(value)
{

    if (heroTypedTextNode === null)
    {

        heroTypedTextNode = document.createTextNode('');

        heroTypedText.textContent = '';

        heroTypedText.appendChild(heroTypedTextNode);

    }

    heroTypedTextNode.nodeValue = value;

}

/* Runs a pre-built list of { value, delayMs } steps, committing at
   most one of them per animation frame. A held hero leaves the frame
   loop entirely rather than spinning on empty callbacks, and keeps
   the time it had left on the current step — the same resume
   behaviour waitForHeroTiming() gave the timer version. */

function runHeroTypedSequence(steps)
{

    return new Promise(
        function (resolve)
        {

            let stepIndex = 0;

            let nextCommitAt = null;

            let heldWithRemainingMs = null;

            let lastFrameAt = null;

            function requestNextFrame()
            {

                window.requestAnimationFrame(handleFrame);

            }

            function handleFrame(timestamp)
            {

                /* Half the gap that has just elapsed is the best available
                   guess at how far away the next frame is, and unlike a
                   hardcoded 16.67ms it costs nothing to be right on a
                   120Hz panel. Clamped so a stall cannot make the guess
                   large enough to trigger a premature commit. */

                const frameGap = lastFrameAt === null
                    ? 0
                    : Math.min(Math.max(timestamp - lastFrameAt, 0), 34);

                lastFrameAt = timestamp;

                if (heroTimingIsHeld())
                {

                    if (heldWithRemainingMs === null && nextCommitAt !== null)
                    {

                        heldWithRemainingMs = Math.max(nextCommitAt - timestamp, 0);

                    }

                    lastFrameAt = null;

                    waitForHeroResume().then(requestNextFrame);

                    return;

                }

                if (heldWithRemainingMs !== null)
                {

                    nextCommitAt = timestamp + heldWithRemainingMs;

                    heldWithRemainingMs = null;

                }

                /* Commit on whichever frame sits closest to the deadline,
                   not the first one past it. Waiting for the first frame
                   at or after would round every single interval up, which
                   costs half a frame per character and types the phrase
                   noticeably slower than the config asks for. */

                if (nextCommitAt !== null && (timestamp + (frameGap / 2)) < nextCommitAt)
                {

                    requestNextFrame();

                    return;

                }

                const step = steps[stepIndex];

                writeHeroTypedText(step.value);

                /* Chained from the frame that served the commit, so the
                   deadline and its predecessor are both real frame times
                   and only one rounding sits between them. Chaining from
                   the abstract deadline instead puts an independent
                   rounding at each end of every interval, which measured
                   no better than the timers this replaced. */

                nextCommitAt = timestamp + step.delayMs;

                stepIndex += 1;

                if (stepIndex >= steps.length)
                {

                    resolve();

                    return;

                }

                requestNextFrame();

            }

            if (steps.length === 0)
            {

                resolve();

                return;

            }

            requestNextFrame();

        }
    );

}

/* ── Human typing: restrained per-character variation, a short
     space pause, solid cursor while active, blink at rest. ── */

function buildHeroTypeSteps(phrase)
{

    const steps = [];

    for (let charIndex = 0; charIndex < phrase.length; charIndex += 1)
    {

        let delay = heroRandomBetween(
            heroDuetConfig.typeMsPerCharRange[0],
            heroDuetConfig.typeMsPerCharRange[1]
        );

        if (phrase[charIndex] === ' ')
        {

            delay += 20;

        }

        steps.push({

            value: phrase.slice(0, charIndex + 1),

            delayMs: charIndex >= phrase.length - 1 ? 0 : delay

        });

    }

    return steps;

}

function buildHeroDeleteSteps(phrase)
{

    const steps = [];

    for (let remaining = phrase.length - 1; remaining >= 0; remaining -= 1)
    {

        const delay = heroRandomBetween(
            heroDuetConfig.deleteMsPerCharRange[0],
            heroDuetConfig.deleteMsPerCharRange[1]
        );

        steps.push({

            value: phrase.slice(0, remaining),

            delayMs: remaining <= 0 ? 0 : delay

        });

    }

    return steps;

}

async function typeHeroPhrase(phrase)
{

    heroCursor.classList.add('isSolid');

    await runHeroTypedSequence(buildHeroTypeSteps(phrase));

    heroCursor.classList.remove('isSolid');

}

async function deleteHeroPhrase(phrase)
{

    heroCursor.classList.add('isSolid');

    await runHeroTypedSequence(buildHeroDeleteSteps(phrase));

    heroCursor.classList.remove('isSolid');

}

/* ── Transformation: forward is a soft directional sweep (never
     fires against an unloaded plate — the hold simply extends);
     reverse is a plain dissolve, never a reversed sweep. ── */

function fireHeroForwardSweepAndWait()
{

    return new Promise(
        function (resolve)
        {

            function trigger()
            {

                heroPlateAfter.classList.add('isRevealed');

                window.setTimeout(resolve, heroDuetConfig.forwardSweepMs);

            }

            if (heroAfterImageReady)
            {

                trigger();

                return;

            }

            /* A plate that never loads must not strand the loop, so an
               error resolves the wait the same way a load does — the
               cycle then runs on the BEFORE plate alone rather than
               stopping the hero dead. */

            heroPlateAfter.addEventListener('load', trigger, { once: true });

            heroPlateAfter.addEventListener('error', trigger, { once: true });

        }
    );

}

/* Resolves only once the plate is fully back to BEFORE and its classes
   are clean. The loop must await this: the reset runs on a timer, and
   if the next cycle's sweep starts before that timer fires, the stale
   callback strips the `isRevealed` it just added — the AFTER plate
   snaps away mid-sweep and the visual loop desyncs from the typing
   loop. That was the "stops after a couple of cycles" defect.

   The timer itself stays unpaused on purpose: the CSS opacity
   transition cannot pause either, so the dissolve always finishes.
   The loop takes its pause at the breath that follows. */

function fireHeroReverseDissolveAndWait()
{

    return new Promise(
        function (resolve)
        {

            heroPlateAfter.classList.add('isDissolving');

            window.setTimeout(
                function ()
                {

                    heroPlateAfter.classList.add('isResetting');

                    heroPlateAfter.classList.remove('isRevealed');

                    heroPlateAfter.classList.remove('isDissolving');

                    void heroPlateAfter.offsetHeight;

                    heroPlateAfter.classList.remove('isResetting');

                    resolve();

                },
                heroDuetConfig.reverseDissolveMs
            );

        }
    );

}

async function runHeroDuetLoop()
{

    heroCursor.classList.add('isVisible');

    await waitForHeroHookEntrance();

    for (;;)
    {

        const phrase = heroDuetConfig.phrases[heroPhraseIndex];

        await waitForHeroResume();

        await typeHeroPhrase(phrase);

        await waitForHeroTiming(heroDuetConfig.settleAfterPeriodMs);

        await fireHeroForwardSweepAndWait();

        await waitForHeroTiming(heroDuetConfig.afterHoldMs);

        await deleteHeroPhrase(phrase);

        await fireHeroReverseDissolveAndWait();

        await waitForHeroTiming(heroDuetConfig.emptyBreathMs);

        heroPhraseIndex = (heroPhraseIndex + 1) % heroDuetConfig.phrases.length;

    }

}

function initializeHeroDuet()
{

    if (!heroPlateBefore || !heroPlateAfter || !heroTypedText || !heroCursor)
    {

        return;

    }

    /* The typed line must begin completely empty — JavaScript is the
       only thing that ever inserts phrase text. Even the invisible
       width-reservation ghost gets its text here, computed from the
       phrase pool itself, so nothing is hardcoded in the markup. */

    if (heroTypedGhost)
    {

        heroTypedGhost.textContent = heroDuetConfig.phrases.reduce(
            function (longestPhrase, phrase)
            {

                return phrase.length > longestPhrase.length ? phrase : longestPhrase;

            },
            ''
        );

    }

    if (prefersReducedMotion)
    {

        writeHeroTypedText(heroDuetConfig.phrases[0]);

        return;

    }

    if (heroPlateAfter.complete && heroPlateAfter.naturalWidth > 0)
    {

        heroAfterImageReady = true;

    }
    else
    {

        heroPlateAfter.addEventListener(
            'load',
            function ()
            {

                heroAfterImageReady = true;

            },
            { once: true }
        );

    }

    initializeHeroPauseTriggers();

    runHeroDuetLoop();

}

/* ============================================================
   PROCESS SEQUENCE  (reusable Nulo Studio system)

   Walks a visitor through a process board once, then keeps the
   movement alive without ever telling the story a second time:

       PHASE A   step reveals -> arrow flashes -> arrow dims -> next
                 step, until every step is up.  Runs ONCE per page
                 view.

       PHASE B   arrow 1 lights and stays lit, then 1+2, then 1+2+3,
                 then all four; a hold, then all four fade together and
                 it begins again.  Arrows only, forever.

                 The highlight accumulates rather than travelling: the
                 row fills up and empties, which reads as the whole
                 progression completing over and over rather than as a
                 single point chasing along it.

   The two phases are separate states rather than one long repeating
   animation, because the requirement is not "loop the whole thing
   slowly" — it is that the steps are told once and then stop being
   animated at all. Nothing in Phase B touches a step, so a revealed
   board cannot reset, fade, translate back, or replay its entrance.

       'idle'  ->  'revealing'  ->  'looping'

   Those states only ever move forward. Re-entering the viewport can
   start the reveal, and can pause or resume the arrow loop, but there
   is no transition back to 'idle' — which is what makes "Phase A runs
   once" a property of the machine rather than of its timing.

   Drives any element carrying data-processsequence. Step count is read
   from the DOM rather than configured — the homepage board runs five
   steps and the service pages four, and the arrows are simply however
   many sit between them.

   Cost is deliberately tiny: the only DOM work is a class toggle on a
   single element per beat, and every property those classes touch is
   opacity, transform or filter. No element is ever created, removed,
   measured or re-written, so the board cannot trigger layout while it
   plays. setTimeout is the right tool here for the same reason
   requestAnimationFrame was the right one for the hero: this schedules
   a handful of state changes that CSS then animates, rather than
   committing a frame of its own.
============================================================ */

const processSequenceConfig = {

    /* Matches the 480ms reveal transition in styleIndex.css, then a
       beat to let the step land before the arrow moves on. */

    stepRevealMs: 480,

    pauseAfterStepMs: 380,

    arrowActiveMs: 420,

    arrowFadeMs: 240,

    /* A beat before step one, so the reveal reads as beginning rather
       than as already in progress when the board arrives. */

    startDelayMs: 260,

    /* The finished picture holds before the arrows pick the movement
       back up — long enough that Phase B reads as a separate, quieter
       idea rather than as the tail of the reveal. */

    revealSettleMs: 1600,

    /* Phase B, the cumulative sweep. Arrows light one after another
       at loopStepMs and stay lit; once all four are up they hold for
       loopHoldMs, then clear together and the row sits dark for
       loopPauseMs before the next pass.

       The clear is the 260ms opacity transition already on
       .processArrow, so loopPauseMs has to stay comfortably longer than
       that — otherwise arrow one would start lighting again while the
       previous pass was still fading out. */

    loopStepMs: 420,

    loopHoldMs: 1400,

    loopPauseMs: 900,

    /* Deliberately wide hysteresis: the reveal begins once the board is
       meaningfully on screen, and the arrow loop only stops once the
       board has left completely. Scroll jitter around a single boundary
       therefore cannot start or stop anything. */

    enterRatio: 0.4

};

const processSequenceBoards = [];

function initializeProcessSequences()
{

    const boards = document.querySelectorAll('[data-processsequence]');

    if (boards.length === 0)
    {

        return;

    }

    /* Reduced motion never runs either phase — the stylesheet shows
       every step and every arrow in their finished state, so there is
       nothing to drive and no observer worth registering. */

    if (prefersReducedMotion || !('IntersectionObserver' in window))
    {

        return;

    }

    boards.forEach(function (board)
    {

        setupProcessBoard(board);

    });

    /* A backgrounded tab paints nothing, so letting the arrow loop run
       on would spend its timers where nobody is watching. */

    document.addEventListener(
        'visibilitychange',
        function ()
        {

            processSequenceBoards.forEach(function (syncBoard)
            {

                syncBoard();

            });

        }
    );

}

function setupProcessBoard(board)
{

    const steps = Array.prototype.slice.call(board.querySelectorAll('.processStep'));

    const arrows = Array.prototype.slice.call(board.querySelectorAll('.processArrow'));

    if (steps.length === 0)
    {

        return;

    }

    /* 'idle' -> 'revealing' -> 'looping', and never backwards. */

    let phase = 'idle';

    let loopRunning = false;

    let inView = false;

    let pendingTimerId = null;

    function after(delayMs, nextBeat)
    {

        pendingTimerId = window.setTimeout(
            function ()
            {

                pendingTimerId = null;

                nextBeat();

            },
            delayMs
        );

    }

    function clearPending()
    {

        if (pendingTimerId !== null)
        {

            window.clearTimeout(pendingTimerId);

            pendingTimerId = null;

        }

    }

    /* ── Phase A's arrow beat: flash, then dim ──

       isActive and isResting are mutually exclusive. The two rules
       carry equal specificity, so an arrow holding both renders as
       whichever is declared later — isResting — and would never appear
       to light at all. This function and lightArrow() below are the
       only two places that touch those classes, and both remove one
       before adding the other. Nothing else may. */

    function flashArrow(arrow, whenFinished)
    {

        arrow.classList.remove('isResting');

        arrow.classList.add('isActive');

        after(
            processSequenceConfig.arrowActiveMs,
            function ()
            {

                arrow.classList.remove('isActive');

                arrow.classList.add('isResting');

                after(processSequenceConfig.arrowFadeMs, whenFinished);

            }
        );

    }

    /* ── Phase A: the one-time reveal ── */

    /* The arrow is movement into the next step, so the next step is
       revealed from inside the arrow's own callback rather than
       alongside it — a step cannot appear until its arrow has finished
       flashing and dimmed. */

    function revealStep(index)
    {

        steps[index].classList.add('isRevealed');

        after(
            processSequenceConfig.stepRevealMs + processSequenceConfig.pauseAfterStepMs,
            function ()
            {

                if (index >= steps.length - 1)
                {

                    finishReveal();

                    return;

                }

                const arrow = arrows[index];

                if (!arrow)
                {

                    revealStep(index + 1);

                    return;

                }

                flashArrow(arrow, function ()
                {

                    revealStep(index + 1);

                });

            }
        );

    }

    function startReveal()
    {

        phase = 'revealing';

        after(processSequenceConfig.startDelayMs, function ()
        {

            revealStep(0);

        });

    }

    /* ── The hand-off ──

       Reached exactly once. Every step is revealed and every step stays
       revealed from here to the end of the page view. */

    function finishReveal()
    {

        phase = 'looping';

        after(processSequenceConfig.revealSettleMs, syncArrowLoop);

    }

    /* ── Phase B: the cumulative sweep ──

       Deliberately not built on flashArrow(): that beat dims an arrow
       before moving on, and the whole point here is that nothing dims
       until the row is full. Each arrow lights and stays lit. */

    function lightArrow(index)
    {

        /* A one-step board has no arrows at all, so this is a real
           branch and not just defensiveness. */

        if (index >= arrows.length)
        {

            holdThenClear();

            return;

        }

        const arrow = arrows[index];

        arrow.classList.remove('isResting');

        arrow.classList.add('isActive');

        /* The row is full — hold from here rather than scheduling one
           more step first, so loopHoldMs is the hold a visitor actually
           sees rather than one step short of it. */

        if (index === arrows.length - 1)
        {

            holdThenClear();

            return;

        }

        after(processSequenceConfig.loopStepMs, function ()
        {

            lightArrow(index + 1);

        });

    }

    /* All four are lit here. They hold, clear on one tick so the row
       empties as a single gesture rather than unravelling, and the
       pause lets that fade finish before the next pass starts. */

    function holdThenClear()
    {

        after(processSequenceConfig.loopHoldMs, function ()
        {

            restAllArrows();

            after(processSequenceConfig.loopPauseMs, function ()
            {

                lightArrow(0);

            });

        });

    }

    /* Clears the row: every arrow back to rest, whether it was lit by
       a Phase A flash or by a Phase B sweep. Also what Phase B uses at
       the end of each pass. Steps are not mentioned here, and that is
       the point. */

    function restAllArrows()
    {

        arrows.forEach(function (arrow)
        {

            arrow.classList.remove('isActive');

            arrow.classList.add('isResting');

        });

    }

    function syncArrowLoop()
    {

        if (phase !== 'looping')
        {

            return;

        }

        const shouldRun = inView && !document.hidden;

        if (shouldRun === loopRunning)
        {

            return;

        }

        if (shouldRun)
        {

            loopRunning = true;

            /* Always from a clear row — a resumed loop starts its pass
               at arrow one rather than picking up a half-filled row. */

            restAllArrows();

            lightArrow(0);

            return;

        }

        loopRunning = false;

        clearPending();

        restAllArrows();

    }

    /* ── Run state ── */

    function syncBoard()
    {

        if (phase === 'idle')
        {

            if (inView && !document.hidden)
            {

                startReveal();

            }

            return;

        }

        /* Phase A is deliberately uninterruptible. It is the one-time
           telling of the story and lasts about seven seconds; stopping
           it half way would mean either losing the steps already up or
           replaying them, and the brief forbids both. Only the endless
           phase answers to visibility. */

        syncArrowLoop();

    }

    processSequenceBoards.push(syncBoard);

    /* A board taller than the viewport can never reach enterRatio, so
       position is the fallback: once its top has passed the middle of
       the screen it is meaningfully in view whatever the ratio says.
       The extra thresholds exist to give that check a callback to run
       in as a tall board scrolls up. */

    function hasMeaningfullyEntered(entry)
    {

        if (entry.intersectionRatio >= processSequenceConfig.enterRatio)
        {

            return true;

        }

        const rootHeight = entry.rootBounds ? entry.rootBounds.height : window.innerHeight;

        return entry.boundingClientRect.top <= rootHeight * 0.5;

    }

    const observer = new IntersectionObserver(
        function (entries)
        {

            entries.forEach(function (entry)
            {

                /* Asymmetric on purpose. Arriving takes a meaningful
                   entry; leaving takes the board going completely off
                   screen. One predicate for both would put start and
                   stop on the same boundary, and a visitor parked there
                   would flicker the arrow loop on every scroll tremor. */

                if (!entry.isIntersecting)
                {

                    inView = false;

                    syncBoard();

                    return;

                }

                if (!inView && hasMeaningfullyEntered(entry))
                {

                    inView = true;

                    syncBoard();

                }

            });

        },
        { threshold: [0, 0.12, 0.25, processSequenceConfig.enterRatio] }
    );

    observer.observe(board);

}

/* ============================================================
   PARALLAX SECTIONS  (reusable Nulo Studio system)

   Drives any element carrying data-parallaxlayer. The layer is
   translated vertically as its section crosses the viewport:

       data-parallaxlayer          — marks the layer (required)
       data-parallaxspeed="0.18"   — scroll factor (optional)

   The layer should be oversized inside an overflow-hidden
   wrapper; the translation is clamped to the layer's overflow
   so the image can never reveal a gap. Work is rAF-throttled,
   skipped while the section is far from the viewport, and
   disabled entirely under prefers-reduced-motion (the layer
   then sits static and centered via its CSS offsets).
============================================================ */

function initializeParallaxSections()
{

    const parallaxLayers = document.querySelectorAll('[data-parallaxlayer]');

    if (parallaxLayers.length === 0 || prefersReducedMotion)
    {

        return;

    }

    const defaultParallaxSpeed = 0.18;

    let parallaxTicking = false;

    function clearParallaxLayers()
    {

        parallaxLayers.forEach(function (layer)
        {

            layer.style.transform = '';

        });

    }

    function applyParallaxLayers()
    {

        if (mobileParallaxMediaQuery.matches)
        {

            clearParallaxLayers();

            parallaxTicking = false;

            return;

        }

        const viewportHeight = window.innerHeight;

        parallaxLayers.forEach(function (layer)
        {

            const wrapper = layer.parentElement;

            const bounds = wrapper.getBoundingClientRect();

            // Only compute while the section is near the viewport.
            if (bounds.bottom < -viewportHeight * 0.5 || bounds.top > viewportHeight * 1.5)
            {

                return;

            }

            const speed = Number(layer.dataset.parallaxspeed) || defaultParallaxSpeed;

            const wrapperCenter = bounds.top + bounds.height / 2;

            const rawOffset = (viewportHeight / 2 - wrapperCenter) * speed;

            const maxOffset = Math.max((layer.offsetHeight - wrapper.offsetHeight) / 2, 0);

            const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, rawOffset));

            layer.style.transform = 'translate3d(0, ' + clampedOffset.toFixed(1) + 'px, 0)';

        });

        parallaxTicking = false;

    }

    function requestParallaxUpdate()
    {

        if (!parallaxTicking)
        {

            parallaxTicking = true;

            requestAnimationFrame(applyParallaxLayers);

        }

    }

    window.addEventListener(
        'scroll',
        requestParallaxUpdate,
        { passive: true }
    );

    window.addEventListener(
        'resize',
        requestParallaxUpdate,
        { passive: true }
    );

    if (mobileParallaxMediaQuery.addEventListener)
    {

        mobileParallaxMediaQuery.addEventListener(
            'change',
            requestParallaxUpdate
        );

    }
    else
    {

        mobileParallaxMediaQuery.addListener(requestParallaxUpdate);

    }

    applyParallaxLayers();

}

/* ============================================================
   HEADER & MEGA MENU  (reusable)
============================================================ */

function setFloatingControlVisibility(control, shouldShow)
{

    if (!control)
    {

        return;

    }

    control.classList.toggle('isVisible', shouldShow);

    control.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');

}

function updateFloatingControls(currentScrollY = Math.max(window.scrollY, 0))
{

    const isMobileActionViewport = mobileActionMediaQuery.matches;

    const isMenuOpen = mobileMenu.classList.contains('isOpen');

    const isTopNavigationHidden = siteHeader.classList.contains('isHiddenMobile');

    const shouldShowMobileActions = isMobileActionViewport && isTopNavigationHidden && !isMenuOpen;

    const footerBounds = siteFooter ? siteFooter.getBoundingClientRect() : null;

    const isNearFooter = Boolean(footerBounds && footerBounds.top < window.innerHeight * 0.9);

    const hasPassedFirstViewport = currentScrollY > window.innerHeight * 0.7;

    const shouldShowBackToTop = isMobileActionViewport && isNearFooter && hasPassedFirstViewport;

    setFloatingControlVisibility(mobileFloatingActions, shouldShowMobileActions);

    setFloatingControlVisibility(backToTopButton, shouldShowBackToTop);

    if (backToTopButton)
    {

        backToTopButton.classList.toggle('isLifted', shouldShowBackToTop && shouldShowMobileActions);

    }

}

function updateHeaderScrollState()
{

    const currentScrollY = Math.max(window.scrollY, 0);

    siteHeader.classList.toggle('isScrolled', currentScrollY > 40);

    if (!heroEntranceComplete)
    {

        siteHeader.classList.remove('isHiddenMobile');

        lastHeaderScrollY = currentScrollY;

        updateFloatingControls(currentScrollY);

        return;

    }

    if (prefersReducedMotion || !mobileHeaderMediaQuery.matches)
    {

        siteHeader.classList.remove('isHiddenMobile');

        lastHeaderScrollY = currentScrollY;

        updateFloatingControls(currentScrollY);

        return;

    }

    const isMenuOpen = mobileMenu.classList.contains('isOpen');

    const isScrollingDown = currentScrollY > lastHeaderScrollY;

    const hasMovedEnough = Math.abs(currentScrollY - lastHeaderScrollY) > 6;

    if (isMenuOpen || currentScrollY <= 20)
    {

        siteHeader.classList.remove('isHiddenMobile');

    }
    else if (hasMovedEnough && isScrollingDown && currentScrollY > siteHeader.offsetHeight)
    {

        siteHeader.classList.add('isHiddenMobile');

    }
    else if (hasMovedEnough && !isScrollingDown)
    {

        siteHeader.classList.remove('isHiddenMobile');

    }

    lastHeaderScrollY = currentScrollY;

    updateFloatingControls(currentScrollY);

}

function closeAllMegaMenus(exceptItem)
{

    megaMenuItems.forEach(function (item)
    {

        if (item !== exceptItem)
        {

            item.classList.remove('isOpen');

            item.querySelector('.megaToggle').setAttribute('aria-expanded', 'false');

        }

    });

}

function initializeMegaMenus()
{

    megaMenuItems.forEach(function (item)
    {

        const toggle = item.querySelector('.megaToggle');

        toggle.addEventListener(
            'click',
            function ()
            {

                const willOpen = !item.classList.contains('isOpen');

                closeAllMegaMenus(item);

                item.classList.toggle('isOpen', willOpen);

                toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

            }
        );

        item.addEventListener(
            'mouseenter',
            function ()
            {

                closeAllMegaMenus(item);

                item.classList.add('isOpen');

                toggle.setAttribute('aria-expanded', 'true');

            }
        );

        item.addEventListener(
            'mouseleave',
            function ()
            {

                item.classList.remove('isOpen');

                toggle.setAttribute('aria-expanded', 'false');

            }
        );

    });

    document.addEventListener(
        'click',
        function (event)
        {

            if (!event.target.closest('.navItem.hasMegaMenu'))
            {

                closeAllMegaMenus(null);

            }

        }
    );

    document.addEventListener(
        'keydown',
        function (event)
        {

            if (event.key === 'Escape')
            {

                closeAllMegaMenus(null);

            }

        }
    );

}

/* ============================================================
   MOBILE MENU
============================================================ */

function openMobileMenu()
{

    siteHeader.classList.remove('isHiddenMobile');

    updateFloatingControls();

    mobileMenu.classList.add('isOpen');

    mobileMenu.setAttribute('aria-hidden', 'false');

    mobileMenuToggle.setAttribute('aria-expanded', 'true');

    lockBodyScroll(true);

}

function toggleMobileMenu()
{

    if (mobileMenu.classList.contains('isOpen'))
    {

        closeMobileMenu();

        return;

    }

    openMobileMenu();

}

function closeMobileMenu()
{

    mobileMenu.classList.remove('isOpen');

    mobileMenu.setAttribute('aria-hidden', 'true');

    mobileMenuToggle.setAttribute('aria-expanded', 'false');

    lockBodyScroll(false);

    updateFloatingControls();

}

function initializeMobileAccordions()
{

    document.querySelectorAll('.mobileAccordionToggle').forEach(function (toggle)
    {

        toggle.addEventListener(
            'click',
            function ()
            {

                const panel = document.getElementById(toggle.getAttribute('aria-controls'));

                const willOpen = toggle.getAttribute('aria-expanded') !== 'true';

                toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');

                panel.style.maxHeight = willOpen ? panel.scrollHeight + 'px' : '0px';

            }
        );

    });

    mobileMenu.querySelectorAll('a').forEach(function (link)
    {

        link.addEventListener('click', closeMobileMenu);

    });

}

/* ============================================================
   ESTIMATE FLOW  (reusable — hero mini-form + multi-step modal.
   State lives in the form fields themselves, so nothing is ever
   re-entered: closing and reopening the modal keeps every value
   and the current step.)
============================================================ */

function isHoneypotTripped()
{

    const honeypot = document.getElementById('companyWebsite');

    return Boolean(honeypot && honeypot.value);

}

function validateMiniForm()
{

    const nameValid = validateRequiredText(document.getElementById('fullName'), 'fullNameError');

    const phoneValid = validatePhoneField(document.getElementById('phone'), 'phoneError');

    const serviceValid = validateRequiredText(document.getElementById('serviceNeeded'), 'serviceNeededError');

    return nameValid && phoneValid && serviceValid;

}

/* The modal carries its own Full Name / Phone / Service Needed fields
   (modalFullName / modalPhone / modalServiceNeeded) so it can produce
   a complete lead on its own when a CTA opens it directly — the mini
   form keeps its original fullName / phone / serviceNeeded ids so it
   keeps working exactly as it always has. This is the one place the
   two are connected: called right before the mini form hands off to
   the modal, so "Continue" carries what was just typed forward instead
   of asking for it twice. */

function copyMiniFormIntoModal()
{

    const modalFullName = document.getElementById('modalFullName');

    const modalPhone = document.getElementById('modalPhone');

    const modalServiceNeeded = document.getElementById('modalServiceNeeded');

    if (modalFullName)
    {

        modalFullName.value = document.getElementById('fullName').value;

    }

    if (modalPhone)
    {

        modalPhone.value = document.getElementById('phone').value;

    }

    if (modalServiceNeeded)
    {

        modalServiceNeeded.value = document.getElementById('serviceNeeded').value;

    }

}

function validateModalStep(stepNumber)
{

    if (stepNumber === 1)
    {

        const nameValid = validateRequiredText(document.getElementById('modalFullName'), 'modalFullNameError');

        const phoneValid = validatePhoneField(document.getElementById('modalPhone'), 'modalPhoneError');

        const serviceValid = validateRequiredText(document.getElementById('modalServiceNeeded'), 'modalServiceNeededError');

        const addressValid = validateRequiredText(document.getElementById('propertyAddress'), 'propertyAddressError');

        const acresValid = validateAcresField(document.getElementById('estimatedAcres'), 'estimatedAcresError');

        return nameValid && phoneValid && serviceValid && addressValid && acresValid;

    }

    if (stepNumber === 3)
    {

        return validateEmailField(document.getElementById('email'), 'emailError');

    }

    return true;

}

function updateModalStep()
{

    estimateModal.querySelectorAll('.modalStep').forEach(function (step)
    {

        step.hidden = Number(step.dataset.step) !== currentModalStep;

    });

    estimateModalStepLabel.textContent = 'Step ' + currentModalStep + ' of ' + totalModalSteps;

    estimateModalProgressFill.style.width = ((currentModalStep / totalModalSteps) * 100) + '%';

    modalBackButton.hidden = currentModalStep === 1;

    modalNextButton.hidden = currentModalStep === totalModalSteps;

    estimateSubmitButton.hidden = currentModalStep !== totalModalSteps;

    if (currentModalStep === totalModalSteps)
    {

        buildReviewSummary();

    }

    const activeStep = estimateModal.querySelector('.modalStep:not([hidden])');

    const firstInput = activeStep ? activeStep.querySelector('input, textarea, select') : null;

    if (firstInput)
    {

        firstInput.focus({ preventScroll: true });

    }
    else
    {

        estimateSubmitButton.focus({ preventScroll: true });

    }

}

function openEstimateModal()
{

    lastFocusedBeforeModal = document.activeElement;

    estimateModal.hidden = false;

    lockBodyScroll(true);

    updateModalStep();

}

function closeEstimateModal()
{

    estimateModal.hidden = true;

    lockBodyScroll(false);

    if (lastFocusedBeforeModal)
    {

        lastFocusedBeforeModal.focus({ preventScroll: true });

    }

}

function trapModalFocus(event)
{

    if (estimateModal.hidden || event.key !== 'Tab')
    {

        return;

    }

    const focusable = estimateModal.querySelectorAll(
        'button:not([hidden]), input:not([type="file"]), textarea, select, a[href]'
    );

    const focusableList = Array.prototype.filter.call(focusable, function (element)
    {

        return element.offsetParent !== null;

    });

    if (focusableList.length === 0)
    {

        return;

    }

    const firstElement = focusableList[0];

    const lastElement = focusableList[focusableList.length - 1];

    if (event.shiftKey && document.activeElement === firstElement)
    {

        event.preventDefault();

        lastElement.focus();

    }
    else if (!event.shiftKey && document.activeElement === lastElement)
    {

        event.preventDefault();

        firstElement.focus();

    }

}

/* ── Review summary ── */

function addReviewRow(label, value, editStep, editTarget)
{

    const item = document.createElement('div');

    item.className = 'reviewSummaryItem';

    const term = document.createElement('dt');

    term.textContent = label;

    const detail = document.createElement('dd');

    detail.textContent = value || '—';

    const editButton = document.createElement('button');

    editButton.type = 'button';

    editButton.className = 'reviewEditButton';

    editButton.textContent = 'Edit';

    editButton.setAttribute('aria-label', 'Edit ' + label);

    editButton.addEventListener(
        'click',
        function ()
        {

            if (editStep)
            {

                currentModalStep = editStep;

                updateModalStep();

            }
            else if (editTarget)
            {

                closeEstimateModal();

                document.getElementById(editTarget).focus();

            }

        }
    );

    detail.appendChild(editButton);

    item.appendChild(term);

    item.appendChild(detail);

    reviewSummaryList.appendChild(item);

}

function buildReviewSummary()
{

    reviewSummaryList.textContent = '';

    const contactMethod = estimateModalForm.querySelector('input[name="preferredContactMethod"]:checked');

    addReviewRow('Name', document.getElementById('modalFullName').value.trim(), 1, null);

    addReviewRow('Phone', document.getElementById('modalPhone').value.trim(), 1, null);

    addReviewRow('Service', document.getElementById('modalServiceNeeded').value, 1, null);

    addReviewRow('Address', document.getElementById('propertyAddress').value.trim(), 1, null);

    addReviewRow('Approx. Acres', document.getElementById('estimatedAcres').value.trim(), 1, null);

    addReviewRow('Project', document.getElementById('projectDescription').value.trim(), 2, null);

    addReviewRow('Email', document.getElementById('email').value.trim(), 3, null);

    addReviewRow('Contact Method', contactMethod ? contactMethod.value : '', 3, null);

    addReviewRow('Best Time', document.getElementById('preferredTime').value, 3, null);

    addReviewRow('Photos', photoFiles.length + ' attached', 4, null);

}

/* ── Payload & submission ── */

/* Minted once per page load, on first use. Photo uploads need it
   before the lead exists, so this is deliberately not tied to the
   moment of submission. */

function getEstimateReferenceId()
{

    if (!currentEstimateReferenceId)
    {

        currentEstimateReferenceId = 'BG-' + Date.now();

    }

    return currentEstimateReferenceId;

}

function buildEstimatePayload()
{

    const contactMethod = estimateModalForm.querySelector('input[name="preferredContactMethod"]:checked');

    return {

        referenceId: getEstimateReferenceId(),

        submittedAt: new Date().toISOString(),

        fullName: document.getElementById('modalFullName').value.trim(),

        phone: document.getElementById('modalPhone').value.trim(),

        email: document.getElementById('email').value.trim(),

        propertyAddress: document.getElementById('propertyAddress').value.trim(),

        estimatedAcres: document.getElementById('estimatedAcres').value.trim(),

        serviceNeeded: document.getElementById('modalServiceNeeded').value,

        projectDescription: document.getElementById('projectDescription').value.trim(),

        preferredContactMethod: contactMethod ? contactMethod.value : 'Phone Call',

        preferredTime: document.getElementById('preferredTime').value,

        photoCount: photoFiles.length,

        photoNames: photoFiles.map(function (entry) { return entry.file.name; }),

        sourcePage: getSourcePage(),

        /* Sent so the API can run its own honeypot check. The client
           already blocks trapped submissions, but a bot posting
           straight to the endpoint bypasses that — the server needs
           to see the field to catch it. */

        companyWebsite: document.getElementById('companyWebsite')
            ? document.getElementById('companyWebsite').value
            : '',

        leadSource: attribution.leadSource,

        utmSource: attribution.utmSource,

        utmMedium: attribution.utmMedium,

        utmCampaign: attribution.utmCampaign,

        facebookCampaign: attribution.facebookCampaign

    };

}

function showSubmissionSuccess()
{

    estimateModalForm.hidden = true;

    formSuccessPanel.hidden = false;

    modalHasBeenSubmitted = true;

    formSuccessPanel.focus?.();

}

/* Releases the button for a retry after a failure. Success never
   calls this — the form is replaced by the success panel. */

function endEstimateSubmission()
{

    estimateSubmissionInFlight = false;

    estimateSubmitButton.disabled = false;

    estimateSubmitButton.classList.remove('isLoading');

}

function submitEstimateRequest()
{

    /* A double-tap on the submit button would otherwise fire two
       requests. Each carried its own referenceId, so the API's dedupe
       could not collapse them: one visitor, two rows in the sheet, two
       owner emails, two auto-replies, and double the MailApp quota. */

    if (estimateSubmissionInFlight)
    {

        return;

    }

    if (isHoneypotTripped())
    {

        showSubmissionSuccess();

        return;

    }

    const payload = buildEstimatePayload();

    estimateSubmissionInFlight = true;

    estimateSubmitButton.disabled = true;

    estimateSubmitButton.classList.add('isLoading');

    formSubmitError.hidden = true;

    if (!businessConfig.estimateEndpoint)
    {

        console.warn(
            'BlueGrid: estimateEndpoint is not configured — this submission was '
            + 'NOT saved and NO email was sent. Set businessConfig.estimateEndpoint '
            + 'in js/indexJS.js before launch. Payload that would have been sent:',
            payload
        );

        window.setTimeout(
            function ()
            {

                endEstimateSubmission();

                showSubmissionSuccess();

            },
            900
        );

        return;

    }

    /* Photos go up before the lead is created, so the owner's
       notification can carry links instead of filenames. The lead is
       created either way: uploadPendingPhotos never rejects, and the
       API records what actually reached storage rather than what the
       browser claimed to be sending. */

    uploadPendingPhotos()
        .then(function ()
        {

            /* Content-Type is text/plain on purpose: Apps Script web
               apps cannot answer a CORS preflight, and text/plain
               keeps the request "simple" so no preflight is sent. The
               body is still JSON and the API parses it as such. */

            return fetch(
                businessConfig.estimateEndpoint + '?action=leads.create',
                {

                    method: 'POST',

                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },

                    body: JSON.stringify(payload)

                }
            );

        })
        .then(function (response)
        {

            if (!response.ok)
            {

                throw new Error('Request failed with status ' + response.status);

            }

            return response.json();

        })
        .then(function (result)
        {

            endEstimateSubmission();

            if (result && result.success)
            {

                showSubmissionSuccess();

                return;

            }

            showSubmissionError(result && result.error);

        })
        .catch(function (requestError)
        {

            endEstimateSubmission();

            console.error('BlueGrid estimate submission failed:', requestError);

            showSubmissionError(null);

        });

}

/* Surfaces whatever the API objected to. Field-level messages are
   mapped back onto the inputs so the visitor can see which answer
   needs fixing instead of a generic failure. */

function showSubmissionError(apiError)
{

    formSubmitError.hidden = false;

    if (!apiError)
    {

        formSubmitError.textContent = 'Something went wrong sending your request. '
            + 'Please call us at ' + businessConfig.phoneDisplay + ' instead.';

        return;

    }

    if (apiError.code === 'VALIDATION_ERROR' && apiError.fields)
    {

        /* This fires from the modal's own submit — the visitor is
           looking at the modal, not the mini-form, so the highlighted
           field has to be the one they can actually see. */

        const fieldErrorIds = {

            fullName: 'modalFullNameError',

            phone: 'modalPhoneError',

            email: 'emailError',

            serviceNeeded: 'modalServiceNeededError',

            propertyAddress: 'propertyAddressError',

            estimatedAcres: 'estimatedAcresError'

        };

        Object.keys(apiError.fields).forEach(function (fieldName)
        {

            const errorElement = document.getElementById(fieldErrorIds[fieldName]);

            if (errorElement)
            {

                errorElement.textContent = apiError.fields[fieldName];

                errorElement.hidden = false;

            }

        });

        formSubmitError.textContent = 'Please check the highlighted details and try again.';

        return;

    }

    formSubmitError.textContent = apiError.message
        || 'Something went wrong sending your request. Please call us instead.';

}

/* ============================================================
   PHOTO UPLOADER  (reusable drag-and-drop with previews)
============================================================ */

function describePhotoEntry(entry)
{

    if (entry.failed)
    {

        return entry.file.name + ' · could not upload';

    }

    return entry.file.name + ' · ' + (entry.file.size / 1024 / 1024).toFixed(1) + ' MB';

}

function renderPhotoPreviews()
{

    photoPreviewGrid.textContent = '';

    photoFiles.forEach(function (entry)
    {

        const item = document.createElement('li');

        item.className = 'photoPreviewItem';

        const thumbnail = document.createElement('img');

        thumbnail.src = entry.previewUrl;

        thumbnail.alt = '';

        const progressBar = document.createElement('div');

        progressBar.className = 'photoProgressBar';

        const progressFill = document.createElement('div');

        progressFill.className = 'photoProgressFill';

        progressFill.style.width = entry.progress + '%';

        progressBar.appendChild(progressFill);

        const meta = document.createElement('span');

        meta.className = 'photoPreviewMeta';

        meta.textContent = describePhotoEntry(entry);

        const removeButton = document.createElement('button');

        removeButton.type = 'button';

        removeButton.className = 'photoRemoveButton';

        removeButton.textContent = '×';

        removeButton.setAttribute('aria-label', 'Remove ' + entry.file.name);

        removeButton.addEventListener(
            'click',
            function ()
            {

                /* Removing a photo mid-submission would renumber the
                   uploads already queued behind it. */

                if (estimateSubmissionInFlight)
                {

                    return;

                }

                URL.revokeObjectURL(entry.previewUrl);

                photoFiles = photoFiles.filter(function (candidate) { return candidate.id !== entry.id; });

                renderPhotoPreviews();

            }
        );

        item.appendChild(thumbnail);

        item.appendChild(progressBar);

        item.appendChild(meta);

        item.appendChild(removeButton);

        photoPreviewGrid.appendChild(item);

    });

}

/* ── Upload ──

   Progress is driven by the upload itself. It used to be a timer that
   filled every bar to 100% in about a second whether or not anything
   was being sent, which is how the first real lead reached the owner
   naming photos he could not open, from a visitor who had watched
   them "upload". */

function setPhotoProgress(entry, percent)
{

    entry.progress = percent;

    entry.failed = false;

    paintPhotoProgress(entry);

}

function markPhotoFailed(entry)
{

    entry.progress = 100;

    entry.failed = true;

    paintPhotoProgress(entry);

}

function paintPhotoProgress(entry)
{

    const index = photoFiles.indexOf(entry);

    if (index === -1)
    {

        return;

    }

    const item = photoPreviewGrid.children[index];

    if (!item)
    {

        return;

    }

    const fill = item.querySelector('.photoProgressFill');

    if (fill)
    {

        fill.style.width = entry.progress + '%';

    }

    const meta = item.querySelector('.photoPreviewMeta');

    if (meta)
    {

        meta.textContent = describePhotoEntry(entry);

    }

}

/* Sequential rather than parallel on purpose. This is a rural trade
   whose customers are regularly on one bar of signal, where twelve
   simultaneous uploads finish slower than twelve consecutive ones and
   fail far less gracefully.

   Never rejects. A photo that will not upload must not cost the lead:
   the API records what actually arrived, and the owner's email says
   plainly when something did not. */

function uploadPendingPhotos()
{

    let chain = Promise.resolve();

    photoFiles.forEach(function (entry, index)
    {

        if (entry.uploaded)
        {

            return;

        }

        chain = chain.then(function ()
        {

            return uploadOnePhoto(entry, index + 1);

        });

    });

    return chain;

}

function uploadOnePhoto(entry, position)
{

    setPhotoProgress(entry, 8);

    return preparePhotoForUpload(entry.file)
        .then(function (prepared)
        {

            setPhotoProgress(entry, 40);

            return fetch(
                businessConfig.estimateEndpoint + '?action=leads.addPhotos',
                {

                    method: 'POST',

                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },

                    body: JSON.stringify({

                        referenceId: getEstimateReferenceId(),

                        index: position,

                        fileName: entry.file.name,

                        mimeType: prepared.mimeType,

                        dataBase64: prepared.dataBase64

                    })

                }
            );

        })
        .then(function (response)
        {

            return response.json();

        })
        .then(function (result)
        {

            if (result && result.success)
            {

                /* Marked here so a retry after a failed submission
                   skips the photos that already landed, rather than
                   sending every one again. */

                entry.uploaded = true;

                setPhotoProgress(entry, 100);

                return;

            }

            /* The API's own reason, kept for the console only. The
               customer never sees it — the photo tile just shows the
               failed state — but without it a support call could only
               ever report "it didn't work". */

            console.warn(
                'BlueGrid: the API rejected a photo.',
                (result && result.error) ? result.error : result
            );

            markPhotoFailed(entry);

        })
        .catch(function (uploadError)
        {

            console.warn('BlueGrid: a photo could not be uploaded.', uploadError);

            markPhotoFailed(entry);

        });

}

/* Downscaled before upload for three reasons: a modern phone photo is
   several megabytes and this is a weak-signal trade; Apps Script has
   to hold the decoded bytes in memory; and base64 adds a third again
   on the wire. 1600px on the long edge is far more than enough to
   read brush, stumps and terrain.

   Falls back to the original file whenever the canvas path is
   unavailable or fails. A larger upload is much better than no
   photo. */

function preparePhotoForUpload(file)
{

    return downscaleImage(file)
        .catch(function ()
        {

            return file;

        })
        .then(function (blob)
        {

            return readBlobAsBase64(blob).then(function (dataBase64)
            {

                return {

                    dataBase64: dataBase64,

                    mimeType: blob.type || file.type

                };

            });

        });

}

function downscaleImage(file)
{

    const maxEdge = 1600;

    return loadImageSource(file).then(function (source)
    {

        const width = imageWidth(source);

        const height = imageHeight(source);

        const scale = Math.min(1, maxEdge / Math.max(width, height));

        /* Already small enough that re-encoding would cost quality
           and gain nothing. */

        if (scale === 1 && file.size <= 1200000)
        {

            releaseImageSource(source);

            return file;

        }

        const canvas = document.createElement('canvas');

        canvas.width = Math.round(width * scale);

        canvas.height = Math.round(height * scale);

        canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);

        releaseImageSource(source);

        return new Promise(function (resolve, reject)
        {

            canvas.toBlob(
                function (blob)
                {

                    if (blob)
                    {

                        resolve(blob);

                        return;

                    }

                    reject(new Error('Canvas produced no image.'));

                },
                'image/jpeg',
                0.82
            );

        });

    });

}

/* createImageBitmap is asked for 'from-image' orientation because
   phone photos are almost always rotated by EXIF metadata rather than
   by their pixels, and a naive canvas draw would lay a portrait shot
   of a treeline on its side. Modern browsers apply the same
   correction to an <img> by default, which is what the fallback
   relies on. */

function loadImageSource(file)
{

    if (typeof window.createImageBitmap === 'function')
    {

        return window
            .createImageBitmap(file, { imageOrientation: 'from-image' })
            .catch(function ()
            {

                return loadImageElement(file);

            });

    }

    return loadImageElement(file);

}

function loadImageElement(file)
{

    return new Promise(function (resolve, reject)
    {

        const image = new Image();

        const objectUrl = URL.createObjectURL(file);

        image.onload = function ()
        {

            URL.revokeObjectURL(objectUrl);

            resolve(image);

        };

        image.onerror = function ()
        {

            URL.revokeObjectURL(objectUrl);

            reject(new Error('That image could not be read.'));

        };

        image.src = objectUrl;

    });

}

/* An ImageBitmap reports width/height; an <img> reports its rendered
   size there and its real size on naturalWidth/naturalHeight. */

function imageWidth(source)
{

    return source.naturalWidth || source.width;

}

function imageHeight(source)
{

    return source.naturalHeight || source.height;

}

function releaseImageSource(source)
{

    if (source && typeof source.close === 'function')
    {

        source.close();

    }

}

function readBlobAsBase64(blob)
{

    return new Promise(function (resolve, reject)
    {

        const reader = new FileReader();

        reader.onload = function ()
        {

            /* readAsDataURL yields "data:<mime>;base64,<payload>" and
               the API wants the payload on its own. */

            const result = String(reader.result);

            resolve(result.slice(result.indexOf(',') + 1));

        };

        reader.onerror = function ()
        {

            reject(new Error('That image could not be read.'));

        };

        reader.readAsDataURL(blob);

    });

}

/* ── Upload policy ──

   These four numbers are the customer-facing half of a policy the API
   enforces independently. Changing them here changes what a visitor is
   told, NOT what is allowed: photoStorage.gs re-checks every one of
   them against the bytes that actually arrive, because a public
   endpoint cannot trust a browser. Keep the two in step. */

const photoPolicy = {

    maxPhotos: 5,

    maxBytesEach: 8 * 1024 * 1024,

    maxBytesTotal: 25 * 1024 * 1024,

    /* Matches ALLOWED_PHOTO_MIME_TYPES in config.gs. The file picker's
       accept="image/*" is a filter, not a guarantee — a visitor can
       still choose "all files" in most browsers, and drag-and-drop
       bypasses accept entirely. */

    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],

    /* HEIC is refused, but it is the one refusal a real customer is
       likely to hit rather than an attacker — an iPhone set to
       "Current" instead of "Most Compatible" hands over .heic files.
       Detected separately so the notice can tell them how to fix it
       instead of just saying no. */

    heicPattern: /\.(heic|heif)$/i

};

function describeMegabytes(bytes)
{

    return (bytes / 1024 / 1024).toFixed(0) + ' MB';

}

function currentPhotoBytes()
{

    return photoFiles.reduce(function (total, entry)
    {

        return total + entry.file.size;

    }, 0);

}

/* An empty file.type is common — some Android pickers and most
   drag-and-drop sources report nothing. The extension is the only
   other hint available in the browser, and being wrong here is
   harmless: the API inspects the real bytes either way. */

function looksLikeAcceptedImage(file)
{

    const type = String(file.type || '').toLowerCase();

    if (type)
    {

        return photoPolicy.acceptedTypes.indexOf(type) !== -1;

    }

    return /\.(jpe?g|png|webp)$/i.test(file.name || '');

}

function looksLikeHeic(file)
{

    const type = String(file.type || '').toLowerCase();

    return type === 'image/heic'
        || type === 'image/heif'
        || photoPolicy.heicPattern.test(file.name || '');

}

function addPhotoFiles(fileList)
{

    const rejections = [];

    let runningBytes = currentPhotoBytes();

    Array.prototype.forEach.call(fileList, function (file)
    {

        if (photoFiles.length >= photoPolicy.maxPhotos)
        {

            rejections.push('You can attach up to ' + photoPolicy.maxPhotos + ' photos.');

            return;

        }

        if (!looksLikeAcceptedImage(file))
        {

            rejections.push(looksLikeHeic(file)
                ? file.name + ' is an iPhone HEIC photo. On your iPhone open '
                    + 'Settings › Camera › Formats and choose Most Compatible, then retake '
                    + 'or re-save the photo. A screenshot of it works too.'
                : file.name + ' is not a JPG, PNG or WebP photo.');

            return;

        }

        if (file.size > photoPolicy.maxBytesEach)
        {

            rejections.push(file.name + ' is over '
                + describeMegabytes(photoPolicy.maxBytesEach) + '.');

            return;

        }

        if ((runningBytes + file.size) > photoPolicy.maxBytesTotal)
        {

            rejections.push(file.name + ' would put you over '
                + describeMegabytes(photoPolicy.maxBytesTotal) + ' in total.');

            return;

        }

        runningBytes += file.size;

        photoIdCounter += 1;

        const entry = {

            id: photoIdCounter,

            file: file,

            previewUrl: URL.createObjectURL(file),

            progress: 0,

            uploaded: false,

            failed: false

        };

        photoFiles.push(entry);

    });

    showPhotoNotice(rejections);

    renderPhotoPreviews();

}

/* One line, above the thumbnails, replaced on every selection. A
   visitor on a phone should not have to scroll to find out why a photo
   did not appear, and a dialog would be worse. Duplicates are collapsed
   so choosing eight oversized files says one thing, not eight. */

function showPhotoNotice(messages)
{

    if (!photoNoticeElement)
    {

        return;

    }

    const unique = [];

    messages.forEach(function (message)
    {

        if (unique.indexOf(message) === -1)
        {

            unique.push(message);

        }

    });

    photoNoticeElement.textContent = unique.join(' ');

    photoNoticeElement.hidden = unique.length === 0;

}

function initializePhotoUploader()
{

    if (!photoDropzone)
    {

        return;

    }

    photoBrowseButton.addEventListener(
        'click',
        function ()
        {

            photoInput.click();

        }
    );

    photoInput.addEventListener(
        'change',
        function ()
        {

            addPhotoFiles(photoInput.files);

            photoInput.value = '';

        }
    );

    ['dragenter', 'dragover'].forEach(function (eventName)
    {

        photoDropzone.addEventListener(
            eventName,
            function (event)
            {

                event.preventDefault();

                photoDropzone.classList.add('isDragOver');

            }
        );

    });

    photoDropzone.addEventListener(
        'dragleave',
        function ()
        {

            photoDropzone.classList.remove('isDragOver');

        }
    );

    photoDropzone.addEventListener(
        'drop',
        function (event)
        {

            event.preventDefault();

            photoDropzone.classList.remove('isDragOver');

            if (event.dataTransfer && event.dataTransfer.files)
            {

                addPhotoFiles(event.dataTransfer.files);

            }

        }
    );

}

/* ============================================================
   BEFORE / AFTER COMPARISON SLIDER  (reusable)
============================================================ */

function setSliderPosition(percent)
{

    const clamped = Math.max(2, Math.min(98, percent));

    comparisonSlider.style.setProperty('--sliderPos', clamped + '%');

    sliderHandle.setAttribute('aria-valuenow', Math.round(clamped));

}

function initializeComparisonSlider()
{

    if (!comparisonSlider || !sliderHandle)
    {

        return;

    }

    let isDragging = false;

    function positionFromEvent(event)
    {

        const bounds = comparisonSlider.getBoundingClientRect();

        return ((event.clientX - bounds.left) / bounds.width) * 100;

    }

    comparisonSlider.addEventListener(
        'pointerdown',
        function (event)
        {

            isDragging = true;

            comparisonSlider.setPointerCapture(event.pointerId);

            setSliderPosition(positionFromEvent(event));

        }
    );

    comparisonSlider.addEventListener(
        'pointermove',
        function (event)
        {

            if (isDragging)
            {

                setSliderPosition(positionFromEvent(event));

            }

        }
    );

    ['pointerup', 'pointercancel'].forEach(function (eventName)
    {

        comparisonSlider.addEventListener(
            eventName,
            function ()
            {

                isDragging = false;

            }
        );

    });

    sliderHandle.addEventListener(
        'keydown',
        function (event)
        {

            const current = Number(sliderHandle.getAttribute('aria-valuenow'));

            if (event.key === 'ArrowLeft')
            {

                event.preventDefault();

                setSliderPosition(current - 5);

            }

            if (event.key === 'ArrowRight')
            {

                event.preventDefault();

                setSliderPosition(current + 5);

            }

        }
    );

}

/* ============================================================
   SERVICE AREA MAP  (data-driven, expansion-ready)
============================================================ */

function getRegionStateAbbreviation(region)
{

    return region.state.includes('Ohio') ? 'OH' : 'KY';

}

function populateServiceAreaCoverageList()
{

    if (!mapInfoTowns)
    {

        return;

    }

    mapInfoTowns.textContent = '';

    Object.keys(serviceRegions).forEach(function (regionKey)
    {

        const region = serviceRegions[regionKey];

        const item = document.createElement('li');

        item.textContent = region.name + ', ' + getRegionStateAbbreviation(region);

        mapInfoTowns.appendChild(item);

    });

}

function showServiceAreaCoverageSummary()
{

    if (mapInfoState)
    {

        mapInfoState.textContent = 'Service Area';

    }

    if (mapInfoRegion)
    {

        mapInfoRegion.textContent = 'Core Coverage';

    }

    if (mapInfoCopy)
    {

        mapInfoCopy.textContent = 'We regularly serve these counties and the surrounding rural communities.';

    }

    populateServiceAreaCoverageList();

}

function setActiveRegion(regionKey)
{

    const region = serviceRegions[regionKey];

    if (!region || !serviceAreaMap || !mapInfoState || !mapInfoRegion || !mapInfoCopy || !mapInfoTowns)
    {

        return;

    }

    serviceAreaMap.querySelectorAll('.mapRegion').forEach(function (path)
    {

        const isActive = path.dataset.region === regionKey;

        path.classList.toggle('isActive', isActive);

        path.setAttribute('aria-pressed', isActive ? 'true' : 'false');

    });

    mapInfoState.textContent = region.state;

    mapInfoRegion.textContent = region.name;

    mapInfoCopy.textContent = 'Forestry mulching, land clearing, and storm cleanup across ' + region.name + '. Towns we regularly serve:';

    mapInfoTowns.textContent = '';

    region.towns.forEach(function (town)
    {

        const item = document.createElement('li');

        item.textContent = town;

        mapInfoTowns.appendChild(item);

    });

}

function initializeServiceAreaMap()
{

    if (!serviceAreaMap)
    {

        return;

    }

    const mapRegions = serviceAreaMap.querySelectorAll('.mapRegion');

    if (!mapRegions.length)
    {

        showServiceAreaCoverageSummary();

        return;

    }

    mapRegions.forEach(function (path)
    {

        path.addEventListener(
            'click',
            function ()
            {

                setActiveRegion(path.dataset.region);

            }
        );

        path.addEventListener(
            'keydown',
            function (event)
            {

                if (event.key === 'Enter' || event.key === ' ')
                {

                    event.preventDefault();

                    setActiveRegion(path.dataset.region);

                }

            }
        );

    });

    setActiveRegion('scioto');

}

/* ============================================================
   FAQ ACCORDION  (one open at a time)
============================================================ */

function closeFaqItem(toggle)
{

    toggle.setAttribute('aria-expanded', 'false');

    document.getElementById(toggle.getAttribute('aria-controls')).style.maxHeight = '0px';

}

function initializeFaqAccordion()
{

    faqToggles.forEach(function (toggle)
    {

        toggle.addEventListener(
            'click',
            function ()
            {

                const panel = document.getElementById(toggle.getAttribute('aria-controls'));

                const willOpen = toggle.getAttribute('aria-expanded') !== 'true';

                faqToggles.forEach(closeFaqItem);

                if (willOpen)
                {

                    toggle.setAttribute('aria-expanded', 'true');

                    panel.style.maxHeight = panel.scrollHeight + 'px';

                }

            }
        );

    });

}

/* ============================================================
   FACEBOOK EMBED  (injected only when a real page exists —
   the designed fallback panel shows otherwise, never an
   empty iframe)
============================================================ */

function initializeFacebookEmbed()
{

    if (!facebookEmbedSlot || !businessConfig.facebookPageConfigured)
    {

        return;

    }

    const pluginSrc = 'https://www.facebook.com/plugins/page.php'
        + '?href=' + encodeURIComponent(businessConfig.facebookUrl)
        + '&tabs=timeline&width=380&height=480&small_header=true'
        + '&adapt_container_width=true&hide_cover=false';

    const embedFrame = document.createElement('iframe');

    embedFrame.className = 'facebookEmbed';

    embedFrame.src = pluginSrc;

    embedFrame.width = '380';

    embedFrame.height = '480';

    embedFrame.loading = 'lazy';

    embedFrame.title = 'BlueGrid Land Solutions on Facebook';

    embedFrame.setAttribute('scrolling', 'no');

    embedFrame.setAttribute('frameborder', '0');

    embedFrame.setAttribute(
        'allow',
        'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'
    );

    facebookEmbedSlot.textContent = '';

    facebookEmbedSlot.appendChild(embedFrame);

}

/* ============================================================
   OWNER INTRODUCTION VIDEO  (reusable — YouTube / Vimeo / self-hosted)
============================================================ */

/* Returns an embeddable player URL for a YouTube or Vimeo share link,
   or null when the URL is neither. */

function buildVideoEmbedSource(videoUrl)
{

    const youTubeMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);

    if (youTubeMatch)
    {

        return 'https://www.youtube-nocookie.com/embed/' + youTubeMatch[1] + '?rel=0';

    }

    const vimeoMatch = videoUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);

    if (vimeoMatch)
    {

        return 'https://player.vimeo.com/video/' + vimeoMatch[1];

    }

    return null;

}

function initializeIntroVideo()
{

    if (!introMediaSlot || !businessConfig.introVideoConfigured || !businessConfig.introVideoUrl)
    {

        return;

    }

    const embedSource = buildVideoEmbedSource(businessConfig.introVideoUrl);

    let player;

    if (embedSource)
    {

        player = document.createElement('iframe');

        player.src = embedSource;

        player.title = 'Introduction from the owner of BlueGrid Land Solutions';

        player.loading = 'lazy';

        player.setAttribute('frameborder', '0');

        player.setAttribute('allowfullscreen', '');

        player.setAttribute(
            'allow',
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        );

    }
    else
    {

        /* Anything else is treated as a self-hosted file path. */

        player = document.createElement('video');

        player.src = businessConfig.introVideoUrl;

        player.poster = businessConfig.introVideoPoster;

        player.controls = true;

        player.preload = 'metadata';

        player.setAttribute('playsinline', '');

    }

    introMediaSlot.textContent = '';

    introMediaSlot.appendChild(player);

}

/* ============================================================
   BUSINESS CONFIG APPLICATION
============================================================ */

function applyBusinessConfig()
{

    document.querySelectorAll('[data-confighref]').forEach(function (element)
    {

        const configKey = element.dataset.confighref;

        if (businessConfig[configKey])
        {

            element.href = businessConfig[configKey];

        }

    });

    document.querySelectorAll('[data-configtext]').forEach(function (element)
    {

        const configKey = element.dataset.configtext;

        if (businessConfig[configKey])
        {

            element.textContent = businessConfig[configKey];

        }

    });

    /* The Google Business Profile does not exist yet. Rather than ship a
       dead href="#" that opens a blank tab, hide the icon until
       googleBusinessUrl is filled in above. */

    if (!businessConfig.googleBusinessUrl)
    {

        document.querySelectorAll('.footerGoogleLink').forEach(function (link)
        {

            link.hidden = true;

        });

    }

}

/* ============================================================
   EVENT LISTENERS
============================================================ */

window.addEventListener('scroll', updateHeaderScrollState, { passive: true });

window.addEventListener(
    'resize',
    function ()
    {

        updateHeaderScrollState();

    }
);

/* Every listener below is guarded: this script is shared by the homepage,
   the service pages, and the location pages, and not every page renders
   every component. */

if (mobileMenuToggle)
{

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

}

if (mobileMenuClose)
{

    mobileMenuClose.addEventListener('click', closeMobileMenu);

}

if (mobileFloatingEstimate)
{

    mobileFloatingEstimate.addEventListener(
        'click',
        function ()
        {

            siteHeader.classList.remove('isHiddenMobile');

            updateFloatingControls();

        }
    );

}

if (backToTopButton)
{

    backToTopButton.addEventListener(
        'click',
        function ()
        {

            siteHeader.classList.remove('isHiddenMobile');

            updateFloatingControls(0);

            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });

        }
    );

}

/* ── "Get My Free Estimate"-style CTAs ──
   These are every a[href="#estimateForm"] on the page — header,
   hero, mobile floating bar, footer, mega menu, and their equivalents
   on every service/location/FAQ/company/Insights page. The mini-form's
   own Continue button is never one of these: it is a <button
   type="submit"> inside #estimateForm, not an anchor, so it keeps its
   existing submit-handler behaviour below untouched.

   Previously this scrolled to the mini-form and focused its first
   field. That was itself a fix for the anchor jump reading as broken
   (.heroSection and .estimateFormCard can share one screen, so the
   native scroll was a few pixels or none) — but scrolling to the mini
   form at all was the wrong destination: these CTAs are meant to start
   the estimate flow, not point at one entry into it. They now open the
   modal directly, at whatever step it is already on (step 1 for a
   first-time visitor, since currentModalStep starts there and nothing
   here resets it — reopening after a partial fill still resumes where
   the visitor left off, same as it always has). */

estimateFormCtas.forEach(function (cta)
{

    cta.addEventListener(
        'click',
        function (event)
        {

            event.preventDefault();

            openEstimateModal();

        }
    );

});

if (estimateMiniForm)
{

    estimateMiniForm.addEventListener(
        'submit',
        function (event)
        {

            event.preventDefault();

            if (!validateMiniForm())
            {

                return;

            }

            if (modalHasBeenSubmitted)
            {

                estimateModalForm.hidden = true;

                formSuccessPanel.hidden = false;

            }

            copyMiniFormIntoModal();

            openEstimateModal();

        }
    );

}

if (modalNextButton)
{

    modalNextButton.addEventListener(
        'click',
        function ()
        {

            if (!validateModalStep(currentModalStep))
            {

                return;

            }

            currentModalStep = Math.min(currentModalStep + 1, totalModalSteps);

            updateModalStep();

        }
    );

}

if (modalBackButton)
{

    modalBackButton.addEventListener(
        'click',
        function ()
        {

            currentModalStep = Math.max(currentModalStep - 1, 1);

            updateModalStep();

        }
    );

}

if (estimateModalForm)
{

    estimateModalForm.addEventListener(
        'submit',
        function (event)
        {

            event.preventDefault();

            if (validateModalStep(1) && validateModalStep(3))
            {

                submitEstimateRequest();

            }

        }
    );

}

if (estimateModalClose)
{

    estimateModalClose.addEventListener('click', closeEstimateModal);

}

if (estimateModalBackdrop)
{

    estimateModalBackdrop.addEventListener('click', closeEstimateModal);

}

if (viewWorkButton)
{

    viewWorkButton.addEventListener(
        'click',
        function ()
        {

            closeEstimateModal();

            /* Service and location pages carry data-workhref, because the
               transformation gallery only lives on the homepage. */

            const workHref = viewWorkButton.dataset.workhref;

            if (workHref)
            {

                window.location.href = workHref;

                return;

            }

            const transformationSection = document.getElementById('beforeAfter');

            if (transformationSection)
            {

                transformationSection.scrollIntoView({
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });

            }

        }
    );

}

if (estimateModal)
{

    document.addEventListener(
        'keydown',
        function (event)
        {

            if (event.key === 'Escape' && !estimateModal.hidden)
            {

                closeEstimateModal();

            }

            trapModalFocus(event);

        }
    );

}

/* ============================================================
   INITIALIZATION
============================================================ */

applyBusinessConfig();

updateHeaderScrollState();

initializeAnimationEngine();

initializeHeroEntrance();

initializeHeroDuet();

initializeProcessSequences();

initializeParallaxSections();

initializeMegaMenus();

initializeMobileAccordions();

initializePhotoUploader();

initializeComparisonSlider();

initializeServiceAreaMap();

initializeFaqAccordion();

initializeFacebookEmbed();

initializeIntroVideo();
