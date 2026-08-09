# Engineering Journal — BlueGrid Land Solutions

Append-only. Newest entry at the top.

---

## 2026-08-09 — OUR COMPANY MEGA MENU, COMPANY PAGE, TWO-PHASE PROCESS ANIMATION

### Brief

Two objectives. Add an **Our Company** primary nav item built on the existing shared mega-menu system rather than a fourth dropdown architecture; and refine the process animation into a one-time step reveal followed by a permanent arrow-only loop, fixing the responsive clipping reported from browser QA along the way.

### The header could not absorb a fifth item where it stood

Measured from the real Inter/Rokkitt files, as every header decision on this project has been. `Our Company` costs **144px including its gap**, taking the compact header from 988px to **1131px** and the full-spacing header from 1080px to **1236px**.

At the shipped 1150px switch that left **+20px** on Inter and **−22px** on the wider `'Segoe UI'` fallback — the bar would have wrapped on first paint for anyone whose cache was cold, which is the exact failure the breakpoint's ~45px design margin exists to prevent. The switch moved to **1200px**: +70px on Inter, +11px on the fallback. 1176px was the arithmetic minimum and left 4px, which is not a margin.

**The more interesting finding was above the fold, not below it.** With five items the *full-spacing* band became the tightest point on the entire sweep: at 1281px the bar cleared by only 45px, so the widest band was the one under most pressure — the wrong shape for a responsive header. The compact band therefore moved from 1280px to **1360px**, which is `.headerInner`'s own `max-width`, and that is the whole argument for the number. Above 1360px the inner is capped, so available width never changes and full spacing always clears by 124px; below it every pixel of viewport is a pixel of header, which is exactly where compact tokens belong. Crossing 1360px downward still makes the bar roomier (+124px → +229px).

No typography, phone chip, CTA padding or spacing token was touched to make any of this fit.

### Our Company, on the existing system

Four panels now, one architecture. The new panel is `class="megaPanel" id="companyMegaPanel"`, opened by a `.megaFeature`, with six rows in two labelled `.megaGroup`s, every row on `.megaRow`.

**Zero JavaScript.** `indexJS.js` drives `.navItem.hasMegaMenu` generically, so the hover bridge, keyboard handling, `aria-expanded` toggling, outside-click and Escape all applied to the fourth panel the moment it existed.

**Zero new CSS rules.** The company rows are the same icon-plus-text shape the services rows use, so rather than copying declarations the company classes **joined the existing selector groups** — `.megaServicesList, .megaCompanyList`, `.megaServiceLink, .megaCompanyLink`, and so on down to the reduced-motion block. One declaration, two names: the two panels cannot drift apart, and nothing renders differently. The two-column group grid joined `.megaAreasGroups`, which was already exactly that.

Panel content points at whoever owns the answer, which is the rule the FAQ panel already follows: *About BlueGrid* and the featured card go to the new company page; *Why Choose BlueGrid*, *Our Work*, *How It Works* and *Areas We Serve* go to the homepage sections that already hold that material; *Questions & Answers* goes to the FAQ hub.

Measured against its siblings: **414px** tall against services and areas at 392px and FAQ at 486px, so the family spread stays at 24% against a 45% gate.

### A company page, because the alternative was a table of contents

Six rows pointing at five homepage anchors would have made the menu a homepage index — and would have thrown a visitor reading a service page back to the homepage for every one of them. The site also had **no About page of any kind**, which for an owner-operated local business is a real gap rather than a stylistic one.

`company/index.html` is the 24th page. Built from `faq/index.html` as the donor because it sits at the same depth, so every relative path in the shared chrome is already correct and was carried across **byte for byte** — the assembler asserts that, comparing the chrome outside the head and `<main>` against the donor and refusing to write on any difference. 865 words, and **it needed no new CSS**: `pageHero`, `breadcrumbNav`, `intentSection`, `benefitGrid`, `localServiceList`, `localFactGrid`, `relatedGrid` and `pageFormSection` already covered every section.

Schema is `AboutPage` plus a breadcrumb. **Deliberately no second `LocalBusiness`** — the homepage carries the canonical one, and repeating it here would have two URLs competing to *be* the business rather than one describing it.

**Every factual claim on the page already appears somewhere on the site.** Owner-operated and locally based, fully insured with a certificate before work starts, the New Holland C337 with a Fecon head, estimates within 24 hours, one-to-two-day typical projects, 200+ acres reclaimed, mulch stays on site. Nothing about history, years in business, crew size, certifications or awards was written, and the owner is still not named.

### The process animation is a state machine now, not a loop that pauses

The old sequencer completed, held 2.6s, called `resetBoard()`, and told the whole story again. The requirement is not a slower loop — it is that the steps are told **once** and then stop being animated at all.

```
'idle'  ->  'revealing'  ->  'looping'
```

Those states only move forward. There is no transition back to `'idle'`, which is what makes "Phase A runs once" a property of the machine rather than of its timing. `resetBoard()` is gone entirely, and the assembler guards that it did not survive.

- **Phase A** — the reveal, 6.08s at five steps. The next step is still revealed from *inside* its arrow's dim callback, so a step cannot appear before its arrow has finished.
- **Phase B** — arrows only, 4.04s per pass. It cannot touch a step because it never references one.

**One defect this refactor created and the design caught before it shipped.** `.processArrow.isActive` and `.isResting` carry equal specificity, so an arrow holding both renders as whichever is declared later — `isResting`. Phase A never hit this because it flashed each arrow exactly once, from nothing. Phase B re-flashes arrows that are **already resting**, so every flash after the first would have been invisible. `flashArrow()` now removes `isResting` before adding `isActive` and is the single owner of that exclusivity; both the JS and the CSS say so.

Phase A is deliberately **uninterruptible** once started: it is seven seconds, it happens once, and stopping it half way would mean either losing the steps already up or replaying them. Only the endless phase answers to visibility — Phase B pauses off screen and on a hidden tab, and resumes without disturbing a single step.

### The reported clipping did not reproduce — and the number that explained it was wrong

The handoff located a pressure point: **"MAINTENANCE" at 143px against a 147px step column at 1081px.** Re-measuring reproduced the 143px exactly, and then found the pairing was wrong. "MAINTENANCE" is on `services/brushRemoval.html`, a **four**-step board, whose column at 1081px is **197px**, not 147px. It has 54px of clearance. The widest word on the five-step homepage board is "COMPLETE" at 104px against 147px.

Checked properly — every rendered title on all eight boards, uppercased as `text-transform` actually renders them, against its own board's column, at every width from 1081px to 1440px, with a 6% fallback-face inflation — **nothing overflows anywhere.** (My first pass measured the markup text rather than the uppercase render and understated every title; that is how a defect like this hides.)

The box model agrees: `.processStep` is `flex: 1 1 0` with `min-width: 0`, `box-sizing: border-box` is global, and there is no `100vw` anywhere in the process chain. **The board provably cannot overflow its container at any width in the band.**

So the fix is not a patch for a mechanism I cannot find. It is that **the horizontal row should never run compressed in the first place.** The board is `max-width: 1120px` inside `.sectionInner`'s 1.5rem padding, so **1120 + 48 = 1168px** is the narrowest viewport at which it can render at the width it was designed for. Below that it was being squeezed — 147px columns against a design value of 164px — and a squeezed five-across row is what browser QA was looking at.

The handover moved from 1080px to **1167px**, and out of the shared 1080px query into its own, because 1080px also drives the hero, the services grid and several section layouts that had no reason to move with it. The vertical layout itself is unchanged. `.processStepTitle` also gained `overflow-wrap: break-word` — a guard for the next title someone writes, not a fix for a current overflow, and recorded as such.

### Line endings: the documented split was stale

`projectState.md` said `index.html`, `js/indexJS.js` and `css/styleIndex.css` were CRLF while `faq/*`, `locations/*`, `insights/*` and `css/stylePages.css` were LF, and that scripted edits must detect per file.

Audited: **all 26 source files are CRLF in the working tree and LF in the index.** `core.autocrlf` is `true`, so Git normalises on commit and converts on checkout — there is no mixture to preserve. The detect-and-restore habit stays in every script here because it is free and correct, but the table was describing something that is not true.

### Two defects in my own tooling

- **The chrome-comparison guard read `data-confighref="phoneHref"` as a link.** An unanchored `href="..."` match caught the tail of the config attribute and reported nine broken links to files named `phoneHref` and `facebookUrl`. Anchored on whitespace.
- **A CSS anchor matched twice.** `.megaServiceIcon\n{` appears both as its own rule and as the tail of `.megaServiceLink:focus-visible .megaServiceIcon\n{`. The guard refused to write rather than editing the wrong one.

### Files touched

- `js/indexJS.js` — the whole `PROCESS SEQUENCE` section rewritten: `processSequenceConfig`, `initializeProcessSequences()`, `setupProcessBoard()`
- `css/styleIndex.css` — header breakpoints 1280→1360 and 1150→1200; a new 1167px process query with the vertical rules moved out of the 1080px query; company classes joined seven services selector groups; `overflow-wrap` on the step title; the arrow-state exclusivity note
- **24 HTML pages** — the Our Company nav item and panel, the mobile drawer link, and the footer Quick Links entry, by one guarded assembler
- `company/index.html` — new
- `docs/` — all three

### Validation

Nine suites, all green: `validateSite` (24 pages, 2,696 links), `validateNav`, `validateHeader`, `validateHero`, `validateLeadFlow`, `validateMegaMenus`, `validateProcessSequence`, `heroLoopHarness` (91 cycles), the Apps Script harness (64/64), plus `node --check` and CSS brace balance.

`validateProcessSequence` was rebuilt against the two-phase model and is **stricter than what it replaced**: the old suite proved a loop closed, the new one proves the loop cannot reach the steps. Over two minutes of virtual time with the board entering and leaving the viewport repeatedly it asserts five reveals and no repeats, **zero un-reveals ever**, zero step events after the reveal, 23 arrow passes in order, and arrows-only on both pause and resume. The VM harness underneath was kept verbatim.

`validateHeader` gained a **fallback-face sweep** — the criterion the new breakpoint was chosen on now has a test — and `measureHeader` now **reads the primary nav out of `index.html`** instead of carrying its own copy, which is what let the model describe a four-item bar while the site shipped five.

### Left for a browser

The Our Company panel next to its three siblings, and the shield-with-a-check featured icon, which was drawn blind like the pin and the question mark before it. The company page top to bottom. And the process section at 1168px and just below it, where the horizontal row now hands over to the vertical one — that boundary is the thing this session changed and cannot see.

---

## 2026-08-07 — MERGE TO MAIN, PUSH, REPOSITORY HOUSEKEEPING, SESSION CLOSEOUT

### Merge

`phase2a-lead-capture` → `main`. Verified before touching anything: `main` was an exact ancestor of the feature branch, so the merge was a **fast-forward** and no conflict was possible. `main` was already identical to `origin/main` (0 ahead / 0 behind), so nothing needed pulling and no history was rewritten. The feature branch was 8 ahead of its own remote and 0 behind — the amends made earlier in the session were all on unpushed commits, so no published history had been rewritten either.

`git merge --ff-only` was used deliberately: it refuses to do anything except a fast-forward, so it cannot silently produce a merge commit or a conflict.

```
8108f94..bc4021d   17 commits   42 files   52,050 insertions   0 deletions
```

The only rename is the Phase 2C `hero_after.JPG → after.JPG` casing fix. Confirmed with `--diff-filter=D` that the merge deleted nothing.

Full validation re-run **on `main` after the merge** — 12/12 — before pushing. Then `main → origin/main` only; no feature branches, no force, and `phase2a-lead-capture` was not deleted.

### The remote has moved

The push succeeded but GitHub answered:

```
remote: This repository moved. Please use the new location:
remote:   https://github.com/ArxnAlley/client_BluegridLandSolutions.git
```

`origin` still points at the old URL and pushes work **via redirect only** — which stops working if anyone ever creates a new repository under the old name. Updating it was requested, then superseded by the housekeeping task before it ran. Still outstanding; recorded under *Waiting on Aron*.

### Repository housekeeping — the GBP asset decision

Two related decisions, both the owner's:

