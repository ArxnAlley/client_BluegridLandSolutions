/* ============================================================
   BLUEGRID LAND SOLUTIONS — HOMEPAGE SCRIPTS
   Flagship Nulo Studio build — reusable systems are marked.
============================================================ */

/* ============================================================
   BUSINESS CONFIG
============================================================ */

const businessConfig = {

    // TODO: Paste the BlueGridAPI Apps Script deployment URL here (Phase 10).
    // While this is empty, submissions are logged to the console and success
    // is simulated so the demo flow works end to end.
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
    googleBusinessUrl: ''

};

/* ============================================================
   ENVIRONMENT FLAGS
============================================================ */

document.documentElement.classList.add('jsEnabled');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const mobileHeaderMediaQuery = window.matchMedia('(max-width: 1080px)');

const mobileParallaxMediaQuery = window.matchMedia('(max-width: 640px)');

/* ============================================================
   SELECTORS
============================================================ */

const siteHeader = document.getElementById('siteHeader');

const megaMenuItems = document.querySelectorAll('.navItem.hasMegaMenu');

const mobileMenu = document.getElementById('mobileMenu');

const mobileMenuToggle = document.getElementById('mobileMenuToggle');

const mobileMenuClose = document.getElementById('mobileMenuClose');

const heroSection = document.getElementById('top');

const heroPlateBefore = document.getElementById('heroPlateBefore');

const heroPlateAfter = document.getElementById('heroPlateAfter');

const heroTypedText = document.getElementById('heroTypedText');

const heroCursor = document.getElementById('heroCursor');

const heroTypedGhost = document.getElementById('heroTypedGhost');

const heroHeadlineFixed = document.getElementById('heroHeadlineFixed');

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

const facebookEmbedSlot = document.getElementById('facebookEmbedSlot');

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

    typeMsPerCharRange: [70, 110],

    hesitationMsRange: [180, 350],

    deleteFirstTapsMs: 95,

    deleteRepeatMs: 38,

    settleAfterPeriodMs: 120,

    afterHoldMs: 2400,

    emptyBreathMs: 550,

    forwardSweepMs: 1400,

    reverseDissolveMs: 1800,

    entranceDelayMs: 1050

};

let heroPhraseIndex = 0;

let heroAfterImageReady = false;

let heroOutOfView = false;

let heroTabHidden = false;

let heroPaused = false;

let heroResumeAt = 0;

let lastHeaderScrollY = window.scrollY;

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

    lawrenceKy: { state: 'Eastern Kentucky', name: 'Lawrence County', towns: ['Louisa', 'Blaine'] }

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

