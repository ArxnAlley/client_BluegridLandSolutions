/* ============================================================
   BLUEGRID LAND SOLUTIONS — HOMEPAGE SCRIPTS
   Flagship Nulo Studio build — reusable systems are marked.
============================================================ */

/* ============================================================
   BUSINESS CONFIG
============================================================ */

const businessConfig = {

    // ⚠ LAUNCH BLOCKER — paste the Apps Script Web App /exec URL here.
    //
    // Deploy the project in appsScript/ (see appsScript/README.md), then
    // paste the deployment URL below. It looks like:
    //   https://script.google.com/macros/s/AKfycb.../exec
    //
    // While this stays empty the form SIMULATES success: the payload is
    // logged to the console, nothing reaches the Google Sheet, and no
    // email is sent. Do not go live until this is filled in.
    estimateEndpoint: '',

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
    introVideoPoster: 'graphics/images/excavator2.jpg'

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

function waitForHeroResume()
{

    if (!heroPaused && heroResumeTimerId === null)
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

/* ── Human typing: restrained per-character variation, a short
     space pause, solid cursor while active, blink at rest. ── */

async function typeHeroPhrase(phrase)
{

    heroCursor.classList.add('isSolid');

    for (let charIndex = 0; charIndex < phrase.length; charIndex += 1)
    {

        heroTypedText.textContent = phrase.slice(0, charIndex + 1);

        if (charIndex >= phrase.length - 1)
        {

            continue;

        }

        let delay = heroRandomBetween(
            heroDuetConfig.typeMsPerCharRange[0],
            heroDuetConfig.typeMsPerCharRange[1]
        );

        if (phrase[charIndex] === ' ')
        {

            delay += 20;

        }

        await waitForHeroTiming(delay);

    }

    heroCursor.classList.remove('isSolid');

}

async function deleteHeroPhrase(phrase)
{

    heroCursor.classList.add('isSolid');

    for (let remaining = phrase.length - 1; remaining >= 0; remaining -= 1)
    {

        heroTypedText.textContent = phrase.slice(0, remaining);

        if (remaining <= 0)
        {

            continue;

        }

        const delay = heroRandomBetween(
            heroDuetConfig.deleteMsPerCharRange[0],
            heroDuetConfig.deleteMsPerCharRange[1]
        );

        await waitForHeroTiming(delay);

    }

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

        heroTypedText.textContent = heroDuetConfig.phrases[0];

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

function validateModalStep(stepNumber)
{

    if (stepNumber === 1)
    {

        const addressValid = validateRequiredText(document.getElementById('propertyAddress'), 'propertyAddressError');

        const acresValid = validateAcresField(document.getElementById('estimatedAcres'), 'estimatedAcresError');

        return addressValid && acresValid;

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

    addReviewRow('Name', document.getElementById('fullName').value.trim(), null, 'fullName');

    addReviewRow('Phone', document.getElementById('phone').value.trim(), null, 'phone');

    addReviewRow('Service', document.getElementById('serviceNeeded').value, null, 'serviceNeeded');

    addReviewRow('Address', document.getElementById('propertyAddress').value.trim(), 1, null);

    addReviewRow('Approx. Acres', document.getElementById('estimatedAcres').value.trim(), 1, null);

    addReviewRow('Project', document.getElementById('projectDescription').value.trim(), 2, null);

    addReviewRow('Email', document.getElementById('email').value.trim(), 3, null);

    addReviewRow('Contact Method', contactMethod ? contactMethod.value : '', 3, null);

    addReviewRow('Best Time', document.getElementById('preferredTime').value, 3, null);

    addReviewRow('Photos', photoFiles.length + ' attached', 4, null);

}

/* ── Payload & submission ── */

function buildEstimatePayload()
{

    const contactMethod = estimateModalForm.querySelector('input[name="preferredContactMethod"]:checked');

    return {

        leadId: 'BG-' + Date.now(),

        submittedAt: new Date().toISOString(),

        fullName: document.getElementById('fullName').value.trim(),

        phone: document.getElementById('phone').value.trim(),

        email: document.getElementById('email').value.trim(),

        propertyAddress: document.getElementById('propertyAddress').value.trim(),

        estimatedAcres: document.getElementById('estimatedAcres').value.trim(),

        serviceNeeded: document.getElementById('serviceNeeded').value,

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

function submitEstimateRequest()
{

    if (isHoneypotTripped())
    {

        showSubmissionSuccess();

        return;

    }

    const payload = buildEstimatePayload();

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

                estimateSubmitButton.classList.remove('isLoading');

                showSubmissionSuccess();

            },
            900
        );

        return;

    }

    /* Content-Type is text/plain on purpose: Apps Script web apps
       cannot answer a CORS preflight, and text/plain keeps the
       request "simple" so no preflight is sent. The body is still
       JSON and the API parses it as such. */

    fetch(
        businessConfig.estimateEndpoint + '?action=leads.create',
        {

            method: 'POST',

            headers: { 'Content-Type': 'text/plain;charset=utf-8' },

            body: JSON.stringify(payload)

        }
    )
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

            estimateSubmitButton.classList.remove('isLoading');

            if (result && result.success)
            {

                showSubmissionSuccess();

                return;

            }

            showSubmissionError(result && result.error);

        })
        .catch(function (requestError)
        {

            estimateSubmitButton.classList.remove('isLoading');

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

        const fieldErrorIds = {

            fullName: 'fullNameError',

            phone: 'phoneError',

            email: 'emailError',

            serviceNeeded: 'serviceNeededError',

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

        meta.textContent = entry.file.name + ' · ' + (entry.file.size / 1024 / 1024).toFixed(1) + ' MB';

        const removeButton = document.createElement('button');

        removeButton.type = 'button';

        removeButton.className = 'photoRemoveButton';

        removeButton.textContent = '×';

        removeButton.setAttribute('aria-label', 'Remove ' + entry.file.name);

        removeButton.addEventListener(
            'click',
            function ()
            {

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

function simulateUploadProgress(entry)
{

    const interval = window.setInterval(
        function ()
        {

            entry.progress = Math.min(entry.progress + 12 + Math.random() * 18, 100);

            const fills = photoPreviewGrid.querySelectorAll('.photoProgressFill');

            const index = photoFiles.indexOf(entry);

            if (fills[index])
            {

                fills[index].style.width = entry.progress + '%';

            }

            if (entry.progress >= 100)
            {

                window.clearInterval(interval);

            }

        },
        160
    );

}

function addPhotoFiles(fileList)
{

    const maxPhotos = 12;

    Array.prototype.forEach.call(fileList, function (file)
    {

        if (!file.type.startsWith('image/') || photoFiles.length >= maxPhotos)
        {

            return;

        }

        photoIdCounter += 1;

        const entry = {

            id: photoIdCounter,

            file: file,

            previewUrl: URL.createObjectURL(file),

            progress: 0

        };

        photoFiles.push(entry);

        simulateUploadProgress(entry);

    });

    renderPhotoPreviews();

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

initializeParallaxSections();

initializeMegaMenus();

initializeMobileAccordions();

initializePhotoUploader();

initializeComparisonSlider();

initializeServiceAreaMap();

initializeFaqAccordion();

initializeFacebookEmbed();

initializeIntroVideo();