**`graphics/images/GBP_ForestryMulchingService.png` deleted.** Verified it had genuinely been tracked (`git ls-files --error-unmatch`), and found it entered the repository in `235a4a3` — swept in by a broad `git add -A` in the mega-menu commit rather than added deliberately. That is worth recording as a lesson: `add -A` put 2.6MB into the repository for a file the site never loaded. Verified zero references to it across the whole working tree and at `HEAD` before staging the deletion.

**`graphics/GBP - Services/` is intentionally local and now ignored.** It holds Google Business Profile marketing collateral, not website assets. Added the repository's **first** `.gitignore` — a no-build static site has no dependency or artifact directories to exclude, so the file carries exactly one rule and a comment explaining why. Deliberately no speculative boilerplate (`node_modules`, `dist`, …): nothing here produces any of it.

Verified after: `git check-ignore` traces the file to `.gitignore:18`, `git ls-files` returns nothing for the folder, and the folder and its contents are untouched on disk.

Commit `9237e53`, pushed.

### Closeout

All three project docs rewritten against the repository rather than carried forward. `projectState.md` in particular had gone stale in a way that would have actively misled a cold session — it still read *"Branch: phase2a-lead-capture — not merged, nothing pushed"* after the merge and push had happened.

Two pieces of next-session work were specified and recorded as **planned, not implemented**: an *Our Company* mega menu, and a two-phase refactor of the process animation. Both were measured or located at closeout so the next session starts with numbers rather than a survey:

- **Header capacity for a fifth nav item.** Measured from the real font metrics: `Our Company` adds **149px** (156px with its gap). The compact header goes 988px → **1131px**. At the current 1150px switch that leaves **+20px** — it fits, but the breakpoint was tuned to hold ~45px so the wider `'Segoe UI'` fallback could not wrap the bar before Inter loads. Recorded the expectation that the switch will need to move to roughly 1200px.
- **Process clipping report.** Located the suspect band (**1081–1280px**, where the horizontal layout applies) and the mechanism (`html { overflow-x: hidden }` clips rather than scrolls, which matches "disappears offscreen" instead of producing a scrollbar). Measured the pressure point: the longest unbreakable uppercase title word is **"MAINTENANCE" at 143px** against a **147px** text column at 1081px — 4px of clearance, with a wider fallback face behind it.

  **Recorded honestly that the arithmetic does not reproduce the reported defect.** By calculation the board fits at every width in the band, so the model is missing something real. The handoff says to reproduce it in a browser before changing layout, rather than letting the next session act on either my numbers or the report alone.

---

## 2026-08-07 — MEGA MENU DESIGN SYSTEM: SERVICE AREAS + FAQ

### Brief

The redesigned Services panel is the benchmark. Bring Service Areas and FAQ onto the same shell and design language without making the three identical — each keeps an internal architecture suited to its content.

### What was actually shared before, and what wasn't

Studying the three panels first was the point of the brief, and it paid: the shell was **almost** shared already, and the exceptions were the whole problem.

| | Services | Service Areas | FAQ |
|---|---|---|---|
| Width | 760px | `min-width: 420px` only | 760px |
| Top-edge highlight | yes | no | no |
| Featured panel | yes | none | none |
| Row treatment | `.megaServiceLink` + accent rule | bare `a` in a list | `.megaFaqLink`, no accent |
| CTA | inside the feature | none | separate footer |
| Heading | `.megaGroupHeading`, muted | `.megaAreasHeading`, sky display face | `.megaPanelHeading`, sky |

Three panels, three heading treatments, three row treatments, two CTA patterns, and Service Areas at roughly half the width of its siblings. That is what "separate/older components" was describing.

### The system

Extracted, each declared once and asserted to be declared once:

- **`.megaPanel`** now carries the width, padding, radius, surface, border, shadow **and** the top-edge highlight. The per-panel `.megaPanelServices` / `.megaPanelFaq` / `.megaPanelAreas` modifiers are retired — the panels are `class="megaPanel"` with unique `id`s, which is what `aria-controls` already used.
- **`.megaFeature`** — the featured card, unchanged from Services, now opening all three panels. Icon, eyebrow, display-face title, supporting line, cue with a sliding arrow. Zero new CSS; the Areas and FAQ cards are the same component with different content.
- **`.megaBody`** — the region under the feature: the divider and the rhythm, once.
- **`.megaRow`** — the row primitive. Padding, radius, hover tint, and the sky rule that grows down the leading edge. A service row adds an icon column; a town row adds a colour; an FAQ row adds question/answer type. The accent rule was previously Services-only, so hovering a town or a question now behaves like hovering a service.
- **`.megaGroup`** / **`.megaGroupHeading`** / **`.megaGroupIcon`** — one labelled-group treatment. Areas headings dropped the sky display face for the shared muted label.

Nine `--mega*` tokens from the previous session already carried surface, shadow, edge, rule, radius, tint, label and copy colours; nothing new was needed.

### Positioning: the panels stopped moving

The brief listed "inconsistent horizontal positioning" and "menus jumping around unnecessarily" as things to avoid. Panels were absolutely positioned against `.navItem`, so each opened centred on its own toggle and moving along the nav slid a different rectangle into place each time.

`position: relative` moved from `.navItem` to `.primaryNav`. All three panels now resolve against the nav and land on **exactly the same rectangle** — moving between Services, Service Areas and FAQ swaps the contents of one panel rather than shuffling three.

It also bought a lot of clearance. Centred per item, the Services panel sat **62px** from the left edge at 1151px; centred on the nav it sits at **214px**, and the worst margin at any tested width is 177px.

`.navItem` keeps its hover/open behaviour and stays the panel's DOM parent, which is all `indexJS.js` needs — it only ever queries `.navItem.hasMegaMenu`.

### A hover defect found on the way

The 14px gap between toggle and panel is not over the nav item, so crossing it fired `mouseleave` and closed the menu before the pointer arrived — the panel then reopened on `mouseenter`, a flicker on every single use. Pre-existing, and invisible in the source. Fixed with a transparent `::before` band on `.megaPanel` that bridges the gap and belongs to the item; it inherits `visibility: hidden` so it only exists while the panel is open.

### Service Areas

Featured card: *Where We Work* / **Southern Ohio & Eastern Kentucky**, with copy adapted from the site's own answer to "What areas do you serve?" rather than the generic line in the brief, and a **View All Service Areas** cue pointing at the existing `#serviceAreas` block.

Below it, two regions side by side. Each region's towns flow down a **two-column multi-column list** rather than a single-column stack: seven and six towns become four rows instead of seven, which is what keeps this panel the same height as Services. Multi-column rather than grid on purpose — columns balance an odd count themselves while still reading top-to-bottom, which a row-flowed grid does not.

A pin sits on each **region heading**, not on all thirteen towns. All 13 links preserved exactly.

### FAQ

Featured card: *Common Questions* / **Questions We Get Every Week** — the panel's own former heading, promoted, rather than the brief's suggested line — and **View All FAQs**. The separate footer CTA is gone, which is where a chunk of the height went.

Nine previews became **six**, the highest purchase-intent questions, exactly as listed in the brief. The three dropped ("Do you haul the debris away?", "What do you need from me first?", "What areas do you serve?") are informational rather than decision-making and all remain on the FAQ page.

Answers were cut to **one sentence** — the real opening sentence of the real answer, not a rewrite. With two-sentence previews the panel measured **34% taller** than the other two; the brief asked that FAQ not be dramatically taller than everything else, and this is where that height was.

### Measured balance

Heights are estimated from the real font metrics and the shipped CSS values:

```
  services   392px
  areas      392px
  faq        486px      spread 24%   (gate 45%)
```

Services and Areas land on the same height by construction. FAQ carries more words per row and stays 24% taller, which the brief allows explicitly — "they do not need mathematically identical dimensions if their content requires otherwise".

### Path handling simplified

The Services panel had been the site's one exception to the two-variant path rule, linking to bare siblings from inside `services/` while the FAQ panel on the same pages used `../services/…`. Both resolve to the same file; only one is worth remembering. The exception is retired — every panel now uses root-canonical hrefs rewritten with `../` for one-level pages, and `projectState.md`'s architecture note is back to two variants.

The rebuild's guard compares **resolved targets** rather than href strings, so re-spelling a path is allowed while inventing a destination is not. That is stricter than the string comparison it replaced: it would catch a typo that still looked plausible.

### Three defects in my own tooling

- **`validateNav` located the FAQ panel by the retired modifier class** and asserted 8–10 questions. Model and assertions updated to six; the genuinely useful check it feeds — that every `faq/index.html#anchor` the menu points at exists — was kept.
- **The class-coverage check matched by substring**, so `.megaGroup` passed on the strength of `.megaGroups` — exactly the typo the check exists to catch. Now word-boundary matched.
- **The "declared once" check was line-ending blind.** It matched a selector followed by `\n` against a CRLF stylesheet and found zero of everything, reporting all four shared rules as missing.

### Files touched

- `css/styleIndex.css` — shared shell, `.megaBody`, `.megaRow`, `.megaGroup`, `.megaGroupIcon`, Areas rebuilt, FAQ trimmed, positioning moved, reduced-motion coverage for the whole mega system
- **23 HTML pages** — all three panels, rebuilt by one guarded assembler
- `docs/` — all three

### Validation

New `validateMegaMenus` replaces `validateServicesMega` and covers the family: shared shell on all three, featured architecture complete, every row built on `.megaRow`, links resolving to real files with the right relative form for each page depth, no duplicate ids, toggles still wired via `aria-controls` and shipping collapsed, decorative SVGs out of the accessibility tree, retired classes gone from both stylesheet and markup, on-screen fit 1151–1600px, and the height spread gated at 45%.

All seven other suites pass, plus `node --check` and CSS brace balance.

### Left for a browser

The look. Panel proportions against each other, the two new featured icons (a pin and a question mark, both filled and both drawn blind), whether the muted region headings read as deliberate rather than washed out, and the hover-bridge fix.

---

## 2026-08-07 — PROCESS SECTION: SEQUENTIAL STEP REVEAL

### Brief

Turn the "how it works" process block into a sequence that walks the visitor through it — step reveals, arrow flashes, arrow dims, next step — looping while on screen. One reusable architecture across every page that has a process block, not seven copies.

### The brief described a section that did not exist

The request described the change as animation-only, on top of an established visual: a centred free-floating dark rectangle, arrowheads between steps, no connecting lines, CTA below. **None of that was in the repository.** What shipped was a white section with a horizontal gradient rule (`.processTrack`), numbered discs, and no arrowheads or container. Nothing in git had the described version — no branch, no stash, no commit — and no other client site under `ClientSites/` matched either.

So this entry covers both: the visual the brief assumed, and the sequencing it asked for.

### Two facts that shaped the architecture

**Step counts differ.** The homepage runs five steps; all seven service pages run four. The brief was written for five. Nothing in the CSS or the JS assumes a count — arrows are simply however many sit between the steps, and the validator exercises both a five-step and a four-step board.

**The old grid was hardcoded to five columns** (`repeat(5, 1fr)`) while seven of the eight pages had four steps, so those pages had been rendering with an empty fifth column. Replaced with flex, which also removes the need for a template that would have had to change per page.

### Layout

A `.processBoard` — dark gradient rectangle, `max-width: 1120px`, centred, floating on the white section, with the heading above it and the CTA below. Step type inverted for the dark surface. `.processSteps` became flex: steps `flex: 1 1 0`, arrows `flex: 0 0 auto`, interleaved in DOM order so reading order and animation order are the same list.

Arrows are chevrons only — no shaft, no connecting rule — nudged down `1.05rem` so they sit on the centre line of the numbered discs rather than floating above the copy.

### Responsive

Vertical from 1080px down, with the arrows rotated to point at the next step.

The old design switched to a **two-up grid** at that width, which cannot work with directional arrows: the arrow ending a row points right, into the edge of the board, rather than at the step that follows. The breakpoint itself did not move — 1080px is where this design already gave up on the horizontal row — only what it switches to.

The rotation is a custom property, `--processArrowTurn`, composed into every state's transform rather than restated per state. That was not tidiness: the reduced-motion block sits *later* in the stylesheet than the 1080px block, so a bare `transform: none` there would have straightened every arrow in the vertical layout. One token, and the reset cannot reach it.