function getSourcePage()
{

    const pathName = window.location.pathname.split('/').pop() || 'index.html';

    return pathName + '#estimateForm';

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

    const target = Number(element.dataset.countertarget);

    if (!Number.isFinite(target))
    {

        return;

    }

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

function initializeAnimationEngine()
{

    const animatedElements = document.querySelectorAll('[data-animate]');

    if (prefersReducedMotion || !('IntersectionObserver' in window))
    {

        animatedElements.forEach(function (element)
        {

            element.classList.add('isAnimated');

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

    const revealObserver = new IntersectionObserver(
        function (entries, observer)
        {

            entries.forEach(function (entry)
            {

                if (!entry.isIntersecting)
                {

                    return;

                }

                entry.target.classList.add('isAnimated');

                entry.target.querySelectorAll('.statNumber[data-countertarget]').forEach(animateCounter);

                if (entry.target.matches('.statNumber[data-countertarget]'))
                {

                    animateCounter(entry.target);

                }

                observer.unobserve(entry.target);

            });

        },
        { threshold: 0.15 }
    );

    animatedElements.forEach(function (element)
    {

        revealObserver.observe(element);

    });

    const counterOnlyElements = document.querySelectorAll('.statNumber[data-countertarget]');

    const counterObserver = new IntersectionObserver(
        function (entries, observer)
        {

            entries.forEach(function (entry)
            {

                if (!entry.isIntersecting)
                {

                    return;

                }

                animateCounter(entry.target);

                observer.unobserve(entry.target);

            });

        },
        { threshold: 0.4 }
    );

    counterOnlyElements.forEach(function (element)
    {

        if (!element.closest('[data-animate]'))
        {

            counterObserver.observe(element);

        }

    });

}

/* ============================================================
   HERO DUET ENGINE  (reusable — auto-looping Before/After +
   human-typed headline; see docs/heroDirection/heroSpecification.md.
   No video, no slider, no manual controls. Typing is claiming;
   deletion is clearing; the land answers.)
============================================================ */

function heroWait(durationMs)
{

    return new Promise(
        function (resolve)
        {

            window.setTimeout(resolve, durationMs);

        }
    );

}

function heroRandomBetween(min, max)
{

    return min + (Math.random() * (max - min));

}

/* ── Pause etiquette: typing may freeze anywhere; an in-flight
     sweep or dissolve always finishes first. Resuming waits a
     short breath rather than snapping back instantly. ── */

function updateHeroPausedState()
{

    const shouldPause = heroOutOfView || heroTabHidden;

    if (shouldPause && !heroPaused)
    {

        heroPaused = true;

    }
    else if (!shouldPause && heroPaused)
    {

        heroPaused = false;

        heroResumeAt = Date.now() + 500;

    }

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

    document.addEventListener(
        'visibilitychange',
        function ()
        {

            heroTabHidden = document.hidden;

            updateHeroPausedState();

        }
    );

}

function heroWaitWhilePaused()
{

    return new Promise(
        function (resolve)
        {

            function check()
            {

                if (!heroPaused && Date.now() >= heroResumeAt)
                {

                    resolve();

                }
                else
                {

                    window.setTimeout(check, 150);

                }

            }

            check();

        }
    );

}

/* ── Human typing: variable per-character timing, one mid-phrase
     hesitation, solid cursor while typing/deleting, blink at rest. ── */

function typeHeroPhrase(phrase)
{

    return new Promise(
        function (resolve)
        {

            let charIndex = 0;

            heroCursor.classList.add('isSolid');

            const hesitationIndex = 1 + Math.floor(Math.random() * Math.max(phrase.length - 2, 1));

            function typeNextChar()
            {

                if (charIndex >= phrase.length)
                {

                    window.setTimeout(
                        function ()
                        {

                            heroCursor.classList.remove('isSolid');

                        },
                        350
                    );

                    resolve();

                    return;

                }

                heroTypedText.textContent = phrase.slice(0, charIndex + 1);

                charIndex += 1;

                let delay = heroRandomBetween(heroDuetConfig.typeMsPerCharRange[0], heroDuetConfig.typeMsPerCharRange[1]);

                if (phrase[charIndex - 1] === ' ')
                {

                    delay += 30;

                }

                if (charIndex === hesitationIndex)
                {

                    delay += heroRandomBetween(heroDuetConfig.hesitationMsRange[0], heroDuetConfig.hesitationMsRange[1]);

                }

                window.setTimeout(typeNextChar, delay);

            }

            typeNextChar();

        }
    );

}

function deleteHeroPhrase(phrase)
{

    return new Promise(
        function (resolve)
        {

            let remaining = phrase.length;

            let tapsDone = 0;

            heroCursor.classList.add('isSolid');

            function deleteNextChar()
            {

                if (remaining <= 0)
                {

                    window.setTimeout(
                        function ()
                        {

                            heroCursor.classList.remove('isSolid');

                        },
                        350
                    );

                    resolve();

                    return;

                }

                remaining -= 1;

                heroTypedText.textContent = phrase.slice(0, remaining);

                tapsDone += 1;

                const delay = tapsDone <= 2 ? heroDuetConfig.deleteFirstTapsMs : heroDuetConfig.deleteRepeatMs;

                window.setTimeout(deleteNextChar, delay);

            }

            deleteNextChar();

        }
    );

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

            }
            else
            {

                heroPlateAfter.addEventListener('load', trigger, { once: true });

            }

        }
    );

}

function fireHeroReverseDissolve()
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

        },
        heroDuetConfig.reverseDissolveMs
    );

}

/* ── Hero stat counters run on their own schedule (decoupled from
     the shared viewport-triggered engine) so they count up exactly
     when they become visible in the entrance sequence. ── */

function animateHeroStatCounters()
{

    document.querySelectorAll('.heroStats .statNumber[data-herocountertarget]').forEach(
        function (element)
        {

            element.dataset.countertarget = element.dataset.herocountertarget;

            element.dataset.countersuffix = element.dataset.herocountersuffix || '';

            animateCounter(element);

        }
    );

}