### Sequencing

`initializeProcessSequences()` drives any element carrying `data-processsequence`. Per board: read the steps and arrows once, then a small state machine with a single pending timer.

The arrow is movement *into* the next step, so the next step is revealed from **inside** the arrow's dim callback rather than alongside it. It is structurally impossible for a step to appear before its preceding arrow has finished.

```
  step reveal        480ms
  pause after step   380ms
  arrow flash        420ms
  arrow dim          240ms
  completed hold    2600ms
  reset fade + gap   640ms
                          -> 10.18s per cycle at five steps, 8.7s at four
```

`setTimeout` here, deliberately, where the hero typing needed `requestAnimationFrame`. The distinction is what the timer is for: the hero committed a DOM write that had to land inside a specific frame, twelve times a second. This schedules roughly a dozen class toggles per ten-second cycle and lets CSS animate between them. Sub-frame precision would buy nothing.

### Viewport behaviour

`IntersectionObserver` with **asymmetric** enter and exit conditions. Entering needs a meaningful arrival — 40% ratio, or the board's top past the middle of the screen. Leaving needs the board to go completely off screen.

A single predicate for both would put start and stop on the same boundary, and a visitor parked there would restart the story on every scroll tremor. The positional fallback exists because a board taller than the viewport — the vertical mobile layout — can never reach a 40% ratio at all; the extra thresholds give that check callbacks to run in as a tall board scrolls up.

Leaving resets and clears the timer; returning replays from step one, because half a story is worse than none. A hidden tab pauses the same way — timers would otherwise spend the sequence where nobody is watching.

### Performance

The only DOM work is a class toggle on one element per beat. Nothing is created, removed, measured, or re-written; every property those classes touch is `opacity`, `transform`, or `filter`. Steps and arrows hold their space from the first paint — this is an opacity reveal, never `display`, so the board cannot resize as the story plays.

The hero typing profile was re-run afterwards and is unchanged to three decimal places: 10.015ms cadence jitter, 80.625ms mean, 0 characters swallowed, 0ms write-to-paint.

### Two defects found and fixed mid-implementation

- **Both assemblers were double-indenting.** They sliced from the opening tag, which left that line's existing indentation in the file and then added their own on top, so every generated block opened 16–20 spaces deeper than its own children. Present in the services mega panel committed the day before, too. Fixed in both by consuming the line's indentation as part of the replaced range, and the mega panel was regenerated.
- **The validator's own CSS block bound was wrong.** It sliced from the section banner to `indexOf('PARALLAX')` — a marker that exists in the JavaScript, not the stylesheet. `indexOf` returned −1, `slice(start, -1)` ran to end of file, and the check reported a `display:none` and a `height` transition it had no business looking at. Now bounded by the next banner, with an assertion on the block's own length.

### Files touched

- `js/indexJS.js` — `processSequenceConfig`, `initializeProcessSequences()`, `setupProcessBoard()`
- `css/styleIndex.css` — `.processBoard`, flex `.processSteps`, `.processArrow` and its three states, `.processCta`, inverted step type, the vertical layout, reduced-motion finished state; removed `.processTrack` and the orphaned `drawLine` primitive that existed only to animate it
- **8 HTML pages** — `index.html` and all 7 service pages, rebuilt by a guarded assembler that carries step content across untouched

### Validation

New `validateProcessSequence` runs the real `indexJS.js` in a VM with a virtual clock, drives the observer by hand, and asserts against a recording of every class change: 13 beats in exact order, never more than one arrow bright, no step hidden mid-cycle, reset clearing the board in one tick, the loop restarting, zero class changes while off screen or with the tab hidden, and reduced motion registering no observer and no timers at all. The four-step board is checked separately.

All eight prior suites still pass.

### Left for a browser

Everything about how it *looks*: the dark board on the white section, the flash brightness, whether 10.18s reads as deliberate or slow, and the vertical layout below 1080px.

---

## 2026-08-06 — LAUNCH POLISH: SERVICES MEGA MENU, HERO TYPING PERFORMANCE

### Brief

Two tasks, explicitly not feature work. Redesign the **visual presentation only** of the services mega menu — keeping every link, destination and behaviour — toward something more premium, with better hierarchy, whitespace, alignment, balance, grouping and a stronger visual entry point; consistent with the BlueGrid system, taking the Austin Ervin panel as inspiration rather than a template. Then **profile** the hero typing animation, find the actual bottleneck rather than guessing at one, fix it, re-measure, and stop when further work stops paying.

---

### Part 1 — Services mega menu

#### The problem with the old panel

Seven services in a two-column grid. Seven is odd, so the last row was always a hole — that lopsidedness is what reads as unfinished. There was no heading, no hierarchy between the flagship service and the rest, and no reason for the eye to land anywhere in particular.

#### What was built

A **featured band** across the top carrying Forestry Mulching: a 52px sky-tinted icon tile, a "Start Here" eyebrow, the title in the display face rather than the body face, one line of promise, and a "See how it works" cue whose arrow slides 4px on hover. It is the only *filled* surface in any mega panel on the site, so it wins the eye without needing to be loud.

Below a hairline, the remaining six sit in **three equal labelled groups of two**:

| Group | Services |
|---|---|
| Clearing & Site Prep | Land Clearing, Brush Removal |
| Access & Habitat | Trail Cutting, Hunting Property Prep |
| Cleanup & Recovery | Property Cleanup, Storm Cleanup |

Three-by-two has no hole, the columns are the same height by construction, and each label is honest about what its pair has in common. An earlier 3/2/1 split (*Clearing & Site Prep* / *Access & Habitat* / *Storm Response*) was discarded: it balanced on paper only because the extra heading in the second column happened to make up the height, and "Storm Response" as a group of one is a label pretending to be a category.

#### Why the panel is 760px and still centred

The instinct was to left-anchor a wide panel to its toggle, on the assumption that the nav sits next to the brand lockup. It does not: `.brandLockup` carries `margin-right: auto`, which pushes the nav and the actions to the **right** of the bar. So the Services toggle is much further right than it looks in the markup, and the existing centred positioning has more room than expected — no override was needed at all, which also keeps this panel positioned exactly like the other two.

760px matches the FAQ panel deliberately, so the site's two large panels are the same object at the same size.

Fit was measured rather than eyeballed, reusing the TrueType parser built for the header audit:

```
   1600px   panel  329 -> 1089    margins  329 /  511   ok
   1440px   panel  249 -> 1009    margins  249 /  431   ok
   1280px   panel  191 ->  951    margins  191 /  329   ok
   1151px   panel   62 ->  822    margins   62 /  329   ok
```

1151px is the narrowest viewport the desktop nav survives to, and the panel still clears the left edge by 62px. Inside the panel the tightest group title, *Hunting Property Prep*, needs 155px against 172px of column — 16px of slack, enough to absorb the wider Segoe UI fallback if Inter has not loaded.

#### Tokenized, because the brief said "design language"

Nine `--mega*` properties in `:root` now carry the panel surface, shadow, top edge, rule, row radius, hover tint, label colour and copy colour. **Every value is the one the panels already shipped with**, and the FAQ panel was repointed at them — so it renders identically while sharing the vocabulary, and a panel added for a future section inherits the surface for free. This is the part that makes the pattern portable to the next Nulo Studio site; the featured-band structure is the part that makes it BlueGrid's.

#### The guard earned its keep

The rebuild script refused to write anything on its first run:

```
services\forestryMulching.html: link set differs —
  missing [services/forestryMulching.html, ...]
  extra   [forestryMulching.html, ...]
```

Pages inside `services/` link to their siblings **bare** — `forestryMulching.html` — not `../services/forestryMulching.html`. So service links have **three** path forms, not the two the rest of the chrome uses. The two-variant rule in `projectState.md` was not wrong, it was just not the whole rule, and it has now been corrected there. Had the script trusted it, seven links on seven pages would have shipped broken.

---

### Part 2 — Hero typing performance

#### Method

No browser is available on this project, so the animation was profiled by running the **real shipped `indexJS.js`** in a VM against a virtual clock that models the browser's rendering lifecycle rather than just its timers: callbacks fire when scheduled, but a DOM change only becomes visible at a vsync tick. Both builds were driven from the same seeded random stream, so the comparison measures the change and not luck. Two scenarios: an idle main thread (assumption-free) and a contended one (a declared model, used only to check that the fix degrades better).

#### Finding 1 — the schedule asked for cadences the screen cannot show

`typeHeroPhrase()` scheduled one `setTimeout` per character, each writing straight into `.textContent`. Measured over three simulated minutes at 60Hz:

```
                  count     mean    stdev      min      max   spread
  scheduled         399     82.2      9.5     68.0    111.5     43.5
  rendered          400     82.1     11.8     66.7    116.7     50.0

  jitter added by the render step   +2.29ms stdev  (24%)
```

The design asks for restrained variation; the visitor gets a quarter more than that, because a timer fires at an arbitrary point inside a frame and the character waits out the rest of it — **8.5ms on average, 16.7ms at worst**. Under load two timers can land in one frame and the second write erases the first before it is ever painted.

#### Finding 2 — the layer is torn down mid-phrase

`.heroHeadline` gets `will-change: opacity, transform` from `html.jsEnabled [data-heroanimate]`, and `indexJS.js:757-768` **removes that attribute at t=2200ms**. Typing starts around t=900ms, so the de-promotion lands at roughly the **sixteenth character of the first phrase**. From that moment the typed line paints into the same layer as the hero photograph and the overlay gradient:

```
  invalid rect per character   926 x 125 px   (glyphs + the 24px text-shadow)
  tiles re-rastered                     10
  pixels redrawn per character        655k
  photo pixels resampled              655k    -> 8.0 megapixels/second
```

Every keystroke was resampling the photograph, for a change that only ever touches the glyphs.

#### What shipped

1. **Commits happen inside `requestAnimationFrame`.** Write-to-paint goes to zero, and one frame can only serve one commit, so a swallowed character is structurally impossible rather than merely unlikely.
2. **Deadlines chain from the frame that served the previous commit**, so exactly one rounding sits between any two characters and none of it accumulates.
3. **A cached `Text` node**, mutated via `nodeValue`, replaces re-assigning `.textContent` — 873 node teardowns in three minutes became 18.
4. **Strings are pre-computed** outside the frame callback, so nothing allocates inside it.
5. **`.heroTypedLine` holds its own compositing layer** for the life of the loop, zeroed under `prefers-reduced-motion` where nothing types.

```
                                   before     after
  jitter added by the render step    +24%        0%
  write -> paint                    8.5ms       0ms
  text nodes rebuilt (3 min)          873        18
  setTimeout allocated (3 min)        939       139
  characters swallowed                  0         0
```

Scheduled and rendered cadence are now **identical** — the schedule only asks for things the screen can actually show. Mean interval moved 82.1ms → 80.6ms, i.e. onto the 80ms the config always specified. `heroDuetConfig` was not edited.

#### Two wrong turns, both caught by measuring

- **An off-by-one in the frame counter** ran every interval one frame long: mean 82ms → **97ms**, an 18% slowdown that would have read as sluggish. The profile caught it immediately; no amount of reading the code would have.
- **A pure deadline chain** — chaining from the abstract deadline rather than from the serving frame — measured **11.95ms stdev against the baseline's 11.78ms**, i.e. no better than the timers it replaced. Two independent roundings, one at each end of every interval. Predicting it would help was wrong, and the measurement said so.

#### Why frames are not counted

Counting frames is the obvious way to express "wait five frames", and it measured very slightly smoother at 60Hz (10.0ms stdev against 10.1ms). It was rejected and the rejection verified:

```
  120Hz   frame-counted   mean 40.5ms      <- double speed
  120Hz   shipped         mean 81.8ms
```

A tenth of a millisecond is not worth an animation that runs at double speed on the panels in most current laptops and phones.

#### What was deliberately left alone

The `text-shadow: 0 3px 24px` on the typed line is the remaining per-character cost — a 24px blur over ~115k pixels of 73.6px display type, every keystroke. It is irreducible without changing how the hero looks, and the brief said not to. Logged as debt rather than quietly softened.

---

### Files touched

- `js/indexJS.js` — `heroTimingIsHeld()`, `writeHeroTypedText()`, `runHeroTypedSequence()`, rewritten `typeHeroPhrase()` / `deleteHeroPhrase()` as step builders
- `css/styleIndex.css` — nine `--mega*` tokens, the services panel and its featured band, group headings, restyled rows, `will-change` on `.heroTypedLine` and its reduced-motion opt-out
- All **23 HTML pages** — services mega panel markup, rebuilt by a guarded assembler
- `docs/projectState.md`, `docs/engineeringJournal.md`, `docs/technicalDebt.md`

### Validation

`validateSite`, `validateNav`, `validateHeader`, `validateHero`, `validateLeadFlow`, `heroLoopHarness` (91 cycles alternating, 6.16–7.01s), the Apps Script harness (**64/64**), `node --check`, and a new `validateServicesMega` covering all 23 pages — structure, links resolving to files that exist on disk, styling coverage in **both** directions (no unstyled class, no dead `.mega*` rule), decorative SVGs kept out of the accessibility tree, and on-screen fit from 1151px to 1600px. All pass.

---

## 2026-08-04 — SESSION SUMMARY (2026-08-02 → 2026-08-04)

> Session-level compaction. Each phase below has a detailed entry further down this file — this is the fast path for a session resuming cold.

### Summary

One continuous session covering six pieces of work: **Phase 2B** (first-wave service area pages), **Phase 2C** (hero mobile refinement), **Phase 2D** (connecting the live Apps Script backend), a **header navigation polish** and its **tokenization follow-up**, and a **navigation restructure with two new content sections**.

The site went from **8 pages with a form that silently discarded every submission** to **23 pages with live lead capture**, a location tier, an FAQ hub, and a resource centre.

### Files Created

**Location pages (6)** — `locations/forestry-mulching-{ashland-ky, portsmouth-oh, ironton-oh, chillicothe-oh, grayson-ky, morehead-ky}.html`

**FAQ hub (1)** — `faq/index.html`

**Insights (8)** — `insights/index.html` plus `benefits-of-forestry-mulching`, `brush-hogging-vs-forestry-mulching`, `when-to-clear-overgrown-property`, `preparing-land-for-building`, `storm-cleanup-best-practices`, `fence-line-clearing-tips`, `signs-your-property-needs-land-management`

### Files Modified

- `index.html` — service-area link wiring, town-by-town block, Rowan County in schema/map/FAQ, nav restructure, `hero_after` casing
- `services/*.html` (7) — service-area link wiring, nav restructure; `forestryMulching.html` additionally gained the "Where We Work" block
- `locations/*.html` (6) — nav restructure (after being created earlier in the session)
- `js/indexJS.js` — `rowan` service region; hero dissolve made awaitable + forward-sweep `error` fallback; production `/exec` endpoint; double-submit guard and stable `leadId`
- `css/styleIndex.css` — hero media decoupling, estimate band, overlay fade; header anti-wrap guards, compact band, 1150px switch, twelve `:root` tokens, unified `--headerTransition`; `.megaPanelFaq` and contents; `.serviceAreaTowns*`
- `css/stylePages.css` — location-page components (`.localSection`, `.localProse`, `.localProblemGrid`, `.nearbyList`), FAQ page components, Insights components
- `graphics/images/hero_after.JPG` → `hero_after.jpg` (git rename)
- All three `docs/` files

### Architecture Decisions

1. **Six location pages, not thirteen.** `seoPlan.md` rows 1–6 with genuinely local content over 13 doorway pages. The 7 cities without pages still point at the `#serviceAreas` anchor.
2. **Location pages link up, never sideways** — parent service page, homepage, all 7 services. Nearby towns are plain text, which is why `.nearbyList` styles `li` not `a`. Sitewide chrome *does* link to them; `seoPlan.md` rule 4 blesses that explicitly.
3. **Hero media decoupled from section height** rather than shrunk. An `inset: 0` layer is coupled to its container's content; every fix that is not decoupling is a workaround.
4. **The hero fade lives on `.heroOverlay`, not `.heroPlate`** — a bottom `mask-image` on the plates would overwrite `.heroPlateAfter`'s mask, which *is* the sweep animation.
5. **One endpoint, one call site.** Already true; this session verified it rather than assuming, and added checks so it stays true.
6. **`leadId` is stable for the page load** so the server's dedupe can collapse a retry into the original row.
7. **Header compact band starts at 1280px, above the 1207px wrap point**, so crossing it makes the bar roomier rather than snapping tighter.
8. **The mobile-nav switch is a header-only media query** — the existing 1080px query also drives the hero and services grid, and retargeting it would have been a redesign of sections nobody asked about.
9. **Header dimensions are `:root` tokens** with a single `--headerTransition`; reduced motion zeroes the whole morph in one declaration.
10. **New pages live one level deep** (`faq/index.html`, `insights/*`) so they reuse the proven one-level chrome instead of needing a third path variant.
11. **The FAQ hub carries only new questions.** The site had 75; `seoPlan.md` bans duplicates; the hub took the 28 that were left.
12. **The FAQ mega menu links to whoever owns the answer** — several items point at service pages rather than the FAQ page.
13. **Generators stay in the scratchpad.** Phase 13 owns the real one; shipping a half-generator would create two competing sources of truth.

### Validation Performed

- **23 pages, 2,407 internal links and assets, zero broken.** Every same-page and cross-page anchor resolves.
- Location-page uniqueness: worst pairwise 5-word-phrase overlap **14.7%** (gate 25%), 1,133–1,283 body words.
- Insights uniqueness: worst pairwise overlap **0.3%**, 550–900 body words.
- **Zero duplicate FAQ questions introduced** — the hub's 28 cross-referenced against every question elsewhere on the site. The check also surfaced one *pre-existing* duplicate between `index.html` and `services/landClearing.html` (technicalDebt item 10a).
- Nav order parsed from rendered markup on all 23 pages; mega-menu structure, `aria-expanded`/`aria-controls` wiring, and preview length checked per page; mobile drawer confirmed to carry exactly two items and no mega markup.
- Header: **every integer width 900–1600px** re-measured against the real Inter/Rokkitt metrics — zero wrapping, tightest desktop 1151px.
- Hero seam geometry exact (0px error) with 24px card overlap at 360×640, 390×844, 430×932, 768×1024, 1024×1366.
- Titles and meta descriptions unique sitewide; every JSON-LD block parses; every schema FAQ question verified to render.

### Tests Executed

| Harness | Result |
|---|---|
| `appsScript/localTestRunner.js` | **64/64**, `runSelfTest` 6/6 |
| Hero duet loop simulation (10 min page time) | **92/92 alternating**, 6.13–6.94s cadence — *and fails on the pre-fix code, 90 of 108 reveals clipped* |
| Sitewide link/structure validator | 23 pages, 2,407 references, 0 broken |
| Navigation & new-page validator | PASS |
| Header width sweep 900–1600px | PASS |
| Hero layout validator (5 viewports) | PASS |
| Lead-flow contract validator | PASS |
| Live endpoint probes (`ping`, unknown action, unauthorized, honeypot POST) | All correct, zero side effects |
| `node --check js/indexJS.js` | clean |

### Bugs Found

**Pre-existing, fixed**
1. Hero before/after loop desynced — stale cleanup timer stripped the next cycle's `isRevealed`.
2. `fireHeroForwardSweepAndWait()` could hang forever if the AFTER plate failed to load.
3. `hero_after` filename casing mismatch between disk and git — a 404 waiting on case-sensitive hosting.
4. Desktop header wrapped across a 126px band (1081–1207px).
5. **No double-submit guard on the estimate form** — harmless while the endpoint was empty, a data-integrity defect the moment it went live.
6. Rowan County absent from all four places the site lists counties, while Morehead was advertised in the nav.

**Pre-existing, found and logged (not fixed)**
7. Current service is not highlighted in the mega menu, contrary to `servicePageArchitecture.md`.
8. Orphan asset `graphics/images/after.JPG`, referenced nowhere.

**Mine, caught by guards before shipping**
9. Generated location pages had mixed line endings (CRLF from template literals, LF from spliced chrome).
10. Chrome splice left seven mega-menu service links resolving inside `insights/` — the location builder had a repointing step the new builder initially lacked.
11. Two unescaped ampersands (category labels, one `og:title`).
12. One Insights article under the thin-content word floor.
13. `.nearbyList` top margin stacked with the lede's bottom margin.

**In validators, not the product** — a harness that started two concurrent hero loops; a mega-panel slice that stopped at the first `</li>`; an article-uniqueness check measuring shared boilerplate; a "no dates" check matching its own explanatory comment; an enum comparison tripping on line endings.

### Bugs Fixed

All of 1–6 and 9–13. Items 7 and 8 are logged in `technicalDebt.md` (18 and 15b).

### Performance Improvements

- Header spacing tightened by **101px**, and the nav restructure removed a further **127px** — the header now needs 1080px of viewport where it once needed 1207px.
- No regressions introduced: no new external hotlinks, no new render-blocking resources, no new fonts. Insights images reuse existing repo assets.
- **Not done:** the Lighthouse pass. Hero images remain `2048×1536` with no `srcset`, and Google Fonts still loads render-blocking.

### UX Improvements

- Mobile hero no longer runs hundreds of pixels past the fold; the estimate card sits on its own band with a deliberate 24px overlap.
- The before/after transition now alternates indefinitely at a consistent 6.1–6.9s cadence instead of stalling every few cycles.
- Desktop nav no longer wraps at any width; transitions between desktop, compact desktop, and mobile are animated on one shared curve, and respect `prefers-reduced-motion`.
- A double-tap on the estimate submit button can no longer produce duplicate leads or a permanently locked form.
- The FAQ mega menu answers common questions in the nav itself; mobile deliberately stays a short list.

### SEO Improvements

- **15 new indexable pages**: 6 location, 1 FAQ hub, 8 Insights.
- Location pages target the money keyword per city with genuinely local content that fails the city-swap test by design.
- New structured data: `Service` ×6 and `FAQPage` ×6 on location pages, `FAQPage` on the hub, `Article` ×7, `ItemList`, and `BreadcrumbList` on every new page.
- `LocalBusiness` `areaServed` extended with Rowan County so schema matches the advertised coverage.
- Internal linking materially strengthened: mega menu → FAQ hub and service pages; "Where We Work" → location tier; every Insights article → its parent service page and the FAQ; the FAQ hub → all seven service pages.
- Titles and meta descriptions verified unique across all 23 pages.
- **No duplicate FAQ questions introduced**, enforced by a check rather than by memory. The same check surfaced one pre-existing duplicate from Phase 1 (technicalDebt item 10a).

### Lessons Learned

- **A passing test proves nothing until it has failed.** The hero-loop harness only earned trust once it reproduced the reported symptom against the pre-fix code.
- **Wiring an endpoint changes which bugs are real.** The double-submit hole existed all along and cost nothing until the URL was set.
- **Measure instead of estimating when the answer is a number.** Parsing the real font files turned the breakpoint from a judgement call into arithmetic.
- **A rule is only real if something checks it.** `seoPlan.md` had banned duplicate questions since day one; writing the cross-reference check is what turned that into a constraint that shaped the FAQ page.
- **Validators fail in both directions.** Roughly a third of this session's "bugs" were in the checking code; every failure needed reading before acting.
- **The same splice bug twice means the splice needs a home.** `repointServiceLinks()` has now been written twice in two one-shot generators.

### Important Decisions

- **Committed to `phase2a-lead-capture`, never pushed**, so all of this can be reviewed before it reaches `main`.
- **No dollar figures anywhere.** No pricing has been approved; inventing ranges would be a commitment the site cannot honour. Logged as the highest-value client ask.
- **No fabricated publication dates** on Insights — none visible, none in schema, with a comment explaining the omission.
- **Placeholder imagery is marked, not disguised** — real BlueGrid photos standing in, each `TODO:`-commented, and no new external hotlinks added.
- **Before & After was removed from the primary nav** on a literal reading of the brief's four-item order. Flagged for confirmation; it remains reachable from the hero CTA and the footer.
- **The 1150px header breakpoint was left alone** even though the nav restructure gave it 163px of slack, because moving it was outside that request.