async function runHeroDuetLoop()
{

    heroCursor.classList.add('isVisible');

    await heroWait(heroDuetConfig.entranceDelayMs);

    for (;;)
    {

        const phrase = heroDuetConfig.phrases[heroPhraseIndex];

        await heroWaitWhilePaused();

        await typeHeroPhrase(phrase);

        await heroWait(heroDuetConfig.settleAfterPeriodMs);

        await heroWaitWhilePaused();

        await fireHeroForwardSweepAndWait();

        await heroWait(heroDuetConfig.afterHoldMs);

        await heroWaitWhilePaused();

        await deleteHeroPhrase(phrase);

        fireHeroReverseDissolve();

        await heroWait(heroDuetConfig.emptyBreathMs);

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

    /* The fixed hook is always inside the hero's initial viewport,
       so it gets a direct, guaranteed timer rather than depending
       on the shared scroll-triggered IntersectionObserver engine. */

    if (heroHeadlineFixed)
    {

        window.setTimeout(
            function ()
            {

                heroHeadlineFixed.classList.add('isVisible');

            },
            400
        );

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

    animateHeroStatCounters();

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

function updateHeaderScrollState()
{

    const currentScrollY = Math.max(window.scrollY, 0);

    siteHeader.classList.toggle('isScrolled', currentScrollY > 40);

    if (prefersReducedMotion || !mobileHeaderMediaQuery.matches)
    {

        siteHeader.classList.remove('isHiddenMobile');

        lastHeaderScrollY = currentScrollY;

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

    mobileMenu.classList.add('isOpen');

    mobileMenu.setAttribute('aria-hidden', 'false');

    mobileMenuToggle.setAttribute('aria-expanded', 'true');

    lockBodyScroll(true);

}

function closeMobileMenu()
{

    mobileMenu.classList.remove('isOpen');

    mobileMenu.setAttribute('aria-hidden', 'true');

    mobileMenuToggle.setAttribute('aria-expanded', 'false');

    lockBodyScroll(false);

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

        console.info('BlueGrid estimate payload (no endpoint configured yet):', payload);

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

    fetch(
        businessConfig.estimateEndpoint + '?action=leads.create',
        {

            method: 'POST',

            headers: { 'Content-Type': 'text/plain;charset=utf-8' },

            body: JSON.stringify(payload)

        }
    )
        .then(function (response) { return response.json(); })
        .then(function (result)
        {

            estimateSubmitButton.classList.remove('isLoading');

            if (result && result.success)
            {

                showSubmissionSuccess();

            }
            else
            {

                formSubmitError.hidden = false;

            }

        })
        .catch(function ()
        {

            estimateSubmitButton.classList.remove('isLoading');

            formSubmitError.hidden = false;

        });

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

function setActiveRegion(regionKey)
{

    const region = serviceRegions[regionKey];

    if (!region)
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

    serviceAreaMap.querySelectorAll('.mapRegion').forEach(function (path)
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

}

/* ============================================================
   EVENT LISTENERS
============================================================ */

window.addEventListener('scroll', updateHeaderScrollState, { passive: true });

mobileMenuToggle.addEventListener('click', openMobileMenu);

mobileMenuClose.addEventListener('click', closeMobileMenu);

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

modalBackButton.addEventListener(
    'click',
    function ()
    {

        currentModalStep = Math.max(currentModalStep - 1, 1);

        updateModalStep();

    }
);

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

estimateModalClose.addEventListener('click', closeEstimateModal);

estimateModalBackdrop.addEventListener('click', closeEstimateModal);

viewWorkButton.addEventListener(
    'click',
    function ()
    {

        closeEstimateModal();

        document.getElementById('beforeAfter').scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

    }
);

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

/* ============================================================
   INITIALIZATION
============================================================ */

applyBusinessConfig();

updateHeaderScrollState();

initializeAnimationEngine();

initializeHeroDuet();

initializeParallaxSections();

initializeMegaMenus();

initializeMobileAccordions();

initializePhotoUploader();

initializeComparisonSlider();

initializeServiceAreaMap();

initializeFaqAccordion();

initializeFacebookEmbed();