---

## Next Session Should Continue Here

**Everything through Phase 2D is complete and committed at `863842c`. The working tree is clean and all eight validation suites pass.**

1. **Read `docs/projectState.md` first.** It carries the repository status, the ordered task list, and who owes what.
2. **The only outright launch blocker is the production domain.** Canonicals say `www.bluegridlandsolutions.com`; `CNAME` says `bluegridlandsolutions.nulostudio.com`. It gates `robots.txt`, `sitemap.xml`, canonical finalization, and Open Graph across **23 pages** — all already `TODO:`-marked so one sweep closes them.
3. **Two zero-engineering checks are outstanding:** one real lead submission from the live site (it emails the owner and the customer, so it was not triggered unilaterally), and **a real browser pass — no session on this project has ever had one.**
4. **Before editing any page programmatically:** line endings are mixed per file (see *Current Repository Status*), and chrome spliced from `services/` needs its seven service links repointed to `../services/…`.
5. **Before adding a nav item:** re-run the header width sweep. There is 163px of slack at 1151px today, and a new label consumes it.
6. **After any `.gs` change:** `node appsScript/localTestRunner.js`, expect `passed: 64  failed: 0`.
7. **New content must clear the uniqueness gate** — under 25% pairwise 5-word-phrase overlap, and no FAQ question may duplicate one already on the site. Current totals: **103 rendered FAQ questions, 102 unique** — the gap is one pre-existing duplicate between `index.html` and `services/landClearing.html`, logged as `technicalDebt.md` item 10a.

---

## 2026-08-04 — Navigation restructure, FAQ hub, and Insights

### Summary

Replaced Reviews with Insights in the primary nav, turned FAQ into a desktop mega menu, and built two new sections: a dedicated FAQ hub and an Insights resource centre with seven launch articles. The site went from 14 pages to **23**.

### Files Created

- `faq/index.html` — 28 questions across 6 categories
- `insights/index.html` — the resource centre landing page
- `insights/{benefits-of-forestry-mulching, brush-hogging-vs-forestry-mulching, when-to-clear-overgrown-property, preparing-land-for-building, storm-cleanup-best-practices, fence-line-clearing-tips, signs-your-property-needs-land-management}.html`

### Files Modified

- All 14 existing pages — nav tail replaced, mobile drawer simplified, footer FAQ link retargeted with Insights added
- `css/styleIndex.css` — `.megaPanelFaq` and its contents
- `css/stylePages.css` — FAQ page and Insights components

### Navigation

Final order is **Services · Service Areas · FAQ · Insights**.

**A judgement call worth flagging:** the brief said to remove Reviews and replace it with Insights, then gave the resulting order as a four-item list that does not include *Before & After*. Read literally that is a complete specification, so Before & After came out of the primary nav. It remains reachable from the homepage hero CTA ("See Transformations") and from the footer Quick Links, so nothing is orphaned — but if the intent was a five-item nav, putting it back is a one-line change.

### FAQ Mega Menu

Nine questions, each a bold question plus a two-sentence preview, two-up in a 760px panel capped against the viewport so it cannot overhang at the narrowest desktop width. A "View All FAQs" CTA sits under a divider.

**The nine items do not all point at the FAQ page.** Several of the most common questions were already answered elsewhere — "What is forestry mulching?" on the homepage and the mulching service page, "Do you remove stumps?" on land clearing, "Do you haul debris away?" on property cleanup. Those link to the page that owns the answer; the rest link to `faq/index.html#anchor`. That keeps the mega menu genuinely useful without restating answers that already exist, which `seoPlan.md` forbids.

Mobile is deliberately two plain links. A mega menu inside a full-screen drawer is worse than a short list, and the brief asked for it to stay simple. A check fails if mega-menu markup ever leaks into the drawer.

### FAQ Page

Six categories — Estimates & Getting Started, Choosing the Right Service, On Your Property, Equipment & Conditions, After the Job, Payment & Paperwork — with a jump-link card grid at the top and the existing accordion component for the answers. Every question anchors individually so the mega menu can deep-link to it. It carries the `FAQPage` schema and links out to all seven service pages.

**All 28 questions are new.** The site already had 75 FAQs across the homepage, service pages, and location pages, and `seoPlan.md` bans duplicate questions across pages. Rather than build a hub that restates and competes with the service pages, the hub took the territory nobody had covered: insurance, deposits, 811 locates, property lines, livestock and gates, ground pressure, weather delays, what the ground looks like afterward, whether the mulch attracts pests. A validator now cross-references all 74 questions elsewhere on the site and fails on any collision.

### Insights

Seven articles, 550–900 body words each, worst pairwise 5-word-phrase overlap **0.3%**. Each has an `Article` schema, a breadcrumb, related-reading cards, a link to its parent service page, and a link back to the FAQ.

**No dates anywhere**, as instructed — no visible date, no `datePublished`, no `dateModified`, no `<time>` element. The schema comment explains why rather than leaving a future reader guessing. A check enforces it.

**Hero and card images are real BlueGrid job photos standing in for topic-specific photography**, each marked with a `TODO: PLACEHOLDER IMAGE` comment in the markup. No new external hotlinks were introduced — `technicalDebt.md` item 6 already complains about the Unsplash ones on the homepage and adding more would have made that worse.

### Validation Performed

- **23 pages, 2,407 internal links and assets, zero broken.** Every same-page and cross-page anchor resolves.
- Nav order verified on all 23 pages by parsing the rendered markup, not by trusting the generator. Reviews confirmed absent from every primary nav.
- Mega menu: 9 questions and 9 previews on every page, CTA present, `aria-expanded` / `aria-controls` / panel id wiring intact, every preview ≤3 sentences.
- Mobile drawer: exactly two items, no mega markup, on all 23 pages.
- FAQ page: all 6 category sections and jump links present, all 28 question anchors present, 28 accordions rendered, every mega-menu deep link resolves, all 7 service cross-links present.
- **Zero duplicate questions** against the 74 elsewhere on the site.
- Insights: every article linked from the landing page, word counts above the thin-content floor, no dates, placeholder images marked, service and FAQ links present.
- Regression suite unchanged: hero seam exact on five viewports, hero loop 92/92 alternating, lead flow contract clean on all 23 pages, header sweep 900–1600 with zero wrapping, `node --check` clean, Apps Script 64/64.

### A Consequence Worth Recording

The new nav is **127px narrower** than the old one (450px vs 577px) — FAQ and Insights are shorter labels than Before & After plus Reviews plus FAQ. The header now needs **1080px** of viewport rather than 1207px, so at 1151px there is **163px of slack** instead of 45px.

The 1150px mobile breakpoint was therefore left alone but is now more conservative than it needs to be: the desktop nav would survive comfortably to roughly 1105px. Moving it was not part of this request and the previous session chose 1150 partly for webfont-fallback margin, so the headroom is recorded in `technicalDebt.md` rather than spent unilaterally.

### Bugs Found

**Mine, caught by the guards**

1. The chrome was spliced from `services/forestryMulching.html`, where the seven mega-menu service links are relative to that folder — so every new page linked to `insights/forestryMulching.html`. The location-page builder had a `repointServiceLinks()` step for exactly this; I forgot it. The link validator caught all 63 instances.
2. Two genuinely unescaped ampersands: the category labels ("Payment & Paperwork") and one `og:title`. The ampersand guard caught both.
3. `when-to-clear-overgrown-property` came in at 537 body words, under the thin-content floor. Added a section on what waiting actually costs.

**In the validator, not the product**

4. The mega-panel check sliced to the first `</li>`, which closes the first question rather than the panel — it reported 1 question on every page.
5. The article uniqueness check measured `<main>`, which includes the shared hero, breadcrumb, related cards, and estimate form. That reported 26.1% overlap for what is almost entirely template. Measuring the prose only gives 0.3%.
6. The "no dates" check matched the schema comment explaining why dates are absent.

### Lessons Learned

- **The same splice bug twice means the splice needs a home.** `repointServiceLinks()` has now been written twice in two different one-shot generators. Phase 13's real generator should own it rather than each script rediscovering it.
- **A duplicate-content rule is only real if something checks it.** `seoPlan.md` has banned duplicate questions since the start; writing the cross-reference check is what turned that from an intention into a constraint, and it shaped the whole FAQ page — the 28 questions are the ones that were left after subtracting 75.
- **Validators fail in both directions.** Three of this session's six "bugs" were in the checking code. A failing check is a hypothesis, not a verdict; each one needed reading before acting.

---

## 2026-08-03 — Header navigation polish

### Summary

The desktop header wrapped between roughly 1100px and 1200px. Tightened the spacing to buy 101px, then moved the mobile-nav switch from 1080px to 1150px, because even fully optimized the bar still could not fit at 1100px.

Measured rather than eyeballed: this session pulled the real Inter and Rokkitt font files and wrote a minimal TrueType metrics parser, so every number below is an advance-width measurement, not an estimate.

### Files Modified

- `css/styleIndex.css` — anti-wrap guards on the base header rules; new `@media (max-width: 1280px)` compact band; new `@media (max-width: 1150px)` mobile-nav switch; the six header rules that used to live in the `1080px` query moved into it

### The Audit

`.headerInner` is a flex row whose items shrink before anything else gives, and nothing in the header carried `white-space: nowrap` — so once the content stopped fitting, the nav links and the phone number broke onto a second line inside a fixed-height bar.

Measured, the full-spacing header needs **1207px** of viewport:

| Part | Width |
|---|---|
| Brand lockup (badge 69 + gap 16 + text 118) | 203px |
| Primary nav — Services 112, Service Areas 150, Before & After 135, Reviews 92, FAQ 62, plus gaps | 577px |
| Phone chip | 171px |
| Free Estimate | 142px |
| Two 25.6px header gaps + 48px padding | 99px |
| **Viewport required** | **1207px** |

The mobile switch sat at 1080px, so **1081–1207px was a 126px-wide band where the desktop nav was live and could not fit.** That is exactly the reported symptom.

### Optimization First

Every requested lever, applied cumulatively and measured:

| Change | Saved |
|---|---|
| Nav link padding `0.95rem` → `0.7rem` | 40px |
| Header gap `1.6rem` → `1.1rem` | 16px |
| Nav list gap `0.4rem` → `0.25rem` | 10px |
| Brand badge `69px` → `60px` | 9px |
| Header padding `1.5rem` → `1.25rem` | 8px |
| Phone chip padding `1rem` → `0.75rem` | 8px |
| Brand lockup gap `1rem` → `0.75rem` | 4px |
| Nav chevron gap `0.4rem` → `0.3rem` | 3px |
| Header actions gap `0.9rem` → `0.7rem` | 3px |
| **Total** | **101px** |

**The `Free Estimate` CTA padding was deliberately left alone.** Shrinking the primary CTA is what makes a header read as cramped rather than tidy, so everything else gave ground first. Nav, phone, and CTA font sizes were also untouched — that would be changing typography. The only type change is the brand mark, which the brief explicitly allowed to shrink and which the stylesheet already shrank at smaller widths.

### The Breakpoint Did Move — and Optimization Alone Was Not Enough

Optimized, the header needs **1106px**. At a 1100px viewport that is still **6px short**. Leaving the switch at 1080px would have left a small but real broken band at 1081–1106px, so the switch moved to **1150px**.

Why 1150 and not 1100 or 1200:

- **1100px fails outright** — 6px of overflow.
- **1130px** is the bare minimum for 24px of slack, with nothing spare.
- **1150px** leaves **45px of slack** at 1151px, the last desktop width. That margin matters because `--fontBody` falls back to `'Segoe UI'`, which is wider than Inter; without headroom the header would wrap during the brief window before the webfont loads.
- **1200px** would work but drops the desktop nav earlier than it needs to, against the instruction to keep it active as long as it stays clean.

1150px keeps the desktop nav on every common laptop width (1280, 1366, 1440, 1600) and on iPad-class landscape viewports of 1180–1194px.

### Two Deliberate Structural Choices

1. **The compact band starts at 1280px, not at the 1207px wrap point.** Crossing 1280 downward therefore makes the bar *roomier* (74px slack → 174px), never tighter. A band that began at the wrap point would have produced a visible snap exactly where the layout was already under strain. Above 1280px nothing changed at all.

2. **The switch is a header-only media query.** The existing `1080px` query also drives the hero, the services grid, and other section layouts. Retargeting the whole query to 1150px would have moved all of that — a redesign of sections nobody asked about. The six header rules were moved out into the new `1150px` query and the `1080px` query kept everything else. A check now fails if a header rule reappears in the `1080px` block.

### Validation Performed

- Downloaded the real **Inter 600/700 and Rokkitt 700** from Google Fonts (legacy UA → EOT, TTF payload extracted from the wrapper) and wrote a `head`/`hhea`/`hmtx`/`cmap`-format-4 parser. Kerning is ignored on purpose: it almost always subtracts width, so omitting it errs wide, which is the safe direction for a fit question.
- **Swept every integer width from 900 to 1600px**, resolving which tokens apply at each and re-measuring. **Zero widths wrap.** The tightest desktop width is **1151px with 45px of slack**.
- All ten requested widths verified: 1600/1440/1366 clean at +153px, 1280 at +174px, 1200 at +94px; 1100/1024/992/900/768 on the hamburger.
- Transition continuity asserted — the compact band must not reduce slack at its own boundary.
- Structural checks: `white-space: nowrap` on `.navLink`, `.phoneChip`, `.headerCta`, `.brandName`, `.brandNameSub`; `flex-wrap: nowrap` on `.navList`; `flex-shrink: 0` on `.primaryNav` and `.headerActions`; the CTA's padding absent from the compact band; the `1150px` query genuinely hiding the nav/phone/CTA and showing the hamburger; no header rule left behind in the `1080px` query.
- Regression suite unchanged: 14 pages / 1,372 links and assets / zero broken; hero seam exact on five viewports; hero loop 92/92 alternating; lead flow contract clean on all 14 pages; `node --check` clean; Apps Script 64/64.

### Not Verified

Still no browser. The arithmetic is measured from the real fonts and the real stylesheet, but nothing was rendered — the mega-panel drop shadows, the hamburger's optical alignment at 1150px, and the general feel of the compact band have not been seen. Covered by `technicalDebt.md` item 18a.

### Follow-up refactor — tokens and a unified morph

Requested after the first commit; no visual change, every measured width reports identical slack.

**Twelve `:root` tokens** replaced the duplicated layout rules: `--headerPadX`, `--headerGap`, `--headerBrandGap`, `--headerBadgeSize`, `--headerBrandNameSize`, `--headerNavGap`, `--headerNavLinkPadX`, `--headerNavChevronGap`, `--headerActionsGap`, `--headerPhonePadX`, `--headerCtaPadX`, `--headerTransition`. The `1280px` and `1150px` queries became **token overrides only**, and the `.brandBadge` / `.brandName` rules that were duplicated in the `1150px` and `640px` queries are gone — both sizes now come from tokens, so all four header states are described in one vocabulary. Only header variables were added; nothing existing was refactored.

`--headerCtaPadX` exists specifically so the CTA's constancy is explicit rather than incidental. A check fails if any breakpoint overrides it.

**One shared timing.** Every dimension that differs between states animates on `--headerTransition` (`0.35s var(--easePremium)`), matching what `.siteHeader` already used for its scrolled background: `.headerInner` gap/height/padding, `.brandLockup` gap, `.brandBadge` width/height, `.brandName` font-size, `.navList` gap, `.navLink` gap/padding, `.headerActions` gap, `.phoneChip` padding. Hover colour keeps its quicker 0.25s timing — only layout properties ride the shared curve.

The switch itself cannot animate: `display` is not interpolable and there is no honest tween from a five-item nav to a hamburger. But the bar's height, logo, and padding still ease across it, so 1150px reads as the header resolving into its compact form rather than a jump cut.

`prefers-reduced-motion` sets `--headerTransition: 0s`, which kills the entire morph in **one declaration** because every rule shares the token.

New checks: every token is actually consumed by a header rule (an orphaned token is worse than a hardcoded value); no breakpoint overrides `--headerCtaPadX`; all eight rules animate their layout properties on `var(--headerTransition)`; reduced motion zeroes it; no `.brandBadge`/`.brandName` rule survives in the `1150px` or `640px` queries.

Verified at 1600/1440/1366/1280/1200/**1151**/**1150**/1100/1024/992/900/768 — desktop widths clean at +153/+153/+153/+174/+94/+45, hamburger below. Sweep of every integer width 900–1600 still reports zero wrapping and the same 45px tightest slack.

### Lessons Learned

- **A token nothing reads is worse than a hardcoded value.** The refactor's first check verifies each custom property is actually consumed, because the failure mode of "tokenize everything" is a variable that silently does nothing while looking authoritative.
- **"Reduce the spacing" and "move the breakpoint" were not alternatives.** The brief framed them as a fallback chain, and measuring showed both were needed: optimization alone still left a 6px deficit at 1100px. Without numbers it would have been easy to ship the tightening, feel that it looked better, and leave a narrow broken band behind.
- **Font files are gettable, so text width is measurable.** Guessing average character widths would have put the answer off by enough to pick the wrong breakpoint. An hour of TrueType parsing turned a judgement call into arithmetic.
- **Start a compact band above the point where it is needed.** Putting the boundary at 1280 rather than 1207 means the adjustment lands where there is still slack, so it reads as a smooth change rather than a rescue.

---

## 2026-08-03 — Phase 2D: live Apps Script backend connected

### Summary

The production Web App URL is wired into `businessConfig.estimateEndpoint` and lead capture is live. **This closes the project's oldest and largest launch blocker** — since Phase 1 the form had been showing visitors a confirmation while discarding their request.

The endpoint was already architected as a single shared value, so no refactor was needed; the audit below proves that rather than assuming it. The code review that followed the wiring found one real defect, which is fixed.

### Files Modified

- `js/indexJS.js` — production `/exec` URL set in `businessConfig`; double-submit guard added (`estimateSubmissionInFlight`, `endEstimateSubmission()`); `leadId` held stable for the page load via `currentEstimateLeadId`

### Single Source of Truth — audited, not assumed

The endpoint appears **exactly once** in shipped code. All 14 pages load the same `js/indexJS.js`, and there is **exactly one `fetch()` call site**, which builds its URL from `businessConfig.estimateEndpoint + '?action=leads.create'`. No page inlines a handler; every `<form>` carries `action="#"` and is JS-handled. A future redeployment is a one-line change.

Checks now enforce this: one live URL in shipped code, one `fetch()` call site, no hardcoded endpoint in any HTML/CSS, every page loading the shared script, and no form posting anywhere.

### Defect Found and Fixed — duplicate leads on a double-tap

`submitEstimateRequest()` had no in-flight guard. `isLoading` was a cosmetic class; the button was never `disabled` and nothing checked whether a request was already running. Worse, `buildEstimatePayload()` minted `leadId: 'BG-' + Date.now()` **on every call**, so two taps produced two *different* leadIds — and the API's dedupe is keyed on `leadId`, so it could not collapse them.

Result, had this shipped: one visitor double-tapping the submit button (on mobile, under a thumb) produces **two rows in the client's sheet, two owner emails, two customer auto-replies**, and burns double the MailApp quota — which is only ~100 recipients/day on consumer Gmail.

This was harmless while the endpoint was empty, because the unconfigured branch never made a request. **Wiring the endpoint is what made it real**, which is exactly why the review was worth doing after the wiring rather than before.

Fix:
- `estimateSubmissionInFlight` short-circuits a second call.
- The button is genuinely `disabled` for the duration, so Enter cannot re-trigger it either.
- `endEstimateSubmission()` releases the lock, and is called on **all three** terminal paths — unconfigured, resolved, rejected — so a failed attempt can still be retried rather than locking the form forever.
- `currentEstimateLeadId` holds the id steady for the page load, so a retry after a network failure carries the *same* id and the server's dedupe collapses it into the original row. Holding it for the page load is correct because the flow allows one submission per load: once the success panel shows, reopening the modal shows the panel again, not a blank form.

### Validation Performed

**Live, against the production endpoint** (zero side effects on the client's sheet or inbox):

- `GET ?action=ping` → `200` `{"success":true,"data":{"module":"forestryModule","clientId":"bluegrid","version":"1.0.0",…}}`. The identity triple matches `config.gs` exactly, confirming the deployed script is the code in this repo.
- `GET ?action=leads.explode` → `UNKNOWN_ACTION`
- `GET ?action=leads.list` with no key → `UNAUTHORIZED`
- `POST ?action=leads.create` with the honeypot filled → `200` `{"success":true,"data":{"lead":{"leadId":"BG-…"},"honeypot":true}}`. This exercises the **entire real transport chain** — `text/plain` body, no CORS preflight, Apps Script's 302 to `script.googleusercontent.com`, JSON envelope — while `handleCreateLead` short-circuits before writing a row or sending mail. A genuine end-to-end test with nothing to clean up afterward.

**Static contract check** (`validateLeadFlow.js`), covering all 14 pages:

- 20 payload keys, every one mapping to a `LEADS_HEADERS` column except the honeypot; **no server-owned column** (`photoUrls`, `propertySize`, `terrainType`, `status`, `estimateAmount`, `assignedTo`, `internalNotes`, `lastUpdated`) is ever sent by the client
- All 5 `REQUIRED_CREATE_FIELDS` present
- `HONEYPOT_FIELD` in `config.gs` matches the input's `id` **and** `name` on all 14 pages, each wrapped in an `aria-hidden` container with `tabindex="-1"` and `autocomplete="off"`, exactly one per page
- Every `serviceNeeded`, `preferredTime`, and `preferredContactMethod` value offered in HTML is in `ENUM_VALUES`; the `preferredContactMethod` fallback is itself a legal enum
- All 9 element ids `buildEstimatePayload()` reads exist on all 14 pages — it calls `getElementById(...).value` without null guards, so a missing one would throw at submit
- All 6 field-error targets referenced by `showSubmissionError()` exist on all 14 pages
- Transport stays `POST` + `text/plain`; `routes.gs` registers `leads.create` as POST with no auth
- Response handling covers non-200, the success envelope, the error envelope, and network rejection; `VALIDATION_ERROR` matches `ERROR_CODES.validation`
- The client honeypot check runs **before** the fetch
- `leadId` format satisfies the server's own `isValidLeadId` regex, extracted from `validation.gs` rather than hardcoded

Regression suite unchanged: 14 pages / 1,372 links and assets / zero broken; hero loop 92/92 alternating; hero seam exact on five viewports; `node --check` clean; Apps Script harness 64/64.

### Not Verified

- **A real lead was never created.** That path writes a row and emails both the owner and the customer, so it is not mine to trigger unilaterally. The deployment reportedly passed it during setup; it should be re-run once from the live site as the final pre-launch check.
- **Whether `MODULE_API_KEY` is actually set** cannot be determined from outside — `leads.list` returns `UNAUTHORIZED` identically whether the key is missing or simply not supplied. Only `leads.list`/`leads.update` (the Phase 2 dashboard) depend on it; the public form does not.
- **Still no browser.** Same limitation as Phase 2C: no rendered check of the form UI on a real device.

### Lessons Learned

- **Wiring an endpoint changes which bugs are real.** The double-submit hole existed for the whole project and cost nothing, because the unconfigured branch never issued a request. It became a live data-integrity defect the moment the URL was set. Reviewing the flow *after* the wiring, as instructed, is what surfaced it.
- **The honeypot path is a free production smoke test.** It exercises the complete transport — content type, preflight avoidance, redirect, envelope — and by design writes nothing and sends nothing. Worth remembering for any Apps Script backend that has one.
- **"Single source of truth" is a claim to verify, not to assert.** The endpoint really was already in one place, but the check that proves it is what keeps it in one place through the next change.

---

## 2026-08-03 — Phase 2C: hero mobile refinement

### Summary

Three defects in the homepage hero, all fixed at the cause. The hero background no longer grows with the estimate form on mobile; the before/after transition alternates forever instead of desyncing after a few cycles; and the updated `hero_after` asset's filename casing was normalized so it cannot break on a case-sensitive host.

No redesign, no typography change, and the typing animation was not touched.

### Files Modified

- `css/styleIndex.css` — hero media layer decoupled from section height in the `1080px` query; new `.heroSection::after` estimate band; `.heroOverlay` now lands on solid `--colorNearBlack` at the seam; `.heroContent` given the `min-height` that used to sit on `.heroSection`; `.estimateFormCard` rides up over the seam. The `640px` query's `.heroContent` min-height tracks its tighter top padding
- `js/indexJS.js` — `fireHeroReverseDissolve()` became `fireHeroReverseDissolveAndWait()` and is now awaited; `fireHeroForwardSweepAndWait()` gained an `error` fallback
- `index.html`, `locations/forestry-mulching-ashland-ky.html` — `hero_after.JPG` → `hero_after.jpg` (3 references)
- `graphics/images/hero_after.JPG` → `graphics/images/hero_after.jpg` (git rename)

### Issue 1 — hero background ran past the fold on mobile

**Cause.** `.heroMedia` was `position: absolute; inset: 0`, so its height was the *section's* height. At `1080px` and below `.heroInner` collapses to one column and the estimate card stacks beneath the hero copy, roughly doubling the section. The photograph faithfully stretched to cover all of it. Reducing the hero height would not have fixed this — the coupling was the defect.

**Fix.** Stop letting section height drive the picture:

1. `.heroMedia` is pinned top-only (`inset: 0 0 auto`) with an explicit `height: var(--heroMediaHeight)`.
2. `--heroMediaHeight` is declared once on `.heroSection` as `100vh` then `100lvh` (cascade fallback for browsers without `lvh`). `lvh` keeps the picture covering the viewport in every browser-chrome state. One number drives the media band, the copy block, and the estimate band.
3. `.heroContent` carries `min-height: calc(var(--heroMediaHeight) - var(--headerHeight) - 3rem)` — this is the `min-height` that used to live on `.heroSection`, moved onto the block it actually describes. It makes the copy end exactly on the seam whatever it measures, so the card always arrives at the fold.
4. `.heroSection::after` paints the estimate band from `var(--heroMediaHeight)` to the section bottom, opening in `--colorNearBlack` and settling into `--colorCharcoal` — its own background, starting in the exact colour the photograph fades into.
5. `.estimateFormCard` gets `margin-top: -4.5rem` against the `3rem` grid gap, so it rides 24px up over the seam for the layered edge.

**The fade is on `.heroOverlay`, not on `.heroPlate`.** The obvious approach — a bottom `mask-image` on the plates — would have overwritten `.heroPlateAfter`'s `mask-image`, which *is* the sweep animation. Putting the fade in the overlay's existing 180deg gradient (final stop `var(--colorNearBlack) 100%`) reaches the same result, improves contrast under the stats, and leaves the sweep alone. A validator check now asserts no mobile `.heroPlate` rule sets `mask-image`.

Desktop is untouched: every one of these rules lives inside the `1080px` query, and `--heroMediaHeight` does not exist above it.

### Issue 2 — before/after stopped alternating

**Cause.** `fireHeroReverseDissolve()` was fire-and-forget. It set `isDissolving`, then scheduled cleanup — remove `isRevealed`, remove `isDissolving`, under `isResetting` so nothing transitions — on a `1800ms` timer. The loop, however, only waited `emptyBreathMs` (220ms) before starting the next phrase.

So the cleanup timer from cycle N could fire *during* cycle N+1. When it did, it stripped the `isRevealed` that N+1 had just added: the AFTER plate snapped away mid-sweep and the next reveal had to wait a full phrase. That is exactly the reported "Before → After → Before → long pause → starts again". Whether a given cycle collided depended on phrase length, which is why it looked intermittent.

**Fix.** The dissolve now returns a promise that resolves only once the plate is fully back to BEFORE with its classes clean, and the loop awaits it. The cycle is strictly sequential and no timer can outlive the cycle that created it.

The dissolve's own timer stays deliberately unpaused. The CSS opacity transition cannot pause either, so an in-flight dissolve always finishes — which is the etiquette the existing comment describes. The loop takes its pause at the breath that follows.

Also hardened `fireHeroForwardSweepAndWait()`: it waited on the AFTER plate's `load` event when the image was not ready, so an image that failed to load would leave the promise unresolved and the hero dead forever. It now resolves on `error` too, degrading to a BEFORE-only hero rather than stopping.

### Issue 3 — hero image

`graphics/images/hero_after.JPG` was replaced with a new 549KB image in `fb15070`, but it arrived on disk as `hero_after.jpg`. Windows is case-insensitive so git kept tracking the uppercase name while the working tree held the lowercase one. Nothing was broken today, but GitHub Pages is case-sensitive and the mismatch was one careless `git add` away from a 404 on the homepage hero.

Normalized via a two-step `git mv` and updated all 3 references. Both plates are `2048x1536` and both declare `width="2048" height="1536"`, so the swap is ratio-identical — no distortion, no layout shift.

### Validation Performed

- **Hero loop harness** — loaded the real `js/indexJS.js` into a VM with mocked DOM and a virtual clock, ran the actual `runHeroDuetLoop()` for **10 minutes of page time**, and recorded every class mutation on the AFTER plate.
  - Fixed code: **92 complete cycles, perfectly alternating**, cadence **6.13s min / 6.50s avg / 6.94s max**, zero clipped reveals. The sub-second spread is the randomized per-character typing speed, which is the intended human feel.
  - **The same harness run against the pre-fix code from `HEAD` fails**: 90 of 108 reveals cut short by a stale reset (the worst held the AFTER plate for 58ms), cadence swinging 4.32s–9.74s. The test demonstrably catches the bug it claims to fix.
- **Hero layout validator** — parses the real stylesheet, extracts the placement declarations, and computes the seam on five viewports. At 360×640, 390×844, 430×932, 768×1024, and 1024×1366 the copy block ends **exactly** on the media seam (0px error) and the card overlaps it by **24px** every time. Also asserts desktop is untouched, the media layer is bounded, the band opens in the seam colour, and no mobile rule overwrites the plate mask.
- Sitewide validator unchanged: 14 pages, **1,372 links and assets, zero broken**.
- `node --check js/indexJS.js` clean; `styleIndex.css` braces balanced; Apps Script harness still **64/64**.

### Honest Limitation

**No browser was run.** This environment has no Playwright or Chrome DevTools MCP, so there are no screenshots and no real rendered measurement. Everything above is static analysis plus a faithful simulation of the shipped JavaScript. The geometry and the loop are verified; the *look* of the seam on a real device is not. Someone should open the homepage on a phone before launch — that check is listed in `technicalDebt.md`.

### Lessons Learned

- **A passing test proves nothing until it has failed.** The loop harness was worth writing only because running it against the old code reproduced the exact reported symptom. Before that it was decoration.
- **The first harness run found my own bug, not the product's.** It reported two concurrent loops; `indexJS.js` already calls `initializeHeroDuet()` at module scope, and the harness called it again. Reading the trace rather than trusting the summary is what caught it.
- **When a layer's size is wrong, look at what is driving it.** The instruction not to simply reduce the hero height was the right call: an absolutely-positioned `inset: 0` layer is coupled to its container's content, and every fix that is not decoupling is a workaround.

---

## 2026-08-02 (session 2) — Phase 2A verification + Phase 2B service area pages

### Summary

Verified Phase 2A was genuinely finished rather than trusting the previous entry, then built Phase 2B's first wave: **six forestry mulching location pages** covering the cities `seoPlan.md` stages as the Phase 7 build set, and wired every service-area link on the site to them.

Phase 2A needed no code. The harness still reports 64/64, the deployment runbook is complete, and `estimateEndpoint` is still empty — exactly the state the previous session described. The only remaining 2A work is the Google Apps Script deployment, which requires credentials no engineering session has.

The site went from "13 cities advertised in the nav, all 13 pointing at one anchor" to "6 real, locally specific landing pages that a competitor cannot produce by find-and-replace."

### Files Created

**Location pages** (`locations/`)
- `forestry-mulching-ashland-ky.html`
- `forestry-mulching-portsmouth-oh.html`
- `forestry-mulching-ironton-oh.html`
- `forestry-mulching-chillicothe-oh.html`
- `forestry-mulching-grayson-ky.html`
- `forestry-mulching-morehead-ky.html`

### Files Modified

- `index.html` — 6 mega-menu cities and 6 mobile-menu cities repointed at their pages; 6 footer cities became links; new "Forestry mulching, town by town" block added inside `#serviceAreas`; Rowan County added to `LocalBusiness` `areaServed`, the static map panel list, and both copies of the "Do you travel to my county?" answer
- `services/forestryMulching.html` — same 18 chrome link changes, plus a new **"Where We Work"** section linking all 6 location pages. This is the parent page for the location tier and the only place body content links down to it
- `services/{landClearing,brushRemoval,trailCutting,stormCleanup,propertyCleanup,huntingPropertyPrep}.html` — 18 chrome link changes each
- `css/stylePages.css` — activated the dormant `SERVICE AREA PAGES (locations/)` block; added `.localSection`, `.localProse`, `.localProblemGrid`; changed `.nearbyList` from styling `a` to styling `li`
- `css/styleIndex.css` — `.serviceAreaTowns` / `.serviceAreaTownsLabel` / `.serviceAreaTownList` for the new homepage block
- `js/indexJS.js` — `rowan` added to `serviceRegions`, TODO-marked for client confirmation

### Architecture Decisions

1. **Six pages, not thirteen.** `seoPlan.md` rows 1–6 with genuinely local content, over 13 pages that would read as doorway pages. The nav advertises 13 cities; the 7 without pages still point at the `#serviceAreas` anchor rather than getting a shell.
2. **Reused the existing tier, added nothing structural.** `css/stylePages.css` already carried an unused `.localFactGrid` / `.localServiceList` / `.nearbyList` block, and `getSourcePage()` in `js/indexJS.js` already special-cased a `locations/` folder — the previous session pre-wired for this. Three new CSS rules were all the tier needed.
3. **Location pages link up, never sideways.** Per `seoPlan.md`'s Internal Linking Map: each page links to its parent service page, the homepage, and all 7 services. Nearby towns are rendered as plain text pills, which is why `.nearbyList` was changed from styling `a` to styling `li`. A validator check enforces this on the `<main>` content of every location page.
4. **Sitewide chrome does link to location pages, deliberately.** `seoPlan.md` rule 4 explicitly blesses "an inbound link from the mega menu", and making the shared header page-type-dependent across 14 files would be a maintenance trap. The no-sideways-links rule is enforced where it matters — body content.
5. **Breadcrumb is Home › Forestry Mulching › City,** not the `seoPlan.md` sketch of Home › Locations › Page. There is no `locations/` hub page yet (that is Phase 13), so a "Locations" crumb would have pointed at nothing. Every crumb in the shipped version resolves.
6. **No dollar figures.** `seoPlan.md` content rule 5 asks for real cost ranges, and no pricing has been approved by the client — the 7 existing service pages quote none either. Each cost FAQ instead answers with the factors that move the price on that county's specific ground, which is honest and still locally unique. Logged as a client ask, because supplying ranges is the single strongest upgrade available to these pages.
7. **No galleries on location pages.** 13 photos exist for 14 pages and none can be honestly captioned to a named town. Consistent with the Phase 1 decision on `stormCleanup` and `huntingPropertyPrep`.
8. **The assembler stays in the scratchpad.** Pages were generated once from a guarded splice of `services/forestryMulching.html` plus a content data file, then committed as plain static HTML — the same technique the previous session used. It is deliberately **not** checked in: Phase 13 (`phasePrompts/phase13ServiceAreaExpansion.md`) builds the real generator, and shipping a half-generator now would leave two competing sources of truth.
9. **Rowan County added to the coverage data.** Morehead was advertised in the nav on all 8 pages but Rowan County appeared in none of the four places the site lists counties. Publishing a Morehead page while the schema denied coverage would be worse. Added and TODO-marked rather than silently expanded.

### Validation Performed

- **14 pages, 1,372 internal links and assets checked, zero broken.** Every same-page anchor resolves to an id on that page; every cross-page anchor resolves to an id on the target page
- One `<h1>` per page; zero duplicate IDs; tag balance verified across 16 element types
- Every JSON-LD block parses; every `FAQPage` question is verified to actually render in the markup
- Titles and meta descriptions **unique across all 14 pages**
- `serviceNeeded` enum identical across all 14 pages and `appsScript/config.gs` (compared on values, since the homepage uses CRLF and interior pages LF)
- Every location page preselects `Forestry Mulching` in the embedded form
- Each built city has at least 3 links per page (mega menu, mobile menu, footer); no built city still points at `#serviceAreas`; all 6 are reachable from the parent service page
- **Uniqueness gate:** worst pairwise 5-word-phrase overlap between location pages is **14.7%** against a 25% threshold; body copy 1,133–1,283 words per page
- CSS braces balanced in both stylesheets; every class used in new markup exists in a stylesheet
- `node --check js/indexJS.js` clean
- `node appsScript/localTestRunner.js` — **64/64**, `runSelfTest` 6/6, unchanged
- CTA destinations enumerated on a finished page and confirmed: hero and floating estimate → `#estimateForm` (present), phone → `tel:` with `data-confighref`, footer "View Our Work" → `../index.html#beforeAfter`, Facebook → the real page

### Bugs Found

**Introduced by me during this session, caught by the guards**

1. Generated pages shipped **mixed line endings** — CRLF from the template literals in the generator, LF from the chrome spliced out of `services/forestryMulching.html`. Normalized to LF to match the sibling `services/*.html` files.
2. The first build aborted on an unescaped-ampersand guard that was matching `META & SEO` inside HTML comments. The guard was wrong, not the output — fixed to strip comments before checking.
3. The `serviceNeeded` drift check compared raw text and flagged all 13 interior pages. The enum values were identical; only indentation and line endings differed. Fixed to compare normalized values.
4. `.nearbyList` carried a `2rem` top margin from the previous session, which stacked with the `3.2rem` bottom margin of the `.sectionLede` above it. Changed to `0 0 2.4rem`.

**Pre-existing, found but not in scope**

5. `servicePageArchitecture.md` says the current service should be highlighted in the mega menu on its own page. It is not — the header block is byte-identical across all 7 service pages. Logged in `technicalDebt.md`.

### Important Decisions Made

- **Morehead was kept in the first wave** even though Rowan County sat outside the documented coverage map, because `seoPlan.md` lists it as row 6 and the nav has always advertised it. The coverage data was corrected to match rather than the page being dropped.
- **West Union, OH and Flatwoods, KY are advertised in the nav but appear nowhere in `seoPlan.md`'s 11-city table.** Not resolved this session — flagged in `projectState.md` as a decision: give them pages or take them out of the nav.
- **`locations/` was the only new folder created**, and it is the folder `servicePageArchitecture.md` and `seoPlan.md` both specify.

### Lessons Learned

- **A dormant CSS block is a design decision left in the repo.** `stylePages.css` had `.localFactGrid`, `.localServiceList`, and `.nearbyList` written and unused. Reading them first shaped the page anatomy and meant three new rules instead of a new stylesheet.
- **Write the uniqueness test before writing the pages.** A 5-word-shingle overlap check turns "don't build doorway pages" from an intention into a number. 14.7% against a 25% gate is a fact; "these feel different" is not.
- **Guards catch your own mistakes, not other people's.** All four bugs this session were mine, and three were caught by assertions written before the code ran. The mixed-line-endings one was caught by an audit added only because the enum comparison failed for an unrelated whitespace reason — worth remembering that a false positive can still point at something real.
- **A validator that only checks the new work is worth half as much.** Running the link and structure checks across all 14 pages, not just the 6 new ones, is what confirmed the chrome rewiring landed identically everywhere.

---

## 2026-08-02 — Website completion + lead capture infrastructure

### Summary

Two phases in one session. **Phase 1** completed the website: built the 7 missing service pages that fixed 28 broken links, removed the fabricated review carousel, and repurposed the homepage's second section into a video-ready owner introduction. **Phase 2A** built the entire lead capture backend: a modular Apps Script web app, an `errorLog` sheet, owner-only email notification, and a Node test harness proving the pipeline works before deployment.

The site went from "every Learn More link 404s and the contact form fakes success" to "code-complete, pending one deployment URL."

### Files Created

**Website**
- `services/forestryMulching.html`
- `services/landClearing.html`
- `services/brushRemoval.html`
- `services/trailCutting.html`
- `services/stormCleanup.html`
- `services/propertyCleanup.html`
- `services/huntingPropertyPrep.html`
- `css/stylePages.css`

**Apps Script**
- `appsScript/Code.gs` — entry points, `setupSpreadsheet()`, `removeObsoleteConfigKeys()`, `runSelfTest()`
- `appsScript/routes.gs` — action registry
- `appsScript/leads.gs` — `LEADS_HEADERS`, create/list/update
- `appsScript/validation.gs` — sanitization, validators, honeypot, formula-injection defense
- `appsScript/notifications.gs` — owner email, auto-reply
- `appsScript/utilities.gs` — sheet access, header enforcement, config, envelopes, auth, error logging
- `appsScript/config.gs` — constants, enums, limits, error codes
- `appsScript/localTestRunner.js` — Node mock harness (dev tool; not pasted into Apps Script)
- `appsScript/README.md`

**Docs**
- `docs/googleSheetArchitecture.md`
- `docs/projectState.md`
- `docs/engineeringJournal.md`
- `docs/technicalDebt.md`

### Files Modified

- `index.html` — reviews section replaced and relocated; second section repurposed to `#meetTheOwner`; divider added between Facebook and Reviews
- `css/styleIndex.css` — marquee CSS removed (102 lines); intro-section and reviews-placeholder styles added; `.introLayout` responsive rule
- `js/indexJS.js` — intro video config + `buildVideoEmbedSource()` + `initializeIntroVideo()`; null guards on every page-specific listener; `getSourcePage()` folder fix; `companyWebsite` added to payload; `showSubmissionError()`; endpoint TODO promoted to a blocker note; Google link hidden when unconfigured

### Architecture Decisions

1. **Static duplication of shared chrome across pages.** No build step exists, so header/modal/footer/floating actions are duplicated into each service page. Mitigated by generating them from `index.html` via a guarded assembler rather than hand-copying, and by `applyBusinessConfig()` driving phone/email/social from one place at runtime.
2. **Each service page embeds the full estimate form + modal** rather than deep-linking to the homepage form. Follows `servicePageArchitecture.md` and preserves in-page conversion.
3. **Sheet-first lead capture.** The `leads` row is the audit trail; a submission succeeds the moment it commits. Notifications run after, wrapped independently, and cannot un-succeed a saved lead.
4. **`errorLog` only, no ActivityLog.** The `leads` sheet already records every success; a second log of successful traffic would add noise and quota cost without adding information.
5. **Owner-only notification.** Nulo Studio is not copied and does not sit in the customer's email thread. Operational problems surface in `errorLog` instead of an inbox.
6. **`text/plain` transport retained.** Apps Script web apps cannot answer a CORS preflight; `application/json` would trigger one and fail from the browser. Encoded the constraint rather than fighting it.
7. **Apps Script lives inside this repo** at `appsScript/`, not the external `C:\Dev\NuloWorkspace\BlueGridAPI\` path named in `phase10AppsScriptApi.md` — that path is outside the writable workspace.

### Validation Performed

- All 7 `.gs` files parse cleanly; **72 globals, zero collisions** (Apps Script shares one global scope, so this matters)
- `js/indexJS.js` passes `node --check`
- `css/styleIndex.css` braces balanced 523/523
- All 8 HTML pages: tags balanced across 12 element types, exactly one `<h1>` each, **zero duplicate IDs**, zero leftover build tokens
- **Zero broken internal links or missing assets** sitewide
- `serviceNeeded` enum **byte-identical** across all 8 pages and `config.gs`
- All 20 payload keys map to columns; all 8 server-authoritative fields correctly excluded from client input
- `LEADS_HEADERS` = 27 columns, matching `forestryModuleSchema.md` exactly
- **`localTestRunner.js`: 64/64 passing**, including built-in `runSelfTest` 6/6 — covers setup idempotency (3 runs), create, dedupe, honeypot, every validation rule, error logging, formula injection, header self-heal, auth, update, `NOT_FOUND`, `UNKNOWN_ACTION`
- Two guarantees explicitly tested: **email failure still saves the lead**, and **no Nulo Studio address appears in any sent message**

### Bugs Found

**Pre-existing**
1. 28 broken links — every service link sitewide 404'd
2. Contact form silently faked success; leads went nowhere
3. Footer Google icon was a live `href="#"` with `target="_blank"` — opened a blank tab
4. `getSourcePage()` collapsed folders, so all service-page leads would have reported ambiguous source pages
5. Unguarded JS listeners would throw on any page without the modal
6. `viewWorkButton` called `.scrollIntoView()` on a null `#beforeAfter` on subpages
7. 102 lines of dead marquee CSS
8. Badge artwork reads **"FORESTRV"** instead of "FORESTRY" (verified against `bluegridBadge400.png`)

**Introduced by me during this session, caught in review**
9. `<figcaption>` nested inside a `<div>` instead of being a direct child of `<figure>` — invalid HTML
10. `sanitizeText()` control-character regex was written with **literal raw control bytes** (0, 8, 11, 12, 31, 127) embedded in the source, producing a malformed character class
11. Notification failures could fall through to the outer catch and report **failure for a lead that was already written**
12. `setupSpreadsheet()` did not create the `dashboardMetrics` tab
13. After generalising `enforceCanonicalHeaders(sheet, headers)`, two lines still referenced `LEADS_HEADERS` — the `errorLog` sheet would have had its headers rewritten on **every single access**
14. Referenced `.introAside` / `.introCta` classes that were never styled
15. Unused `failNextSheetWrite` left in the test runner

### Bugs Fixed

All fifteen above, except **#8 (FORESTRV typo)**, which requires corrected artwork from the client and is logged in `technicalDebt.md`.

### Important Decisions Made

- **Reviews placeholder placed after the Facebook section** (user-approved from three options), with a `dividerFadeUp` added — this also fixed a pre-existing abrupt dark→light transition
- **Client supplied the reviews copy** mid-session; used verbatim, with brand spelling normalised to "BlueGrid" for sitewide consistency
- **Section slot preserved, not deleted** — the second section was repurposed into the video section; only the 24 fabricated review cards were removed
- **Nulo Studio notification removed** after initially being implemented as a `cc` (client direction)
- **Committed to branch `phase2a-lead-capture`, not `main`**, so the work can be reviewed before merging. Nothing pushed
- **Single commit covering both phases** — `js/indexJS.js` contains changes from both, and splitting would have required interactive hunk staging

### Lessons Learned

- **Boundary guards are worth the extra step.** After a user request, every removal/replacement over 50 lines asserted expected content at each boundary and threw on mismatch. This caught nothing silently and made a 406-line deletion and a 278-line CSS replacement safe.
- **Refactoring a function signature demands re-reading the body.** Bug #13 (`enforceCanonicalHeaders`) parsed fine, passed a syntax check, and would have quietly corrupted the `errorLog` headers forever. Only reading the refactored body caught it.
- **Write literal control characters as escapes.** Bug #10 survived a file write and looked plausible; only a byte dump revealed raw control bytes in the regex.
- **Verify before asserting.** The "FORESTRV" typo came from prior project notes; it was confirmed by opening the actual PNG rather than repeating the claim.
- **A mock harness pays for itself immediately.** Being able to run the real `.gs` modules on Node found real defects and proved both client-mandated guarantees without a Google account.
- **Shell command length is a real limit.** A single large PowerShell here-string failed with `ENAMETOOLONG`; the fix was a token-based approach — write the page with the file tool, then splice shared chrome with a short reusable command.
- **VM contexts don't expose top-level `const`.** Function declarations become properties of the sandbox; `const` does not. Needed an explicit re-export bootstrap in the test runner.

---

## Superseded Handoff (2026-08-02)

The handoff block that stood here described Phase 2A as the frontier and the
endpoint as unwired. Both are long since done. **The current handoff is the
"Next Session Should Continue Here" block at the top of this file**, under the
2026-08-04 session summary. Kept as a marker so a reader who scrolls to the
bottom is not misled by stale instructions.
